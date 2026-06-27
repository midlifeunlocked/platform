/// <reference types="astro/client" />

// Phase 3+ : when the Cloudflare adapter is added, expose the runtime env
// (Supabase, Stripe, Stream, Loops secrets/bindings) on App.Locals here, e.g.
//
//   type ENV = { SUPABASE_URL: string; /* ... */ };
//   type Runtime = import('@astrojs/cloudflare').Runtime<ENV>;
//   declare namespace App { interface Locals extends Runtime {} }
//
// Secrets are always env/bindings — never hardcoded in the repo.
