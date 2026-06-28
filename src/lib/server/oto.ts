/**
 * One-click upsell/downsell charge. Charges the card saved at checkout
 * off-session (no re-entry). Returns a result the funnel page acts on:
 *  - ok: charged → advance
 *  - requiresAction: SCA/3-D Secure → confirm on-session with clientSecret
 *  - declined: route to the downsell (or end)
 * Fulfillment (entitlement + purchase) happens in the webhook, not here.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

export interface OtoResult {
  ok?: boolean;
  requiresAction?: boolean;
  clientSecret?: string;
  declined?: boolean;
  status?: string;
  error?: string;
}

export async function chargeOto(
  db: SupabaseClient,
  stripe: Stripe,
  funnelSessionId: string,
  role: 'upsell' | 'downsell',
): Promise<OtoResult> {
  const { data: session } = await db
    .from('funnel_sessions')
    .select('id, funnel_id, email, stripe_customer_id, stripe_payment_method_id')
    .eq('id', funnelSessionId)
    .maybeSingle();
  if (!session?.stripe_customer_id) return { error: 'no checkout session' };

  // Prefer the saved card; fall back to the customer's card (no race with webhook).
  let pmId: string | null = session.stripe_payment_method_id ?? null;
  if (!pmId) {
    const pms = await stripe.paymentMethods.list({ customer: session.stripe_customer_id, type: 'card', limit: 1 });
    pmId = pms.data[0]?.id ?? null;
  }
  if (!pmId) return { error: 'no saved card' };

  const { data: offer } = await db
    .from('offers')
    .select('role, products(slug, amount_cents, currency)')
    .eq('funnel_id', session.funnel_id)
    .eq('role', role)
    .maybeSingle();
  const product = (offer as { products?: { slug: string; amount_cents: number; currency: string } } | null)?.products;
  if (!product) return { error: `no ${role} offer` };

  try {
    const pi = await stripe.paymentIntents.create({
      amount: product.amount_cents,
      currency: product.currency ?? 'usd',
      customer: session.stripe_customer_id,
      payment_method: pmId,
      off_session: true,
      confirm: true,
      metadata: { funnel_session_id: session.id, email: session.email ?? '', product_slugs: product.slug },
    });
    if (pi.status === 'succeeded') return { ok: true };
    if (pi.status === 'requires_action') return { requiresAction: true, clientSecret: pi.client_secret ?? undefined };
    return { ok: false, status: pi.status };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; raw?: { payment_intent?: { client_secret?: string } } };
    if (err.code === 'authentication_required' && err.raw?.payment_intent?.client_secret) {
      return { requiresAction: true, clientSecret: err.raw.payment_intent.client_secret };
    }
    return { ok: false, declined: true, error: err.message };
  }
}
