import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const migrationPath = 'supabase/migrations/20260904000200_extend_data_model_and_isolation.sql';

test('STEP3 데이터 모델 migration이 존재한다', () => {
  assert.equal(existsSync(join(root, migrationPath)), true);
});

test('train/test view가 설정 테이블 기간을 사용한다', () => {
  const sql = readFileSync(join(root, migrationPath), 'utf8');
  for (const objectName of ['raw.business_event', 'raw.sales_order', 'raw.item_substitute', 'core.policy_config', 'core.outlier_rule', 'core.item_policy', 'core.forecast_setting', 'core.v_train_demand', 'core.v_test_actual', 'analytics.v_data_coverage', 'analytics.v_forecast_setting_summary']) assert.match(sql, new RegExp(objectName.replace('.', '\\.'), 'i'));
  assert.match(sql, /forecast_setting[\s\S]*train_start[\s\S]*train_end[\s\S]*test_start[\s\S]*test_end/i);
  assert.match(sql, /v_train_demand[\s\S]*use_date[\s\S]*train_start[\s\S]*train_end/i);
  assert.match(sql, /v_test_actual[\s\S]*use_date[\s\S]*test_start[\s\S]*test_end/i);
});

test('학습용 기존 view는 raw usage_history를 직접 읽지 않는다', () => {
  const dump = readFileSync(join(root, 'dump.sql'), 'utf8');
  const scm = readFileSync(join(root, 'lib/scm.ts'), 'utf8');
  assert.match(dump, /raw\.usage_history/i);
  assert.doesNotMatch(scm, /raw\.usage_history/i);
  const sql = readFileSync(join(root, migrationPath), 'utf8');
  const usageEffective = sql.match(/create or replace view core\.v_usage_effective[\s\S]*?(?=create or replace view|grant|$)/i)?.[0] ?? '';
  assert.doesNotMatch(usageEffective, /raw\.usage_history/i);
  assert.match(usageEffective, /core\.v_train_demand/i);
});

test('raw 추적 컬럼과 정책 RLS가 선언되어 있다', () => {
  const sql = readFileSync(join(root, migrationPath), 'utf8');
  for (const column of ['batch_id', 'source_type', 'loaded_at', 'source_record_id']) assert.match(sql, new RegExp(column, 'i'));
  assert.match(sql, /revoke all[\s\S]*from anon/i);
  assert.match(sql, /core\.is_admin\(\)/i);
});
