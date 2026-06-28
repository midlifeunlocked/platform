-- Store each product's price on the product row so the checkout endpoint can
-- compute the charge amount without a Stripe round-trip per request. Stripe
-- remains billing truth; this is a cached convenience kept in sync at seed time.
alter table public.products
  add column amount_cents integer,
  add column currency text not null default 'usd';

update public.products set amount_cents = 2700  where slug = 'masterclass-dating';
update public.products set amount_cents = 9700  where slug = 'bump-assessment-call';
update public.products set amount_cents = 49700 where slug = 'upsell-group-coaching';
update public.products set amount_cents = 4700  where slug = 'downsell-advanced-tactics';
