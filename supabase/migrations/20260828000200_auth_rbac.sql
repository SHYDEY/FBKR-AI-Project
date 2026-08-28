-- RBAC/RLS migration aligned with 20260813000100_create_procurement_demand_core.sql
-- Assumption preserved from the original RBAC design:
--   authenticated users can read procurement data; only ADMIN users can write it.

create schema if not exists core;

create table if not exists core.app_user (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  department text not null default '',
  role text not null default 'USER' check (role in ('ADMIN', 'USER')),
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null,
  before jsonb,
  after jsonb,
  at timestamptz not null default now()
);

create or replace function core.set_updated_at()
returns trigger
language plpgsql
set search_path = core, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_user_set_updated_at on core.app_user;
create trigger app_user_set_updated_at
before update on core.app_user
for each row execute function core.set_updated_at();

create or replace function core.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = core, public
as $$
begin
  insert into core.app_user (user_id, email, name, department, role, active)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'department', ''),
    'USER',
    true
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function core.handle_new_auth_user();

-- Backfill users that existed before this migration. Existing RBAC rows are preserved.
insert into core.app_user (user_id, email, name, department, role, active)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'name', ''),
  coalesce(u.raw_user_meta_data ->> 'department', ''),
  'USER',
  true
from auth.users u
on conflict (user_id) do nothing;

create or replace function core.is_admin()
returns boolean
language sql
stable
security definer
set search_path = core
set row_security = off
as $$
  select exists (
    select 1
    from core.app_user
    where user_id = auth.uid()
      and role = 'ADMIN'
      and active = true
  );
$$;

create or replace function core.record_login()
returns void
language sql
security definer
set search_path = core
set row_security = off
as $$
  update core.app_user
     set last_login_at = now()
   where user_id = auth.uid()
     and active = true;
$$;

