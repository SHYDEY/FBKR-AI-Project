'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export async function signInAction(_previous: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: '이메일 또는 비밀번호를 확인해주세요.' };

  await supabase.rpc('record_login');
  redirect(safeNext(formData.get('next')));
}
