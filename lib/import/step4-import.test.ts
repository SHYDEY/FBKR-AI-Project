import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();

test('STEP4 import 모듈과 migration이 존재한다', () => {
  for (const file of ['lib/import/types.ts', 'lib/import/schema.ts', 'lib/import/parse.ts', 'lib/import/validate.ts', 'lib/import/repository.ts', 'lib/import/history.ts', 'supabase/migrations/20260904000300_create_import_pipeline.sql']) assert.equal(existsSync(join(root, file)), true, file);
});

test('지원 import type과 컬럼 자동 매핑 후보가 정의되어 있다', () => {
  const schema = readFileSync(join(root, 'lib/import/schema.ts'), 'utf8');
  for (const type of ['usage_history', 'inventory', 'item_master', 'supplier_master', 'purchase_order', 'goods_receipt', 'sales_order', 'business_event']) assert.match(schema, new RegExp(type));
  assert.match(schema, /품목코드/);
  assert.match(schema, /item_id/);
});

test('검증 모듈은 필수값·날짜·중복·마스터·음수 오류를 구분한다', () => {
  const validate = readFileSync(join(root, 'lib/import/validate.ts'), 'utf8');
  for (const code of ['REQUIRED', 'INVALID_DATE', 'DUPLICATE', 'ITEM_NOT_FOUND', 'NEGATIVE_VALUE']) assert.match(validate, new RegExp(code));
  assert.match(validate, /WARNING/);
  assert.match(validate, /ERROR/);
});

test('import migration은 staging, validation error, batch, rollback을 제공한다', () => {
  const sql = readFileSync(join(root, 'supabase/migrations/20260904000300_create_import_pipeline.sql'), 'utf8');
  for (const objectName of ['core.upload_batch', 'core.import_staging', 'core.validation_error', 'core.column_mapping', 'rollback_batch']) assert.match(sql, new RegExp(objectName.replace('.', '\\.'), 'i'));
  assert.match(sql, /batch_id/i);
  assert.match(sql, /FILE_UPLOAD/i);
  assert.match(sql, /core\.is_admin\(\)/i);
});

test('오류 CSV route는 원본 행과 오류 정보를 함께 내보낸다', () => {
  const route = readFileSync(join(root, 'app/api/import/errors/route.ts'), 'utf8');
  assert.match(route, /original_data/);
  assert.match(route, /error_code/);
  assert.match(route, /row_number/);
});
