import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  normalizeBomRequirement,
  normalizeDemandProfile,
  normalizeOlAccuracy,
  normalizeShipmentTrend,
} from './scm-model.ts';

const scmSource = readFileSync('lib/scm.ts', 'utf8');

test('조회 계층이 analytics 스키마의 실데이터 뷰를 사용한다', () => {
  assert.match(scmSource, /\.schema\(['"]analytics['"]\)/g);
  assert.match(scmSource, /v_shipment_trend/);
  assert.match(scmSource, /v_sku_demand_profile/);
  assert.match(scmSource, /v_demand_profile_kpi/);
  assert.match(scmSource, /v_ol_accuracy/);
  assert.match(scmSource, /v_bom_requirement_x/);
  assert.match(scmSource, /getShipmentTrend/);
  assert.match(scmSource, /getDemandProfileRt/);
  assert.match(scmSource, /getOlAccuracy/);
  assert.match(scmSource, /getBomRequirement/);
});

test('출고 추이 정규화가 확인된 실데이터 값을 보존한다', () => {
  const row = normalizeShipmentTrend({
    item_code: '602K02693',
    n_months: 40,
    avg_3m: 779,
    avg_12m: 772.3,
  });

  assert.equal(row.itemCode, '602K02693');
  assert.equal(row.nMonths, 40);
  assert.equal(row.avg3m, 779);
  assert.equal(row.avg12m, 772.3);
});

test('조회 모델은 계산 불가 reason_code와 null을 유지한다', () => {
  assert.equal(normalizeDemandProfile({ item_code: 'X', reason_code: 'NO_USAGE' }).adi, null);
  assert.equal(normalizeDemandProfile({ item_code: 'X', reason_code: 'NO_USAGE' }).reasonCode, 'NO_USAGE');
  assert.equal(normalizeOlAccuracy({ model_base: 'MDL193', wape: null }).wape, null);
  assert.equal(normalizeBomRequirement({ model_base: 'MDL193', qty: null }).quantity, null);
});
