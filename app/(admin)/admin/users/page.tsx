import PageHeader from '@/components/shell/page-header';
import Badge from '@/components/ui/badge';
import Panel from '@/components/ui/panel';
import InsightBanner from '@/components/ui/insight-banner';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { updateUserActive, updateUserRole } from './actions';

export const dynamic = 'force-dynamic';

type UserRow = { user_id: string; email: string; name: string; department: string; role: 'ADMIN' | 'USER'; active: boolean; last_login_at: string | null };

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '없음';
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string; updated?: string }> }) {
  const actor = await requireAdmin();
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.schema('core').from('app_user').select('*').order('email');
  if (error) return <section className="page-section"><PageHeader eyebrow="ADMINISTRATION / USERS" title="사용자 관리" description="사용자 role과 활성 상태를 관리합니다." /><InsightBanner tone="critical" title="사용자 목록을 불러오지 못했습니다.">{error.message}</InsightBanner></section>;

  const users = (data ?? []) as UserRow[];
  return <section className="page-section"><PageHeader eyebrow="ADMINISTRATION / USERS" title="사용자 관리" description="ADMIN만 다른 사용자의 role과 활성 상태를 변경할 수 있습니다." />{params.error ? <InsightBanner tone="critical">{params.error}</InsightBanner> : null}{params.updated ? <InsightBanner tone="safe">사용자 정보가 변경되었습니다.</InsightBanner> : null}<Panel title="사용자 목록" description={`${users.length}명`}><div className="admin-user-table-wrap"><table className="data-table"><thead><tr><th>사용자</th><th>부서</th><th>role</th><th>활성 상태</th><th>최근 로그인</th></tr></thead><tbody>{users.map((user) => { const self = user.user_id === actor.user.id; return <tr key={user.user_id}><td><strong>{user.name || '이름 없음'}</strong><div className="muted">{user.email}</div></td><td>{user.department || '미지정'}</td><td>{self ? <Badge tone="info">{user.role} · 현재 계정</Badge> : <form className="inline-form" action={updateUserRole}><input type="hidden" name="user_id" value={user.user_id} /><select name="role" defaultValue={user.role} aria-label={`${user.email} role`}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select><button className="ui-button ghost" type="submit">저장</button></form>}</td><td>{self ? <Badge tone="safe">활성 · 현재 계정</Badge> : <form className="inline-form" action={updateUserActive}><input type="hidden" name="user_id" value={user.user_id} /><input type="hidden" name="active" value={String(!user.active)} /><button className={`ui-button ${user.active ? 'ghost' : 'primary'}`} type="submit">{user.active ? '비활성화' : '활성화'}</button><Badge tone={user.active ? 'safe' : 'unavailable'}>{user.active ? '활성' : '비활성'}</Badge></form>}</td><td className="muted">{formatDate(user.last_login_at)}</td></tr>; })}</tbody></table></div>{users.length === 0 ? <p className="empty-state">등록된 사용자가 없습니다.</p> : null}</Panel></section>;
}
