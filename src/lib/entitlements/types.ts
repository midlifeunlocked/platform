/**
 * Entitlement abstraction layer — domain types.
 *
 * This is the single contract every feature uses to ask "who is this, and what
 * may they access?" (PROJECT_SPEC §6). Features NEVER touch Supabase, Stripe,
 * or any vendor SDK directly for an access decision — they call the interface
 * below. The implementation can point at Supabase today and swap later without
 * touching a single feature. That swappability is the sellability insurance.
 *
 * Conventions enforced by these types:
 *  - Stable IDs as keys, never email (§2.5).
 *  - Entitlements are formal records with status, never tags (§2.6).
 *  - Per-product access, not a binary free/paid layer (§9).
 */

/** Supabase auth UUID. */
export type UserId = string;

/** A sellable unit: a masterclass, a bundle, or all-access. */
export type ProductId = string;

/** Teachable content mapped to one or more products. */
export type CourseId = string;

/** A single lesson within a course (maps to a Cloudflare Stream video). */
export type LessonId = string;

/** How long access lasts once granted. */
export type AccessType = 'lifetime' | 'subscription';

/** Lifecycle of an entitlement record. Only `active` grants access. */
export type EntitlementStatus = 'active' | 'revoked' | 'expired';

/**
 * The authenticated user. Carries the stable IDs used as keys everywhere;
 * profile detail beyond this stays out of access decisions.
 */
export interface CurrentUser {
  id: UserId;
  email: string;
  /** Stripe customer id, once they exist as a billing entity. */
  stripeCustomerId: string | null;
  /** Display name if captured; access never depends on it. */
  name: string | null;
}

/**
 * The access record. The source of truth for "may this user use this product."
 * Mirrors the `entitlements` table in PROJECT_SPEC §5.
 */
export interface Entitlement {
  userId: UserId;
  productId: ProductId;
  accessType: AccessType;
  status: EntitlementStatus;
  /** Present only for subscription access; null for lifetime/one-time. */
  stripeSubscriptionId: string | null;
  grantedAt: string; // ISO 8601
  /** Set when access is time-bounded (subscription period end, etc.). */
  expiresAt: string | null;
}

/** Options accepted when granting an entitlement. */
export interface GrantOptions {
  /** Required when `accessType` is `subscription`. */
  stripeSubscriptionId?: string;
  /** Time-bounded access; omit for lifetime. */
  expiresAt?: string;
  /** Provenance for the `sync_events` log (e.g. 'stripe.webhook', 'admin'). */
  source?: string;
}

/**
 * The entitlement provider contract. Implementations: a Supabase-backed one
 * (real), and a stub (now / tests). Everything is async because the real
 * implementation is network-bound.
 */
export interface EntitlementProvider {
  /** The current authenticated user, or null if signed out. */
  getCurrentUser(): Promise<CurrentUser | null>;

  /** All `active` entitlements for a user. */
  getUserEntitlements(userId: UserId): Promise<Entitlement[]>;

  /** True iff the user holds an active entitlement covering the course. */
  canAccessCourse(userId: UserId, courseId: CourseId): Promise<boolean>;

  /** True iff the user holds an active entitlement covering the lesson. */
  canAccessLesson(userId: UserId, lessonId: LessonId): Promise<boolean>;

  /** Write (or re-activate) an entitlement. Returns the resulting record. */
  grantEntitlement(
    userId: UserId,
    productId: ProductId,
    accessType: AccessType,
    opts?: GrantOptions,
  ): Promise<Entitlement>;

  /** Mark the user's entitlement for a product as revoked. */
  revokeEntitlement(userId: UserId, productId: ProductId): Promise<void>;
}
