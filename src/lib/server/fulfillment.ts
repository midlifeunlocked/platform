/**
 * Fulfillment — the access seam (PROJECT_SPEC §7, §8, §13). Given a successful
 * Stripe PaymentIntent (or a refund), it grants/revokes entitlements and records
 * purchases through the service-role client. Pure functions that take the client
 * as a parameter (no env imports) so they are unit-testable in isolation.
 *
 * Idempotency:
 *  - the webhook dedupes events via sync_events (PK = event id)
 *  - purchases upsert on (payment_intent, product); entitlements on (user, product)
 *  so replays converge instead of duplicating.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

// Minimal shapes — we read only the fields we need from Stripe objects.
type PaymentIntentLike = {
  id: string;
  currency?: string;
  payment_method?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
};
type ChargeLike = { payment_intent?: string | { id: string } | null };

/** Find an existing user by email, or create the auth user (trigger makes the profile). */
export async function ensureUser(db: SupabaseClient, emailRaw: string): Promise<string> {
  const email = emailRaw.toLowerCase();

  const { data: existing } = await db.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true });
  if (error || !data?.user) {
    // Lost a race (created between check and now) — re-read.
    const { data: again } = await db.from('users').select('id').eq('email', email).maybeSingle();
    if (again) return again.id as string;
    throw error ?? new Error('could not create user');
  }
  return data.user.id;
}

/** Grant access + record purchases for every product covered by a paid PaymentIntent. */
export async function fulfillPaymentIntent(db: SupabaseClient, pi: PaymentIntentLike): Promise<void> {
  const meta = pi.metadata ?? {};
  const slugs = String(meta.product_slugs ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const email = String(meta.email ?? '').toLowerCase();
  const sessionId = meta.funnel_session_id ?? null;
  if (!slugs.length || !email) return; // not one of our funnel PaymentIntents

  const userId = await ensureUser(db, email);
  const paymentMethodId = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id ?? null;

  // Map product slug → funnel role (for purchases.kind), and persist the saved
  // card + buyer to the session so the one-click upsell can charge off-session.
  const roleBySlug: Record<string, string> = {};
  if (sessionId) {
    const { data: session } = await db.from('funnel_sessions').select('funnel_id').eq('id', sessionId).maybeSingle();
    const funnelId = session?.funnel_id ?? null;
    if (funnelId) {
      const { data: offers } = await db.from('offers').select('role, products(slug)').eq('funnel_id', funnelId);
      for (const o of offers ?? []) {
        const slug = (o as { products?: { slug?: string } }).products?.slug;
        if (slug) roleBySlug[slug] = (o as { role: string }).role;
      }
    }
    await db.from('funnel_sessions').update({
      user_id: userId,
      stripe_payment_method_id: paymentMethodId,
      current_step: 'purchased',
      updated_at: new Date().toISOString(),
    }).eq('id', sessionId);
  }

  const { data: products } = await db.from('products').select('id, slug, amount_cents').in('slug', slugs);
  for (const p of (products ?? []) as { id: string; slug: string; amount_cents: number | null }[]) {
    await db.from('purchases').upsert(
      {
        user_id: userId,
        product_id: p.id,
        stripe_payment_intent_id: pi.id,
        amount_cents: p.amount_cents,
        currency: pi.currency ?? 'usd',
        status: 'paid',
        funnel_session_id: sessionId,
        kind: roleBySlug[p.slug] ?? null,
      },
      { onConflict: 'stripe_payment_intent_id,product_id' },
    );

    await db.from('entitlements').upsert(
      {
        user_id: userId,
        product_id: p.id,
        access_type: 'lifetime',
        status: 'active',
        granted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_id' },
    );
  }
}

/** Refund: mark purchases refunded and revoke the matching entitlements. */
export async function handleRefund(db: SupabaseClient, charge: ChargeLike): Promise<void> {
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!piId) return;

  const { data: purchases } = await db
    .from('purchases')
    .select('id, user_id, product_id')
    .eq('stripe_payment_intent_id', piId);

  for (const pur of (purchases ?? []) as { id: string; user_id: string; product_id: string }[]) {
    await db.from('purchases').update({ status: 'refunded' }).eq('id', pur.id);
    await db.from('entitlements').update({ status: 'revoked' }).eq('user_id', pur.user_id).eq('product_id', pur.product_id);
  }
}
