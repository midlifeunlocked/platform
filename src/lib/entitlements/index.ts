/**
 * Entitlement layer — public entry point.
 *
 * Import access functions from here and nowhere else:
 *
 *   import { canAccessCourse, getCurrentUser } from '@lib/entitlements';
 *
 * A single provider instance is selected here. Swapping the stub for the
 * Supabase-backed provider in Phase 3 is a one-line change in this file; no
 * feature, page, or component that consumes these functions has to change.
 */

import type { EntitlementProvider } from './types';
import { StubEntitlementProvider } from './stub';
import { SupabaseEntitlementProvider } from './supabaseProvider';
import { getBrowserClient, supabaseConfigured } from './supabaseClient';

export * from './types';

/**
 * The active provider. Uses the real Supabase-backed provider when the public
 * env is configured; falls back to the deny-all stub otherwise (e.g. a build
 * with no env), so nothing breaks. Same §6 interface either way.
 */
const provider: EntitlementProvider = supabaseConfigured
  ? new SupabaseEntitlementProvider(getBrowserClient())
  : new StubEntitlementProvider();

// Bound function exports — the surface every feature calls.
export const getCurrentUser = provider.getCurrentUser.bind(provider);
export const getUserEntitlements = provider.getUserEntitlements.bind(provider);
export const canAccessCourse = provider.canAccessCourse.bind(provider);
export const canAccessLesson = provider.canAccessLesson.bind(provider);
export const grantEntitlement = provider.grantEntitlement.bind(provider);
export const revokeEntitlement = provider.revokeEntitlement.bind(provider);
