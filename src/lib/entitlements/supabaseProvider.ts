/**
 * Supabase-backed EntitlementProvider — the real implementation of §6.
 *
 * Satisfies the exact same contract as the stub, so swapping it in (index.ts)
 * changes no feature code. Reads honour RLS via whatever client is injected:
 *  - browser anon client + user session → a user resolves only their own access
 *  - service-role client (webhook Worker) → bypasses RLS to grant/revoke
 *
 * Lesson access resolves lesson → course via the app catalog (lessons live in
 * code, not the DB), then defers to the DB `can_access_course` function.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { lessons } from '@/data/catalog';
import type {
  EntitlementProvider,
  CurrentUser,
  Entitlement,
  GrantOptions,
  AccessType,
  CourseId,
  LessonId,
  ProductId,
  UserId,
} from './types';

interface EntitlementRow {
  user_id: string;
  product_id: string;
  access_type: AccessType;
  status: 'active' | 'revoked' | 'expired';
  stripe_subscription_id: string | null;
  granted_at: string;
  expires_at: string | null;
}

const toEntitlement = (r: EntitlementRow): Entitlement => ({
  userId: r.user_id,
  productId: r.product_id,
  accessType: r.access_type,
  status: r.status,
  stripeSubscriptionId: r.stripe_subscription_id,
  grantedAt: r.granted_at,
  expiresAt: r.expires_at,
});

export class SupabaseEntitlementProvider implements EntitlementProvider {
  constructor(private readonly db: SupabaseClient) {}

  async getCurrentUser(): Promise<CurrentUser | null> {
    const { data: { user } } = await this.db.auth.getUser();
    if (!user) return null;

    const { data: profile } = await this.db
      .from('users')
      .select('email, name, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: profile?.email ?? user.email ?? '',
      name: profile?.name ?? null,
      stripeCustomerId: profile?.stripe_customer_id ?? null,
    };
  }

  async getUserEntitlements(userId: UserId): Promise<Entitlement[]> {
    const { data, error } = await this.db
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) throw error;
    return (data as EntitlementRow[] | null ?? []).map(toEntitlement);
  }

  async canAccessCourse(userId: UserId, courseId: CourseId): Promise<boolean> {
    const { data, error } = await this.db.rpc('can_access_course', {
      p_user: userId,
      p_course_slug: courseId,
    });
    if (error) throw error;
    return Boolean(data);
  }

  async canAccessLesson(userId: UserId, lessonId: LessonId): Promise<boolean> {
    const lesson = lessons.find((l) => l.slug === lessonId);
    if (!lesson) return false;                 // unknown lesson → fail closed
    if (lesson.access === 'free') return true; // free core is open to everyone
    if (!lesson.courseSlug) return false;      // premium standalone, no product mapping yet
    return this.canAccessCourse(userId, lesson.courseSlug);
  }

  async grantEntitlement(
    userId: UserId,
    productId: ProductId,
    accessType: AccessType,
    opts: GrantOptions = {},
  ): Promise<Entitlement> {
    // Upsert on (user_id, product_id): a re-grant re-activates the same record.
    const { data, error } = await this.db
      .from('entitlements')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          access_type: accessType,
          status: 'active',
          stripe_subscription_id: opts.stripeSubscriptionId ?? null,
          expires_at: opts.expiresAt ?? null,
          granted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,product_id' },
      )
      .select()
      .single();
    if (error) throw error;
    return toEntitlement(data as EntitlementRow);
  }

  async revokeEntitlement(userId: UserId, productId: ProductId): Promise<void> {
    const { error } = await this.db
      .from('entitlements')
      .update({ status: 'revoked' })
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
  }
}
