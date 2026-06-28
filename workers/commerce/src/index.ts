/**
 * MU Commerce Worker — the owned money/access service (PROJECT_SPEC §8).
 *
 * A standalone Cloudflare Worker, deployed separately from the static Pages
 * site. Routes:
 *   POST /api/funnel/checkout   create customer + PaymentIntent (front-end [+ bump])
 *   POST /api/funnel/upsell     one-click off-session charge (upsell)
 *   POST /api/funnel/downsell   one-click off-session charge (downsell)
 *   POST /api/stripe/webhook    Stripe → verify → idempotent fulfilment → log
 *
 * The fulfilment/charge logic is the shared, unit-tested core in
 * src/lib/server/{fulfillment,oto}.ts. This file is the HTTP boundary + env.
 */
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { fulfillPaymentIntent, handleRefund } from '../../../src/lib/server/fulfillment';
import { chargeOto } from '../../../src/lib/server/oto';

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const FUNNEL_SLUG = 'dating-frontend';
const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...CORS } });

type OfferRow = { role: string; products: { id: string; slug: string; amount_cents: number | null; currency: string | null } | null };

async function checkout(db: SupabaseClient, stripe: Stripe, body: Record<string, unknown>): Promise<Response> {
  const email = body.email;
  if (!email || typeof email !== 'string') return json({ error: 'email required' }, 400);

  const { data: funnel } = await db.from('funnels').select('id').eq('slug', FUNNEL_SLUG).maybeSingle();
  if (!funnel) return json({ error: 'funnel not found' }, 500);

  const { data: offers } = await db
    .from('offers')
    .select('role, products(id, slug, amount_cents, currency)')
    .eq('funnel_id', funnel.id)
    .in('role', ['frontend', 'bump']);

  const rows = (offers ?? []) as unknown as OfferRow[];
  const frontend = rows.find((o) => o.role === 'frontend');
  const bump = rows.find((o) => o.role === 'bump');
  if (!frontend?.products) return json({ error: 'no frontend offer' }, 500);

  const items = [frontend.products];
  if (body.includeBump && bump?.products) items.push(bump.products);
  const amount = items.reduce((sum, p) => sum + (p?.amount_cents ?? 0), 0);
  const currency = frontend.products.currency ?? 'usd';

  const customer = await stripe.customers.create({ email: email.toLowerCase() });

  const { data: session, error } = await db
    .from('funnel_sessions')
    .insert({
      funnel_id: funnel.id,
      cookie_id: (body.cookieId as string) ?? null,
      email: email.toLowerCase(),
      stripe_customer_id: customer.id,
      current_step: 'checkout',
    })
    .select('id')
    .single();
  if (error || !session) return json({ error: 'session create failed' }, 500);

  const pi = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customer.id,
    setup_future_usage: 'off_session',
    automatic_payment_methods: { enabled: true },
    metadata: {
      funnel_session_id: session.id,
      email: email.toLowerCase(),
      product_slugs: items.map((p) => p!.slug).join(','),
    },
  });

  return json({ clientSecret: pi.client_secret, funnelSessionId: session.id, amount });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Stripe webhook — server-to-server, signature-verified, idempotent (§8).
    if (url.pathname === '/api/stripe/webhook' && request.method === 'POST') {
      if (!env.STRIPE_WEBHOOK_SECRET) return new Response('webhook not configured', { status: 503 });
      const sig = request.headers.get('stripe-signature') ?? '';
      const raw = await request.text();
      let event: Stripe.Event;
      try {
        event = await stripe.webhooks.constructEventAsync(raw, sig, env.STRIPE_WEBHOOK_SECRET);
      } catch (e) {
        return new Response(`bad signature: ${(e as Error).message}`, { status: 400 });
      }

      const { error: claim } = await db
        .from('sync_events')
        .insert({ id: event.id, type: event.type, status: 'received', payload: event as unknown as Record<string, unknown> });
      if (claim) return new Response('duplicate', { status: 200 });

      try {
        if (event.type === 'payment_intent.succeeded') {
          await fulfillPaymentIntent(db, event.data.object as Stripe.PaymentIntent);
        } else if (event.type === 'charge.refunded') {
          await handleRefund(db, event.data.object as Stripe.Charge);
        }
        await db.from('sync_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', event.id);
        return new Response('ok');
      } catch (e) {
        await db.from('sync_events').update({ status: 'failed', error: String((e as Error)?.message ?? e) }).eq('id', event.id);
        return new Response('handler error', { status: 500 });
      }
    }

    if (request.method !== 'POST') return new Response('method not allowed', { status: 405, headers: CORS });
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (url.pathname === '/api/funnel/checkout') return checkout(db, stripe, body);
    if (url.pathname === '/api/funnel/upsell') {
      const r = await chargeOto(db, stripe, String(body.funnelSessionId ?? ''), 'upsell');
      return json(r, r.error ? 400 : 200);
    }
    if (url.pathname === '/api/funnel/downsell') {
      const r = await chargeOto(db, stripe, String(body.funnelSessionId ?? ''), 'downsell');
      return json(r, r.error ? 400 : 200);
    }
    return new Response('not found', { status: 404, headers: CORS });
  },
};
