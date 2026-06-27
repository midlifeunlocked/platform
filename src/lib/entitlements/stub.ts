/**
 * Stub EntitlementProvider — placeholder implementation.
 *
 * Returns deterministic, in-memory answers so features can be built and routed
 * through the abstraction layer NOW, before Supabase/Stripe exist. Phase 3
 * replaces this file with a Supabase-backed provider that satisfies the exact
 * same `EntitlementProvider` contract — no feature code changes.
 *
 * Deliberately conservative: signed out, owning nothing. Access checks default
 * to DENY. The only thing it "knows" is which courses/lessons are free, so the
 * public catalog can render free vs. locked correctly today.
 */

import type {
  CurrentUser,
  Entitlement,
  EntitlementProvider,
  GrantOptions,
  AccessType,
  CourseId,
  LessonId,
  ProductId,
  UserId,
} from './types';

/**
 * Courses/lessons that are free to everyone (the "free core" tier). Real
 * free-vs-paid mapping moves into `products`/`courses` data in Phase 3; this
 * set just lets the stub answer access checks coherently in the meantime.
 */
const FREE_COURSES = new Set<CourseId>();
const FREE_LESSONS = new Set<LessonId>();

export class StubEntitlementProvider implements EntitlementProvider {
  async getCurrentUser(): Promise<CurrentUser | null> {
    // No auth wired yet — treat every visitor as a signed-out guest.
    return null;
  }

  async getUserEntitlements(_userId: UserId): Promise<Entitlement[]> {
    return [];
  }

  async canAccessCourse(_userId: UserId, courseId: CourseId): Promise<boolean> {
    // Free content is open to all; everything else denies until real
    // entitlement records exist. Fail closed.
    return FREE_COURSES.has(courseId);
  }

  async canAccessLesson(_userId: UserId, lessonId: LessonId): Promise<boolean> {
    return FREE_LESSONS.has(lessonId);
  }

  async grantEntitlement(
    userId: UserId,
    productId: ProductId,
    accessType: AccessType,
    opts: GrantOptions = {},
  ): Promise<Entitlement> {
    // No persistence yet: synthesize the record the real provider would write,
    // so callers (e.g. the future webhook) get a correctly shaped result.
    return {
      userId,
      productId,
      accessType,
      status: 'active',
      stripeSubscriptionId: opts.stripeSubscriptionId ?? null,
      grantedAt: new Date().toISOString(),
      expiresAt: opts.expiresAt ?? null,
    };
  }

  async revokeEntitlement(_userId: UserId, _productId: ProductId): Promise<void> {
    // No-op until persistence exists.
  }
}
