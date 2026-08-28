'use server';

import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function backWithError(message: string): never {
  redirect(`/admin/users?error=${encodeURIComponent(message)}`);
}

export async function updateUserRole(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const userId = formText(formData, 'user_id');
  const role = formText(formData, 'role');
  if (!userId || userId === actor.user.id) backWithError('자신의 관리자 권한은 변경할 수 없습니다.');
  if (role !== 'ADMIN' && role !== 'USER') backWithError('올바르지 않은 role입니다.');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.schema('core').from('app_user').update({ role }).eq('user_id', userId);
  if (error) backWithError(`role 변경에 실패했습니다: ${error.message}`);
  redirect('/admin/users?updated=role');
}

export async function updateUserActive(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const userId = formText(formData, 'user_id');
  const active = formText(formData, 'active');
  if (!userId || userId === actor.user.id) backWithError('자신의 계정은 비활성화할 수 없습니다.');
  if (active !== 'true' && active !== 'false') backWithError('올바르지 않은 활성 상태입니다.');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.schema('core').from('app_user').update({ active: active === 'true' }).eq('user_id', userId);
  if (error) backWithError(`활성 상태 변경에 실패했습니다: ${error.message}`);
  redirect('/admin/users?updated=active');
}
