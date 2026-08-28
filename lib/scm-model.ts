export type LeadtimeGap = {
  supplier: string;
  country: string;
  masterLeadTime: number | null;
  sampleCount: number;
  actualAverage: number | null;
  p80: number | null;
  gap: number | null;
};

export type StockoutRiskStatus = 'SAFE' | 'CRITICAL' | 'UNKNOWN';

export type StockoutRisk = {
  itemId: string;
  itemName: string;
  supplierId: string;
  currentStock: number | null;
  inboundQty: number | null;
  availableQty: number | null;
  dailyUsageAvg: number | null;
  stockoutDays: number | null;
  stockoutDate: string | null;
  riskStatus: StockoutRiskStatus;
  reason: 'NO_USAGE' | 'NO_LEADTIME' | null;
};

export type StockoutKpi = {
  nItems: number;
  nCritical: number;
  nSafe: number;
  nUnknown: number;
  nWithin30d: number;
  avgStockoutDays: number | null;
};

function value(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
  }
  return null;
}

function numberValue(row: Record<string, unknown>, keys: string[]) {
  const raw = value(row, keys);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeLeadtimeGap(row: Record<string, unknown>): LeadtimeGap {
  return {
    supplier: String(value(row, ['supplier_name', 'supplier', '법인', '공급처', '공급업체명']) ?? '미정'),
    country: String(value(row, ['country', '국가']) ?? '미정'),
    masterLeadTime: numberValue(row, ['std_lead_time', 'master_lt', 'master_lead_time', 'planned_lead_time', '표준리드타임', '표준리드타임(일)', '마스터값']),
    sampleCount: numberValue(row, ['n_samples', 'sample_count', 'samples', '표본수']) ?? 0,
    actualAverage: numberValue(row, ['mean_days', 'actual_avg', 'actual_average', 'avg_lead_time', '실적평균']),
    p80: numberValue(row, ['p80_days', 'p80', 'P80']),
    gap: numberValue(row, ['gap_days', 'gap', 'leadtime_gap', '격차']),
  };
}

export function normalizeStockoutRisk(row: Record<string, unknown>): StockoutRisk {
  const status = String(value(row, ['risk_status', 'status', '위험상태']) ?? 'UNKNOWN').toUpperCase();
  const reasonValue = value(row, ['reason', 'reason_code', '사유']);
  const reason = reasonValue === 'NO_USAGE' || reasonValue === 'NO_LEADTIME' ? reasonValue : null;
  return {
    itemId: String(value(row, ['item_id', 'item_code', '품목코드']) ?? '미정'),
    itemName: String(value(row, ['item_name', '품목명']) ?? '미정'),
    supplierId: String(value(row, ['supplier_id', 'supplier', '공급처코드']) ?? '미정'),
    currentStock: numberValue(row, ['current_stock', 'stock_on_hand', '현재고']),
    inboundQty: numberValue(row, ['inbound_qty', 'inbound', '입고예정']),
    availableQty: numberValue(row, ['available_qty', 'available', '가용수량']),
    dailyUsageAvg: numberValue(row, ['daily_usage_avg', 'avg_daily_usage', '일평균사용량']),
    stockoutDays: numberValue(row, ['stockout_days', '소진일수']),
    stockoutDate: value(row, ['stockout_date', '소진예상일']) === null ? null : String(value(row, ['stockout_date', '소진예상일'])),
    riskStatus: status === 'SAFE' || status === 'CRITICAL' ? status : 'UNKNOWN',
    reason,
  };
}

export function normalizeStockoutKpi(row: Record<string, unknown>): StockoutKpi {
  return {
    nItems: numberValue(row, ['n_items', 'items', '품목수']) ?? 0,
    nCritical: numberValue(row, ['n_critical', 'critical', '위험품목수']) ?? 0,
    nSafe: numberValue(row, ['n_safe', 'safe', '안전품목수']) ?? 0,
    nUnknown: numberValue(row, ['n_unknown', 'unknown', '계산불가수']) ?? 0,
    nWithin30d: numberValue(row, ['n_within_30d', 'within_30d', '30일이내']) ?? 0,
    avgStockoutDays: numberValue(row, ['avg_stockout_days', 'average_stockout_days', '평균소진일수']),
  };
}
