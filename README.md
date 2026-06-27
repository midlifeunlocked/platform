# Midlife Unlocked

MasterClass-style membership platform — expert-taught masterclasses for divorced
men over 40. This repo is the rebuild described in [`PROJECT_SPEC.md`](./PROJECT_SPEC.md),
which is the canonical source of truth. **Read the spec before changing code.**

Astro + React islands, deployed to Cloudflare Pages.

## Status — Phase 1 foundation

Built so far:

- **Scaffold** — Astro (static output) + React integration, TypeScript strict,
  Cloudflare Pages deploy config.
- **Design system** — brand tokens and hand-built reusable components (no
  Webflow markup reproduced). See below.
- **Entitlement abstraction layer** — typed interface with a placeholder stub,
  so every later feature routes access decisions through it ([`src/lib/entitlements`](./src/lib/entitlements)).
- **Public site** — built on the pristine Streaming template with MU brand/copy:
  - Home, `/categories`, `/pricing`, `/instructors` (+ `/instructors/[slug]`),
    `/contact`, `/lessons/[slug]` (12 masterclass pages with free/premium gating),
    `/login`, `/signup`, `/privacy`, `/terms`, branded `404`.
  - Sample catalogue data in [`src/data/catalog.ts`](./src/data/catalog.ts) — the
    single source pages read from (becomes Supabase in Phase 3). Lesson detail
    pages show where `canAccessLesson()` will gate the signed Stream token.

Not yet built (later phases, per spec §10): quiz, Supabase, Stripe, the webhook
service, gated video playback, member account area, admin tooling. Auth forms and
the contact form are presentational until wired in later phases.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # static build → ./dist
npm run preview  # serve the build
npm run check    # astro + TypeScript diagnostics
```

## Deploy (Cloudflare Pages)

Static output in `./dist`. Either connect the repo to a Pages project (build
command `npm run build`, output `dist`) or:

```bash
npm run deploy   # astro build && wrangler pages deploy ./dist
```

## Architecture notes

### Entitlement layer is the only door to access decisions

Features never query Supabase/Stripe directly to decide access — they import from
[`@lib/entitlements`](./src/lib/entitlements/index.ts):

```ts
import { canAccessCourse, getCurrentUser } from '@lib/entitlements';
```

The active provider is selected in one place ([`index.ts`](./src/lib/entitlements/index.ts)).
Phase 3 swaps the stub for a Supabase-backed provider satisfying the same
`EntitlementProvider` contract — no feature code changes. This is the
swappability/sellability insurance from spec §6.

### Design system

| Piece | File |
| :---- | :--- |
| Brand tokens (color, type, spacing, radius, motion) | [`src/styles/tokens.css`](./src/styles/tokens.css) |
| Global base (fonts, reset, typography, primitives) | [`src/styles/global.css`](./src/styles/global.css) |
| Page shell | [`src/layouts/BaseLayout.astro`](./src/layouts/BaseLayout.astro) |
| Nav / Footer | [`src/components/Nav.astro`](./src/components/Nav.astro) · [`Footer.astro`](./src/components/Footer.astro) |
| Button | [`src/components/Button.astro`](./src/components/Button.astro) |
| Section layout | [`src/components/Section.astro`](./src/components/Section.astro) |
| Cards | [`LessonCard.astro`](./src/components/LessonCard.astro) · [`CategoryCard.astro`](./src/components/CategoryCard.astro) |
| Icons | [`src/components/Icon.astro`](./src/components/Icon.astro) |

**Direction:** built on the pristine "Streaming" Webflow template's structure
(type scale, 1224px container, 48px pill buttons, full homepage section flow),
re-skinned with the canonical Midlife Unlocked palette:

| Role | Value |
| :--- | :---- |
| Background | `#121214` |
| Accent 1 — deep forest green (surface tone, e.g. the pricing band) | `#072107` |
| Accent 2 — bronze (interactive: buttons, links, eyebrows) | `#A46133` |
| Display + body type | THICCCBOI (brand typeface) |

Free vs. premium lessons carry an unlock/lock badge — structurally true to the
product (the entitlement model), not decoration.

All design values come from tokens; components carry no raw hex. The Webflow
exports (pristine `streamingtemplate.webflow`, legacy `midlifeunlocked.webflow`)
and source asset folders live outside the repo (gitignored) as design reference;
assets the app actually uses are copied into [`public/`](./public).
