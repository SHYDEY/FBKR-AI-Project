import { type User } from '@supabase/supabase-js';
import { forbidden, redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase/server';

export type AppRole = 'ADMIN' | 'USER';

export type AppUser = {
  userId: string;
  email: string;
  name: string;
  department: string;
  role: AppRole;
  active: boolean;
  lastLoginAt: string | null;
};

export type AuthContext = { user: User; profile: AppUser };

function normalizeProfile(row: Record<string, unknown>): AppUser {
  return {
    userId: String(row.user_id ?? ''),
    email: String(row.email ?? ''),
    name: String(row.name ?? ''),
    department: String(row.department ?? ''),
    role: row.role === 'ADMIN' ? 'ADMIN' : 'USER',
    active: row.active !== false,
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
  };
}

async function getSessionProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data, error } = await supabase.schema('core').from('app_user').select('*').eq('user_id', user.id).maybeSingle();
  if (error || !data) return { supabase, user, profile: null };
  return { supabase, user, profile: normalizeProfile(data as Record<string, unknown>) };
}

export async function getRole(): Promise<AppRole | null> {
  const { profile } = await getSessionProfile();
  return profile?.active ? profile.role : null;
}

export async function requireUser(): Promise<AuthContext> {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile || !profile.active) redirect('/login');
  return { user, profile };
}

export async function requireAdmin(): Promise<AuthContext> {
  const context = await requireUser();
  if (context.profile.role !== 'ADMIN') forbidden();
  return context;
}
