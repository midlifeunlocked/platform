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

export * from './types';

/** The active provider. Phase 3: replace with `new SupabaseEntitlementProvider(...)`. */
const provider: EntitlementProvider = new StubEntitlementProvider();

// Bound function exports — the surface every feature calls.
export const getCurrentUser = provider.getCurrentUser.bind(provider);
export const getUserEntitlements = provider.getUserEntitlements.bind(provider);
export const canAccessCourse = provider.canAccessCourse.bind(provider);
export const canAccessLesson = provider.canAccessLesson.bind(provider);
export const grantEntitlement = provider.grantEntitlement.bind(provider);
export const revokeEntitlement = provider.revokeEntitlement.bind(provider);
