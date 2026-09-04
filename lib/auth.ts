import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AppRole = 'ADMIN' | 'USER';
export type AuthContext = { user: { id: string; email?: string }; role: AppRole; profile: { user_id: string; email: string; name: string | null; department: string | null; role: AppRole; active: boolean } };

export async function getRole(): Promise<AppRole | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.schema('core').from('app_user').select('role, active').eq('user_id', user.id).maybeSingle();
  if (!data?.active || (data.role !== 'ADMIN' && data.role !== 'USER')) return null;
  return data.role;
}

export async function requireUser(): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  const { data: profile, error } = await supabase.schema('core').from('app_user').select('user_id, email, name, department, role, active').eq('user_id', user.id).maybeSingle();
  if (error || !profile?.active || (profile.role !== 'ADMIN' && profile.role !== 'USER')) throw new Error('INACTIVE_OR_UNAUTHORIZED');
  return { user: { id: user.id, email: user.email }, role: profile.role, profile };
}

export async function requireAdmin(): Promise<AuthContext> {
  const context = await requireUser();
  if (context.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return context;
}
