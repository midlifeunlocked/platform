// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Midlife Unlocked — Astro + React islands, deployed to Cloudflare Pages as a
// fully STATIC build (home, catalog, landing/funnel pages prerender to HTML;
// React islands are client-rendered).
//
// The funnel's money plumbing (checkout/upsell/downsell + the Stripe webhook)
// does NOT live here — per PROJECT_SPEC §8 it is an OWNED, standalone Cloudflare
// Worker in workers/commerce/, deployed separately. Keeping it out of the Pages
// build means the live public site is never destabilised by server code, and
// the access/billing seam is an isolated, independently deployable unit.
export default defineConfig({
  site: 'https://midlifeunlocked.com',
  output: 'static',
  integrations: [react(), sitemap()],
});
