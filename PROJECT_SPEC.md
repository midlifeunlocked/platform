# Midlife Unlocked Platform — Project Specification

**This file is the canonical source of truth for the Midlife Unlocked rebuild. Claude Code must read this file at the start of every session before writing or changing code.**

---

## 1\. What Midlife Unlocked Is

Midlife Unlocked is a MasterClass-style membership platform delivering expert-taught, outcome-specific masterclasses to a defined audience (initial vertical: men over 40 navigating divorce). Content comes from real expert interviews, sliced into a tiered free → low-ticket → catalog/coaching offer.

**Design north star: founder-independent and sellable.** Every decision favors an asset that runs without the founder's face, personality, or daily labor, and that transfers cleanly to a buyer. Trust is carried by the Midlife Unlocked brand and the experts, not by the founder. The architecture, documentation, and tooling are themselves part of the sellable asset.

This is a real software product (auth, payments, gated content). The build must be tight and maintainable; the money-and-access seams must be correct and tested.

---

## 2\. Architecture Principles (non-negotiable)

1. **One system owns billing; one system owns access. Neither is ever a marketing tool.** Stripe owns billing truth. Supabase owns identity and access truth. The old failure was two competing membership databases reconciled by a fragile bridge — never again.  
2. **Greenfield. No legacy tools.** No Kartra, no Memberstack, no Integrately. There are zero existing users, so there is nothing to migrate and no reason to carry 2022 architecture forward.  
3. **Direct, owned integrations — no no-code glue.** Systems communicate through one owned, version-controlled webhook service. No Integrately/Zapier chains in the critical path.  
4. **Access is enforced on the asset, not just the page.** Gated video checks entitlement at playback (signed tokens), not merely by hiding the page in front of it.  
5. **Stable IDs as keys, never email.** Use Stripe customer/subscription IDs and Supabase user UUIDs. Emails change and duplicate.  
6. **Entitlements are formal database records, never tags.** Tags (in the email tool) are for marketing only and carry zero access authority.  
7. **Swappable backends via an abstraction layer.** Features never call the database or a vendor SDK directly for access decisions — they call the entitlement interface (§6).  
8. **Front-end never owns member or billing truth.** The Astro/React layer presents and captures; truth lives in Supabase and Stripe.

---

## 3\. The Stack

| Layer | Tool | Job |
| :---- | :---- | :---- |
| Site \+ member app | **Astro \+ React islands** on Cloudflare Pages | Public site, funnels, quizzes, member experience |
| Identity \+ data | **Supabase** (Auth \+ Postgres) | Accounts, entitlements, progress, scores, referral ledger |
| Billing | **Stripe** | Checkout, subscriptions, refunds, hosted billing portal |
| Gated video | **Cloudflare Stream** | Private, signed-token video playback |
| Email | **Loops** (default) | Transactional \+ lifecycle/marketing email, driven by app events |
| Affiliates | **FirstPromoter** (default) | Stripe-native partner attribution & commissions |
| Sync | **Owned webhook service** (Cloudflare Worker) | Stripe → Supabase → Loops, logged and retried |

**Email and affiliate tools are timeboxed decisions, not yet locked.** Loops vs ActiveCampaign; FirstPromoter vs Rewardful. They attach at clean seams, so the platform core does not depend on the choice. Decide in days. Default to Loops (app-native, fits the event model) and FirstPromoter unless evaluation says otherwise.

---

## 4\. Source-of-Truth Hierarchy

- **Stripe** — billing truth: payment success, active/failed/canceled subscriptions, refunds, which products were purchased.  
- **Supabase** — identity & access truth: who the user is, what they own, what they may access, login state, membership level, progress, scores.  
- **Loops** — marketing record only: lead source, campaign membership, behavioral tags, nurture state. No access authority.  
- **Supabase referral ledger** — coaching-referral truth: high-ticket coaching transactions happen in the *coach's* checkout, outside Midlife Unlocked's Stripe, so they cannot be tracked by the Stripe-native affiliate tool and need their own ledger.

---

## 5\. Data Model (Supabase)

Core tables (expand as needed, but keep entitlements formal and IDs stable):

- `users` — Supabase auth UUID, profile, Stripe customer ID  
- `products` — sellable units (a masterclass, a bundle, all-access)  
- `courses` — teachable content, mapped to product(s)  
- `lessons` — within a course; references Cloudflare Stream video ID  
- `entitlements` — **the access record.** `user_id`, `product_id`, `access_type` (lifetime | subscription), `status` (active | revoked | expired), `stripe_subscription_id` (nullable), `granted_at`  
- `purchases` — one-time purchase history  
- `subscriptions` — subscription state mirrored from Stripe  
- `lesson_progress` — `user_id`, `lesson_id`, status, last position  
- `quiz_results` — `user_id` (or lead), quiz type, score, dimension breakdown, timestamp (supports retests/history)  
- `referrals` — coaching referral ledger: referred user, coach, status, commission, source — for transactions outside Midlife Unlocked's Stripe  
- `sync_events` — every integration event: id, type, timestamp, status, error, retry count, payload, manual-replay flag

Row Level Security on every user-scoped table: a user can read only their own records; access-gated content checks entitlements.

---

## 6\. The Entitlement Abstraction Layer (critical)

Every access decision in the app goes through this interface. Implementations can point at Supabase now and change later without rewriting feature code. **No feature calls the database directly for access.**

getCurrentUser()                  → current authenticated user or null

getUserEntitlements(userId)       → list of active entitlements

canAccessCourse(userId, courseId) → boolean, checks active entitlement

canAccessLesson(userId, lessonId) → boolean

grantEntitlement(userId, productId, accessType, opts)   → writes entitlement

