-- STEP2 인증·RBAC 권한 확인용 스크립트입니다.
-- 배포 시에는 supabase/migrations/20260828000200_auth_rbac.sql을 먼저 실행합니다.

revoke all on schema raw from anon, authenticated;
revoke all on schema core from anon;
revoke all on schema analytics from anon;
revoke all on all tables in schema raw from anon, authenticated;
revoke all on all tables in schema core from anon;
revoke all on all tables in schema analytics from anon;

grant usage on schema core, analytics to authenticated;
grant select on all tables in schema core, analytics to authenticated;

select has_schema_privilege('anon', 'core', 'usage') as anon_core_usage,
       has_schema_privilege('authenticated', 'analytics', 'usage') as authenticated_analytics_usage;
