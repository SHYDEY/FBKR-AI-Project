-- STEP5: SKU 수요 프로파일. 모든 통계의 원천은 core.v_train_demand입니다.
create or replace view analytics.v_sku_demand_profile as
with setting as (
  select train_start, train_end
  from core.forecast_setting
  where active
  order by setting_id
  limit 1
), months as (
  select generate_series(date_trunc('month', train_start)::date, date_trunc('month', train_end)::date, interval '1 month')::date as period
  from setting
), sku as (
  select item_id, item_name
  from core.v_item_master
  where coalesce(is_active, 'Y') <> 'N'
), monthly as (
  select item_id, date_trunc('month', use_date)::date as period,
    sum(qty) as quantity, count(*) as record_count
  from core.v_train_demand
  group by item_id, date_trunc('month', use_date)::date
), grid as (
  select s.item_id, s.item_name, m.period,
    case when x.record_count is null then 0 else x.quantity end::numeric as quantity,
    row_number() over (partition by s.item_id order by m.period) as period_index
  from sku s cross join months m left join monthly x on x.item_id = s.item_id and x.period = m.period
), stats as (
  select item_id, max(item_name) as item_name, count(*)::integer as n_periods,
    count(*) filter (where quantity > 0)::integer as n_nonzero_periods,
    avg(quantity) filter (where quantity > 0) as positive_mean,
    stddev_samp(quantity) filter (where quantity > 0) as positive_sd,
    regr_slope(quantity, period_index) as trend,
    (array_agg(period order by quantity desc, period asc))[1] as peak_period,
    avg(quantity) filter (where period >= (select date_trunc('month', train_end)::date - interval '2 months' from setting)) as recent_mean,
    avg(quantity) filter (where period < (select date_trunc('month', train_end)::date - interval '2 months' from setting) and period >= (select date_trunc('month', train_end)::date - interval '5 months' from setting)) as prior_recent_mean,
    max(period) as last_period
  from grid
  group by item_id
), season_month as (
  select item_id, extract(month from period)::integer as calendar_month, avg(quantity) as month_mean
  from grid
  group by item_id, extract(month from period)
), season as (
  select sm.item_id,
    case when st.n_periods < 24 then null::boolean
      when avg(st_month.quantity) = 0 then null::boolean
      when (max(sm.month_mean) - min(sm.month_mean)) / nullif(avg(st_month.quantity), 0) >= 0.3 then true
      else false end as seasonality
  from season_month sm join stats st using (item_id) join grid st_month using (item_id)
  group by sm.item_id, st.n_periods
), calculated as (
  select st.*, se.seasonality,
    case when st.n_nonzero_periods = 0 then null::numeric else st.n_periods::numeric / st.n_nonzero_periods end as adi,
    case when st.positive_mean is null or st.positive_mean = 0 or st.n_nonzero_periods < 2 then null::numeric else st.positive_sd / st.positive_mean end as cv,
    case when st.recent_mean is null or st.prior_recent_mean is null or st.prior_recent_mean = 0 then null::numeric else st.recent_mean / st.prior_recent_mean - 1 end as recent_change_rate
  from stats st left join season se using (item_id)
)
select item_id, item_name, n_periods, n_nonzero_periods, adi, cv, cv * cv as cv_squared,
  (n_periods - n_nonzero_periods)::numeric / nullif(n_periods, 0) as zero_demand_rate,
  trend, recent_change_rate, peak_period,
  case when adi is null or cv is null then null
    when adi < 1.32 and cv * cv < 0.49 then 'SMOOTH'
    when adi >= 1.32 and cv * cv < 0.49 then 'INTERMITTENT'
    when adi < 1.32 and cv * cv >= 0.49 then 'ERRATIC'
    else 'LUMPY' end as demand_type,
  seasonality,
  case when n_nonzero_periods = 0 then 'NO_DEMAND'
    when n_nonzero_periods < 2 or positive_mean is null then 'INSUFFICIENT_OBSERVATIONS'
    when n_periods < 24 then 'INSUFFICIENT_PERIODS'
    when recent_change_rate is null then 'NO_RECENT_BASELINE'
    else null end as reason_code,
  case when cv is null then 'CALCULATION_UNAVAILABLE' when cv * cv < 0.49 then 'STABLE' else 'VARIABLE' end as stability
from calculated;

create or replace view analytics.v_demand_profile_kpi as
select count(*)::integer as total_items,
  count(*) filter (where demand_type = 'SMOOTH')::integer as n_smooth,
  count(*) filter (where demand_type = 'INTERMITTENT')::integer as n_intermittent,
  count(*) filter (where demand_type = 'ERRATIC')::integer as n_erratic,
  count(*) filter (where demand_type = 'LUMPY')::integer as n_lumpy,
  count(*) filter (where demand_type in ('INTERMITTENT','LUMPY'))::integer as n_croston_needed,
  count(*) filter (where demand_type is null)::integer as n_calculation_unavailable
from analytics.v_sku_demand_profile;

grant select on analytics.v_sku_demand_profile, analytics.v_demand_profile_kpi to authenticated;
