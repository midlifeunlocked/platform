/**
 * Browser-side Supabase client for the entitlement layer.
 *
 * Uses the PUBLIC anon key — safe to ship to the browser because Row Level
 * Security (PROJECT_SPEC §7) enforces that a signed-in user can read only their
 * own rows. The service-role key is NEVER used here; the owned webhook Worker
 * (§8) constructs its own service-role client for writes.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** True when the public Supabase env is present — gates the real provider. */
export const supabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/** Lazily create (and reuse) the browser client. No network until a query runs. */
export function getBrowserClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured (PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY).');
  }
  cached ??= createClient(url, anonKey);
  return cached;
}