create or replace function core.audit_app_user_change()
returns trigger
language plpgsql
security definer
set search_path = core, public
as $$
begin
  if old.role is distinct from new.role then
    insert into core.audit_log (actor, action, target_type, target_id, before, after)
    values (
      auth.uid(),
      'USER_ROLE_CHANGED',
      'app_user',
      new.user_id::text,
      jsonb_build_object('role', old.role),
      jsonb_build_object('role', new.role)
    );
  end if;

  if old.active is distinct from new.active then
    insert into core.audit_log (actor, action, target_type, target_id, before, after)
    values (
      auth.uid(),
      case when new.active then 'USER_ACTIVATED' else 'USER_DEACTIVATED' end,
      'app_user',
      new.user_id::text,
      jsonb_build_object('active', old.active),
      jsonb_build_object('active', new.active)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists app_user_audit_change on core.app_user;
create trigger app_user_audit_change
after update of role, active on core.app_user
for each row execute function core.audit_app_user_change();

-- Enable RLS on RBAC tables.
alter table core.app_user enable row level security;
alter table core.audit_log enable row level security;

-- Enable RLS on the procurement tables created by the core migration.
alter table public.planning_runs enable row level security;
alter table public.ol_demand enable row level security;
alter table public.sfdc_pipeline enable row level security;
alter table public.bulk_deals enable row level security;
alter table public.historical_actuals enable row level security;
alter table public.demand_confirmations enable row level security;

-- Re-create core policies idempotently.
drop policy if exists app_user_select on core.app_user;
drop policy if exists app_user_admin_update_other on core.app_user;
drop policy if exists audit_log_admin_select on core.audit_log;
drop policy if exists audit_log_admin_insert on core.audit_log;
drop policy if exists audit_log_no_update on core.audit_log;
drop policy if exists audit_log_no_delete on core.audit_log;

create policy app_user_select
on core.app_user
for select
to authenticated
using (user_id = auth.uid() or core.is_admin());

create policy app_user_admin_update_other
on core.app_user
for update
to authenticated
using (core.is_admin() and user_id <> auth.uid())
with check (core.is_admin() and user_id <> auth.uid());

create policy audit_log_admin_select
on core.audit_log
for select
to authenticated
using (core.is_admin());

create policy audit_log_admin_insert
on core.audit_log
for insert
to authenticated
with check (core.is_admin() and actor = auth.uid());

create policy audit_log_no_update
on core.audit_log
for update
to authenticated
using (false)
with check (false);

create policy audit_log_no_delete
on core.audit_log
for delete
to authenticated
using (false);

-- Replace any earlier permissive/demo policies on the actual procurement tables.
drop policy if exists "수업용 전체 허용" on public.planning_runs;
drop policy if exists "수업용 전체 허용" on public.ol_demand;
drop policy if exists "수업용 전체 허용" on public.sfdc_pipeline;
drop policy if exists "수업용 전체 허용" on public.bulk_deals;
drop policy if exists "수업용 전체 허용" on public.historical_actuals;
drop policy if exists "수업용 전체 허용" on public.demand_confirmations;

drop policy if exists planning_runs_authenticated_select on public.planning_runs;
drop policy if exists planning_runs_admin_insert on public.planning_runs;
drop policy if exists planning_runs_admin_update on public.planning_runs;
drop policy if exists planning_runs_admin_delete on public.planning_runs;
drop policy if exists ol_demand_authenticated_select on public.ol_demand;
drop policy if exists ol_demand_admin_insert on public.ol_demand;
drop policy if exists ol_demand_admin_update on public.ol_demand;
drop policy if exists ol_demand_admin_delete on public.ol_demand;
drop policy if exists sfdc_pipeline_authenticated_select on public.sfdc_pipeline;
drop policy if exists sfdc_pipeline_admin_insert on public.sfdc_pipeline;
drop policy if exists sfdc_pipeline_admin_update on public.sfdc_pipeline;
drop policy if exists sfdc_pipeline_admin_delete on public.sfdc_pipeline;
drop policy if exists bulk_deals_authenticated_select on public.bulk_deals;
drop policy if exists bulk_deals_admin_insert on public.bulk_deals;
drop policy if exists bulk_deals_admin_update on public.bulk_deals;
drop policy if exists bulk_deals_admin_delete on public.bulk_deals;
drop policy if exists historical_actuals_authenticated_select on public.historical_actuals;
drop policy if exists historical_actuals_admin_insert on public.historical_actuals;
drop policy if exists historical_actuals_admin_update on public.historical_actuals;
drop policy if exists historical_actuals_admin_delete on public.historical_actuals;
drop policy if exists demand_confirmations_authenticated_select on public.demand_confirmations;
drop policy if exists demand_confirmations_admin_insert on public.demand_confirmations;
drop policy if exists demand_confirmations_admin_update on public.demand_confirmations;
drop policy if exists demand_confirmations_admin_delete on public.demand_confirmations;

-- planning_runs
create policy planning_runs_authenticated_select on public.planning_runs
for select to authenticated using (auth.uid() is not null);
create policy planning_runs_admin_insert on public.planning_runs
for insert to authenticated with check (core.is_admin());
create policy planning_runs_admin_update on public.planning_runs
for update to authenticated using (core.is_admin()) with check (core.is_admin());
create policy planning_runs_admin_delete on public.planning_runs
for delete to authenticated using (core.is_admin());

-- ol_demand
create policy ol_demand_authenticated_select on public.ol_demand
for select to authenticated using (auth.uid() is not null);
create policy ol_demand_admin_insert on public.ol_demand
for insert to authenticated with check (core.is_admin());
create policy ol_demand_admin_update on public.ol_demand
for update to authenticated using (core.is_admin()) with check (core.is_admin());
create policy ol_demand_admin_delete on public.ol_demand
for delete to authenticated using (core.is_admin());

-- sfdc_pipeline
create policy sfdc_pipeline_authenticated_select on public.sfdc_pipeline
for select to authenticated using (auth.uid() is not null);
create policy sfdc_pipeline_admin_insert on public.sfdc_pipeline
for insert to authenticated with check (core.is_admin());
create policy sfdc_pipeline_admin_update on public.sfdc_pipeline
for update to authenticated using (core.is_admin()) with check (core.is_admin());
create policy sfdc_pipeline_admin_delete on public.sfdc_pipeline
for delete to authenticated using (core.is_admin());

-- bulk_deals
create policy bulk_deals_authenticated_select on public.bulk_deals
for select to authenticated using (auth.uid() is not null);
create policy bulk_deals_admin_insert on public.bulk_deals
for insert to authenticated with check (core.is_admin());
create policy bulk_deals_admin_update on public.bulk_deals
for update to authenticated using (core.is_admin()) with check (core.is_admin());
create policy bulk_deals_admin_delete on public.bulk_deals
for delete to authenticated using (core.is_admin());

-- historical_actuals
create policy historical_actuals_authenticated_select on public.historical_actuals
for select to authenticated using (auth.uid() is not null);
create policy historical_actuals_admin_insert on public.historical_actuals
for insert to authenticated with check (core.is_admin());
create policy historical_actuals_admin_update on public.historical_actuals
for update to authenticated using (core.is_admin()) with check (core.is_admin());
create policy historical_actuals_admin_delete on public.historical_actuals
for delete to authenticated using (core.is_admin());

-- demand_confirmations
create policy demand_confirmations_authenticated_select on public.demand_confirmations
for select to authenticated using (auth.uid() is not null);
create policy demand_confirmations_admin_insert on public.demand_confirmations
for insert to authenticated with check (core.is_admin());
create policy demand_confirmations_admin_update on public.demand_confirmations
for update to authenticated using (core.is_admin()) with check (core.is_admin());
create policy demand_confirmations_admin_delete on public.demand_confirmations
for delete to authenticated using (core.is_admin());

-- Privileges: RLS determines which authenticated users can write.
revoke all on schema core from anon;
revoke all on core.app_user, core.audit_log from anon;
revoke all on public.planning_runs, public.ol_demand, public.sfdc_pipeline,
  public.bulk_deals, public.historical_actuals, public.demand_confirmations from anon;

revoke all on function core.is_admin() from public;
revoke all on function core.record_login() from public;

grant usage on schema core to authenticated;
grant select on core.app_user, core.audit_log to authenticated;
grant update on core.app_user to authenticated;
grant insert on core.audit_log to authenticated;

grant select, insert, update, delete on public.planning_runs, public.ol_demand,
  public.sfdc_pipeline, public.bulk_deals, public.historical_actuals,
  public.demand_confirmations to authenticated;

grant execute on function core.is_admin() to authenticated;
grant execute on function core.record_login() to authenticated;

alter default privileges in schema core grant select on tables to authenticated;

create index if not exists audit_log_target_idx on core.audit_log(target_type, target_id);
create index if not exists app_user_role_active_idx on core.app_user(role, active);
