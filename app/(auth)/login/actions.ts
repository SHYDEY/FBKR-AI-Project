'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

function safeNext(value: FormDataEntryValue | null) { const next = typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'; return next; }

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(formData.get('next'));
  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' };
  await supabase.rpc('record_login');
  redirect(next);
}

export async function logout() { const supabase = await createSupabaseServerClient(); await supabase.auth.signOut(); redirect('/login'); }
