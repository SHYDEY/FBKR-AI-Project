-- STEP2 RLS 정책은 supabase/migrations/20260828000200_auth_rbac.sql에 정의합니다.
-- 이 파일은 과거 수업용 전체 허용 정책을 재생성하지 않도록 안내용으로만 남깁니다.
-- 다음 형태의 정책은 사용하지 않습니다.
-- 과거의 전체 공개 정책은 제거했으며, 새 정책에는 포함하지 않습니다.

select schemaname, tablename, policyname, roles, cmd
  from pg_policies
 where schemaname in ('core', 'analytics')
 order by schemaname, tablename, policyname;
