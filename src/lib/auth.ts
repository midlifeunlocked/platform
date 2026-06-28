/**
 * Browser auth helpers — thin wrappers over Supabase Auth used by the auth
 * pages. The session is persisted by supabase-js and later read by the member
 * area and the gated-video token request. Access decisions still go through the
 * entitlement layer (§6), never these helpers.
 */
import { getBrowserClient } from '@/lib/entitlements/supabaseClient';

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getBrowserClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await getBrowserClient().auth.signUp({
    email,
    password,
    options: name ? { data: { name } } : undefined,
  });
  if (error) throw error;
  return { session: data.session };
}

export async function signOut(): Promise<void> {
  await getBrowserClient().auth.signOut();
}

export async function sendPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await getBrowserClient().auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await getBrowserClient().auth.updateUser({ password });
  if (error) throw error;
}

export async function getSession() {
  return (await getBrowserClient().auth.getSession()).data.session;
}
