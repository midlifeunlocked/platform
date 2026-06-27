// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Midlife Unlocked — Astro + React islands, deployed to Cloudflare Pages.
//
// Foundation phase is a fully STATIC build: the public site (home, catalog,
// landing pages) prerenders to fast HTML and deploys to Pages as static assets.
// React islands are client-rendered, so no server runtime is required yet.
//
// Phase 3 (Supabase auth + the entitlement layer) introduces the first
// on-demand routes. At that point add the Cloudflare adapter:
//
//     import cloudflare from '@astrojs/cloudflare';
//     adapter: cloudflare(),                       // + per-route prerender=false
//
// (@astrojs/cloudflare is already installed for that step.)
export default defineConfig({
  site: 'https://midlifeunlocked.com',
  output: 'static',
  integrations: [react(), sitemap()],
});