revokeEntitlement(userId, productId)                     → revokes entitlement

This interface is the swappability and sellability insurance. Build it first, stub it early, route everything through it.

---

## 7\. Security Seams (build carefully, test explicitly)

These three are where correctness matters and where bugs cost money or leak content. Each needs explicit test cases before go-live.

1. **Supabase Row Level Security** — policies enforce "user sees only what they own." Test: user A cannot read user B's records; unentitled user cannot read gated content rows.  
2. **Cloudflare Stream signed tokens** — playback requires a short-lived, server-signed token issued *only after* `canAccessCourse()`/`canAccessLesson()` returns true. Test: entitled user plays; unentitled user is denied even with the raw URL; expired token fails.  
3. **The Stripe webhook (owned service)** — see §8. Test: every transition.

---

## 8\. The Owned Webhook Service

A Cloudflare Worker, version-controlled, no no-code platform.

**Flow:** Stripe event → verify signature → update Supabase entitlement *through the abstraction layer* → mirror buyer tag/contact to Loops → log to `sync_events`.

**Must handle:** purchase, subscription renewal, failed payment, cancellation, refund.

**Must have:** idempotency (no double-processing), automatic retries, full logging in `sync_events`, and a manual-replay path.

**Failure-mode rule:** a sync failure must never cost a paying customer access. Access provisioning (Stripe→Supabase) is critical-path and must be reliable; marketing mirror (→Loops) is non-critical and may arrive late without harm.

---

## 9\. Content & Offer Model

- **Tiered from one interview:** free public cut (discovery, on YouTube/podcast/site) → structured low-ticket masterclass with companion assets (the paid product) → catalog \+ high-ticket coaching referral (back end). Free is the *hook and what*; paid is the *depth, structure, and how*.  
- **Per-product entitlements, not a binary free/paid layer.** The old two-tier limit is gone — access is checked per product, enabling granular offers and bundles.  
- **The quiz** ("Dating Readiness Score," 0–100, credit-score framing) is the warm-traffic engine and primary lead magnet: it captures, scores, and segments in one motion, routing follow-up by score. Build it early.  
- Paid companion assets are scaffolded on the **expert's actual method** (AI structures and packages; it does not replace expert content).

---

## 10\. Build Sequence (Phases)

**Foundation and conventions first, features second.** Review each phase before the next. One focused prompt per chunk — never "build Midlife Unlocked."

- **Phase 0 — Pre-code:** archive all Kartra IP before canceling (copy, sequences, funnels, sales/checkout copy, upsell logic, affiliate terms, launch analytics, videos); finalize email \+ affiliate picks (timeboxed); set up accounts (GitHub, Cloudflare Pages \+ Stream, Supabase, Stripe test mode, email tool, domain).  
- **Phase 1 — Foundation \+ public site:** Astro scaffold, repo, Cloudflare Pages; design system first (read the frontend-design skill); public pages (home, catalog, masterclass landing pages, about) from `/reference`.  
- **Phase 2 — Quiz \+ lead capture:** Dating Readiness quiz as an Astro flow; capture email \+ score to Loops and `quiz_results`. *Ships early so traffic and list-building can start before the paid backend exists.*  
- **Phase 3 — Supabase:** schema, RLS, auth, and the entitlement abstraction layer (§6).  
- **Phase 4 — Stripe \+ webhook:** products/prices, Checkout, billing portal, the owned webhook service (§8); test every transition in test mode.  
- **Phase 5 — Gated video \+ member app:** Cloudflare Stream with signed-token gating; member area (login, library, course player, progress). **First masterclass purchasable and gated \= MVP / sellable.**  
- **Phase 6 — Affiliate \+ referral ledger:** Stripe-native affiliate tool for masterclass affiliates; custom Supabase referral ledger for out-of-Stripe coaching referrals.  
- **Phase 7 — Admin tooling:** user lookup, view/grant/revoke entitlement, issue refund, resend login, view `sync_events`. Turns support tickets into clicks and is part of what makes the business sellable.

**Shipping milestones:** live public site after P1 · working lead capture after P2 (start marketing) · sellable platform after P5 · scale/ops after P6–7.

---

## 11\. Conventions

- Tight, light, hand-built components. Do **not** reproduce Webflow's generated markup from `/reference` — extract content and design intent, rebuild clean.  
- Build a design system (brand tokens \+ reusable components) before pages. Read the frontend-design skill first.  
- TypeScript; typed interfaces for the entitlement layer and all external-service boundaries.  
- All access decisions go through the abstraction layer (§6).  
- Stable IDs as keys; formal entitlement records for access; tags for marketing only.  
- Secrets in environment variables, never in the repo.  
- Every integration event logged to `sync_events`.

---

## 12\. Anti-Patterns (do not do)

- Kartra (or any marketing tool) as the access gatekeeper.  
- External checkout feeding a membership tool's "free plan" via custom glue.  
- Email-matching as the primary customer key.  
- Access managed through tags.  
- Stacking multiple automation tools (Integrately \+ Zapier \+ Make \+ scripts).  
- Silent sync failures (every event must be logged, retried, replayable).  
- Building the member app's fancier features before a masterclass is purchasable and gated.  
- Reproducing Webflow's class-soup markup.

---

## 13\. Testing Requirements (money & access seams)

Before go-live, explicit test cases for:

- Purchase → entitlement granted → access works  
- Failed renewal → access handled correctly  
- Cancellation → access revoked at period end  
- Refund → entitlement revoked  
- Cancel then resubscribe → no stale entitlement  
- Entitled user plays gated video; unentitled user denied even with URL; expired token fails  
- RLS: user cannot read another user's records  
- Webhook idempotency: duplicate event not double-processed

