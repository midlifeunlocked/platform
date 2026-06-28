-- Commerce + access foundation (PROJECT_SPEC §5, §7).
--
-- Source-of-truth split (§2, §4): Stripe owns billing; Supabase owns identity
-- and access. Entitlements are formal records (§2.6), keyed on stable UUIDs and
-- Stripe IDs, never email (§2.5). RLS (§7) lets a user read only their own rows;
-- the service-role key (used only by the owned webhook Worker, §8) bypasses RLS
-- to write access records. Nothing in the front end ever writes these tables.
--
-- Funnel/OTO tables (funnels, offers, funnel_sessions, order_items) are a later
-- extension added with the funnel step; this migration is the access core.

-- ─────────────────────────────────────────────────────────────────────────────
-- users — profile mirror of auth.users. Carries the Stripe customer id once the
-- user becomes a billing entity. Access never depends on profile fields.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.users (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text not null,
  name               text,
  stripe_customer_id text unique,
  created_at         timestamptz not null default now()
);

-- Auto-create the profile row on signup (security definer so it can write
-- public.users from the auth schema trigger).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- products — sellable units: a masterclass, a bundle, or all-access (§5, §9).
-- `kind` one_time → grants a 'lifetime' entitlement; subscription → 'subscription'.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  kind            text not null check (kind in ('one_time', 'subscription')),
  stripe_price_id text,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- courses — teachable content, mapped to one or more products (§5). Lesson-level
-- content stays in the app catalog for now; the DB owns the access mapping.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.courses (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  created_at timestamptz not null default now()
);

-- A product grants access to its mapped courses (M:N). All-access = every course.
create table public.product_courses (
  product_id uuid not null references public.products (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  primary key (product_id, course_id)
);
create index product_courses_course_idx on public.product_courses (course_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- entitlements — THE access record (§5, §6). One row per (user, product); a
-- re-grant updates it. Only `active` grants access. Shape mirrors the
-- EntitlementProvider TS contract exactly.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.entitlements (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users (id) on delete cascade,
  product_id             uuid not null references public.products (id),
  access_type            text not null check (access_type in ('lifetime', 'subscription')),
  status                 text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  stripe_subscription_id text,
  granted_at             timestamptz not null default now(),
  expires_at             timestamptz,
  created_at             timestamptz not null default now(),
  unique (user_id, product_id)
);
create index entitlements_user_idx on public.entitlements (user_id);
create index entitlements_active_idx on public.entitlements (user_id, status) where status = 'active';

-- ─────────────────────────────────────────────────────────────────────────────
-- purchases — one-time purchase history (§5). Keyed on the Stripe PaymentIntent
-- for idempotent webhook writes.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.purchases (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references public.users (id) on delete set null,
  product_id               uuid references public.products (id),
  stripe_payment_intent_id text unique,
  amount_cents             integer,
  currency                 text not null default 'usd',
  status                   text not null default 'paid' check (status in ('paid', 'refunded', 'failed')),
  created_at               timestamptz not null default now()
);
create index purchases_user_idx on public.purchases (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- subscriptions — subscription state mirrored from Stripe (§5). PK is the Stripe
-- subscription id; status holds Stripe's own status string.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.subscriptions (
  id                   text primary key,
  user_id              uuid not null references public.users (id) on delete cascade,
  product_id           uuid references public.products (id),
  status               text not null,
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- sync_events — every integration event (§5, §8). PK is the Stripe event id, so
-- a duplicate delivery is a primary-key conflict = idempotency. Carries retry
-- count, error, and a manual-replay flag for the owned webhook service.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.sync_events (
  id            text primary key,
  type          text not null,
  status        text not null default 'received' check (status in ('received', 'processed', 'failed')),
  error         text,
  retry_count   integer not null default 0,
  payload       jsonb,
  manual_replay boolean not null default false,
  created_at    timestamptz not null default now(),
  processed_at  timestamptz
);
create index sync_events_status_idx on public.sync_events (status);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (§7). Enable on every table. User-scoped tables: read own
-- rows only. Catalog tables: public read. Writes to access/billing tables are
-- service-role only (no policy granted → denied for anon/authenticated; the
-- service-role key bypasses RLS).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.users           enable row level security;
alter table public.products        enable row level security;
alter table public.courses         enable row level security;
alter table public.product_courses enable row level security;
alter table public.entitlements    enable row level security;
alter table public.purchases       enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.sync_events     enable row level security;

-- users: read & update your own profile.
create policy users_select_own on public.users
  for select to authenticated using (auth.uid() = id);
create policy users_update_own on public.users
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- entitlements / purchases / subscriptions: read your own; never write from client.
create policy entitlements_select_own on public.entitlements
  for select to authenticated using (auth.uid() = user_id);
create policy purchases_select_own on public.purchases
  for select to authenticated using (auth.uid() = user_id);
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

-- catalog: products, courses, and their mapping are public read.
create policy products_public_read on public.products
  for select to anon, authenticated using (true);
create policy courses_public_read on public.courses
  for select to anon, authenticated using (true);
create policy product_courses_public_read on public.product_courses
  for select to anon, authenticated using (true);

-- sync_events: no client access at all (service-role only). No policies granted.
