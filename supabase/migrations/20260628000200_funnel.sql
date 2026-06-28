-- Funnel commerce: schema extension + the Dating front-end funnel seed.
-- Extends PROJECT_SPEC §5 with the funnel/OTO tables the low-ticket gateway needs.
-- Stripe is billing truth; these tables hold funnel state + the offer sequence.

-- ─────────────────────────────────────────────────────────────────────────────
-- funnels / offers — the offer sequence. An offer positions a product in a
-- funnel with a role (frontend, bump, upsell, downsell). Price comes from the
-- product's Stripe price.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.funnels (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.offers (
  id         uuid primary key default gen_random_uuid(),
  funnel_id  uuid not null references public.funnels (id) on delete cascade,
  product_id uuid not null references public.products (id),
  role       text not null check (role in ('frontend', 'bump', 'upsell', 'downsell')),
  sequence   integer not null default 0,
  page_slug  text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  unique (funnel_id, role)
);
create index offers_funnel_idx on public.offers (funnel_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- funnel_sessions — one buyer's path. Holds the Stripe customer + saved payment
-- method captured at checkout, so the one-click upsell can charge off-session.
-- Sensitive: service-role only (no client policies). Browser touches it only via
-- server endpoints.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.funnel_sessions (
  id                       uuid primary key default gen_random_uuid(),
  funnel_id                uuid not null references public.funnels (id),
  cookie_id                text,
  user_id                  uuid references public.users (id) on delete set null,
  email                    text,
  stripe_customer_id       text,
  stripe_payment_method_id text,
  current_step             text,
  affiliate_ref            text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index funnel_sessions_cookie_idx on public.funnel_sessions (cookie_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- purchases gains funnel context. A bump shares the front-end PaymentIntent, so
-- the old single-column unique can't hold (one PI → two line items). Switch to a
-- (payment_intent, product) unique: idempotent per line item, multi-item per PI.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.purchases drop constraint if exists purchases_stripe_payment_intent_id_key;
alter table public.purchases
  add column funnel_session_id uuid references public.funnel_sessions (id) on delete set null,
  add column offer_id          uuid references public.offers (id),
  add column kind              text check (kind in ('frontend', 'bump', 'upsell', 'downsell'));
alter table public.purchases
  add constraint purchases_pi_product_uniq unique (stripe_payment_intent_id, product_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: funnel/offer config is public read (the funnel pages render it); sessions
-- are service-role only.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.funnels         enable row level security;
alter table public.offers          enable row level security;
alter table public.funnel_sessions enable row level security;

create policy funnels_public_read on public.funnels
  for select to anon, authenticated using (active);
create policy offers_public_read on public.offers
  for select to anon, authenticated using (active);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: the Dating front-end funnel. Idempotent (safe to re-run).
-- Digital products map to a course (unlock video); live services (call, coaching)
-- have no course mapping — purchase is recorded, fulfillment is scheduled.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.courses (slug, title) values
  ('midlife-dating-unlocked', 'Midlife Dating Unlocked')
on conflict (slug) do nothing;

insert into public.products (slug, name, kind, stripe_price_id, active) values
  ('masterclass-dating',        'Midlife Dating Unlocked Masterclass',            'one_time', 'price_1TnArREDvWZDkuTx90mKXteM', true),
  ('bump-assessment-call',      'Dating Readiness Assessment Call',               'one_time', 'price_1TnArSEDvWZDkuTx4cFBzl0X', true),
  ('upsell-group-coaching',     'Midlife Dating Unlocked Group Coaching Program', 'one_time', 'price_1TnArSEDvWZDkuTx5scGFeKU', true),
  ('downsell-advanced-tactics', 'Advanced Dating Tactics',                        'one_time', 'price_1TnArTEDvWZDkuTxDa4zGyyE', true)
on conflict (slug) do update set stripe_price_id = excluded.stripe_price_id, name = excluded.name;

-- masterclass unlocks the Dating course
insert into public.product_courses (product_id, course_id)
select p.id, c.id
from public.products p, public.courses c
where p.slug = 'masterclass-dating' and c.slug = 'midlife-dating-unlocked'
on conflict do nothing;

insert into public.funnels (slug, name) values
  ('dating-frontend', 'Midlife Dating Unlocked — Front-End Funnel')
on conflict (slug) do nothing;

insert into public.offers (funnel_id, product_id, role, sequence, page_slug)
select f.id, p.id, v.role, v.seq, v.page
from public.funnels f
join (values
  ('masterclass-dating',        'frontend', 0, 'checkout'),
  ('bump-assessment-call',      'bump',     0, 'checkout'),
  ('upsell-group-coaching',     'upsell',   1, 'upsell'),
  ('downsell-advanced-tactics', 'downsell', 2, 'downsell')
) as v(slug, role, seq, page) on true
join public.products p on p.slug = v.slug
where f.slug = 'dating-frontend'
on conflict (funnel_id, role) do nothing;
