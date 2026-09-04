import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const migration = 'supabase/migrations/20260904000400_create_sku_demand_profile.sql';

test('STEP5 migration과 demand profile route가 존재한다', () => {
  assert.equal(existsSync(join(root, migration)), true);
  assert.equal(existsSync(join(root, 'app/(user)/analysis/demand-profile/page.tsx')), true);
});

test('수요 프로파일 SQL은 학습 view만 사용하고 SB-Croston 기준을 선언한다', () => {
  const sql = readFileSync(join(root, migration), 'utf8');
  assert.match(sql, /core\.v_train_demand/i);
  assert.doesNotMatch(sql, /raw\.usage_history/i);
  assert.doesNotMatch(sql, /core\.v_test_actual/i);
  assert.match(sql, /1\.32/);
  assert.match(sql, /0\.49/);
  for (const type of ['SMOOTH', 'INTERMITTENT', 'ERRATIC', 'LUMPY']) assert.match(sql, new RegExp(type));
  for (const column of ['adi', 'cv_squared', 'zero_demand_rate', 'trend', 'recent_change_rate', 'peak_period', 'seasonality', 'reason_code', 'stability']) assert.match(sql, new RegExp(column));
});

test('기간 부족과 24개월 미만 계절성을 null reason으로 처리한다', () => {
  const sql = readFileSync(join(root, migration), 'utf8');
  assert.match(sql, /INSUFFICIENT_PERIODS/);
  assert.match(sql, /seasonality[\s\S]*null/i);
  assert.match(sql, /n_periods[\s\S]*24/i);
});

test('조회 계층은 analytics profile view를 사용한다', () => {
  const scm = readFileSync(join(root, 'lib/scm.ts'), 'utf8');
  const page = readFileSync(join(root, 'app/(user)/analysis/demand-profile/page.tsx'), 'utf8');
  const table = readFileSync(join(root, 'app/(user)/analysis/demand-profile/demand-profile-table.tsx'), 'utf8');
  assert.match(scm, /v_sku_demand_profile/);
  assert.match(scm, /v_demand_profile_kpi/);
  assert.doesNotMatch(page, /raw\.usage_history|v_test_actual/);
  assert.match(table, /Badge/);
  assert.match(table, /EmptyValue/);
});
