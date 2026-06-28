// Create the funnel's Stripe products + prices (test mode), idempotently.
// IDs are cached in scripts/stripe-ids.json so re-runs reuse, never duplicate.
// Run: node scripts/stripe-setup.mjs   (reads STRIPE_SECRET_KEY from .env)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const KEY = env.STRIPE_SECRET_KEY;
if (!KEY || !KEY.startsWith('sk_test_')) throw new Error('STRIPE_SECRET_KEY (test) not found in .env');

const IDS_PATH = 'scripts/stripe-ids.json';
const ids = existsSync(IDS_PATH) ? JSON.parse(readFileSync(IDS_PATH, 'utf8')) : {};

async function stripe(path, params) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(KEY + ':').toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${path}: ${json.error?.message || res.status}`);
  return json;
}

// The funnel. amount in cents; all one-time USD.
const PRODUCTS = [
  { slug: 'masterclass-dating',        name: 'Midlife Dating Unlocked Masterclass',            amount: 2700,  role: 'frontend' },
  { slug: 'bump-assessment-call',      name: 'Dating Readiness Assessment Call',               amount: 9700,  role: 'bump' },
  { slug: 'upsell-group-coaching',     name: 'Midlife Dating Unlocked Group Coaching Program', amount: 49700, role: 'upsell' },
  { slug: 'downsell-advanced-tactics', name: 'Advanced Dating Tactics',                        amount: 4700,  role: 'downsell' },
];

for (const p of PRODUCTS) {
  const existing = ids[p.slug];
  if (existing?.priceId) { console.log(`reuse  ${p.slug.padEnd(26)} ${existing.priceId}`); continue; }

  const product = await stripe('products', {
    name: p.name,
    'metadata[slug]': p.slug,
    'metadata[funnel_role]': p.role,
  });
  const price = await stripe('prices', {
    product: product.id,
    unit_amount: String(p.amount),
    currency: 'usd',
    'metadata[slug]': p.slug,
  });
  ids[p.slug] = { productId: product.id, priceId: price.id, amount: p.amount };
  console.log(`create ${p.slug.padEnd(26)} ${price.id}  ($${(p.amount / 100).toFixed(2)})`);
}

writeFileSync(IDS_PATH, JSON.stringify(ids, null, 2) + '\n');
console.log(`\nWrote ${IDS_PATH}`);
