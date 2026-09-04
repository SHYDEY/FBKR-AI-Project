-- 업무 데이터는 anon에게 쓰기 권한을 주지 않습니다.
revoke insert, update, delete on core.leadtime_plan from anon;
revoke insert, update, delete on core.usage_profile from anon;
grant insert, update, delete on core.leadtime_plan to authenticated;
grant insert, update, delete on core.usage_profile to authenticated;
alter table core.leadtime_plan enable row level security;
alter table core.usage_profile enable row level security;
drop policy if exists "수업용 전체 허용" on core.leadtime_plan;
drop policy if exists "수업용 전체 허용" on core.usage_profile;
drop policy if exists leadtime_plan_admin_update on core.leadtime_plan;
drop policy if exists usage_profile_admin_update on core.usage_profile;
create policy leadtime_plan_read on core.leadtime_plan for select to authenticated using (auth.uid() is not null);
create policy usage_profile_read on core.usage_profile for select to authenticated using (auth.uid() is not null);
create policy leadtime_plan_admin_update on core.leadtime_plan for all to authenticated using (core.is_admin()) with check (core.is_admin());
create policy usage_profile_admin_update on core.usage_profile for all to authenticated using (core.is_admin()) with check (core.is_admin());
