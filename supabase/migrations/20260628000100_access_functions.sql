-- Access-check function (PROJECT_SPEC §6, §7).
--
-- `can_access_course` is the DB-side truth for "does this user hold an active
-- entitlement to a product that includes this course?" SECURITY INVOKER (the
-- default) so RLS applies: an authenticated caller can only resolve their own
-- entitlements; the service-role webhook bypasses RLS and can check anyone.
-- Lesson-level checks resolve lesson → course in the app catalog, then call this.

create function public.can_access_course(p_user uuid, p_course_slug text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.entitlements e
    join public.product_courses pc on pc.product_id = e.product_id
    join public.courses c on c.id = pc.course_id
    where e.user_id = p_user
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
      and c.slug = p_course_slug
  );
$$;

grant execute on function public.can_access_course(uuid, text) to anon, authenticated, service_role;
