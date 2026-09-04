export type LeadtimeGap = {
  supplier: string;
  country: string;
  masterLeadTime: number | null;
  sampleCount: number;
  actualAverage: number | null;
  p80: number | null;
  gap: number | null;
};

export type ShipmentTrend = {
  itemCode: string;
  ym: string | null;
  qty: number | null;
  nMonths: number | null;
  avg3m: number | null;
  avg6m: number | null;
  avg12m: number | null;
};

export type DemandProfile = {
  itemCode: string;
  itemName: string | null;
  nPeriods: number | null;
  nNonzeroPeriods: number | null;
  adi: number | null;
  cv: number | null;
  cv2: number | null;
  noDemandRate: number | null;
  trend: number | null;
  recentChangeRate: number | null;
  peakPeriod: string | null;
  demandType: string | null;
  seasonality: boolean | null;
  reasonCode: string | null;
  stability: string | null;
};

export type DemandProfileKpi = { totalItems: number; nSmooth: number; nIntermittent: number; nErratic: number; nLumpy: number; nCrostonNeeded: number; nCalculationUnavailable: number };

export type OlAccuracy = {
  modelBase: string;
  fy: string | null;
  wape: number | null;
  bias: number | null;
};

export type BomRequirement = {
  modelBase: string;
  itemCode: string;
  itemName: string | null;
  quantity: number | null;
  bomGroup: string | null;
  active: string | null;
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

export function normalizeShipmentTrend(row: Record<string, unknown>): ShipmentTrend {
  return {
    itemCode: String(value(row, ['item_code', 'itemCode', '품목코드']) ?? ''),
    ym: value(row, ['ym', 'month', '월']) === null ? null : String(value(row, ['ym', 'month', '월'])),
    qty: numberValue(row, ['qty', 'shipment_qty', '출고수량']),
    nMonths: numberValue(row, ['n_months', 'months', '관측개월수']),
    avg3m: numberValue(row, ['avg_3m', 'average_3m', '3m_avg', '3개월평균']),
    avg6m: numberValue(row, ['avg_6m', 'average_6m', '6m_avg', '6개월평균']),
    avg12m: numberValue(row, ['avg_12m', 'average_12m', '12m_avg', '12개월평균']),
  };
}

export function normalizeDemandProfile(row: Record<string, unknown>): DemandProfile {
  const reason = value(row, ['reason_code', 'reasonCode', '사유코드']);
  const demandType = value(row, ['demand_type', 'demandType', '수요유형']);
  const seasonality = value(row, ['seasonality', '계절성']);
  return {
    itemCode: String(value(row, ['item_code', 'itemCode', '품목코드']) ?? ''),
    itemName: value(row, ['item_name', 'itemName', '품목명']) === null ? null : String(value(row, ['item_name', 'itemName', '품목명'])),
    nPeriods: numberValue(row, ['n_periods', 'periods', '기간수']),
    nNonzeroPeriods: numberValue(row, ['n_nonzero_periods', 'nonzero_periods', '수요발생기간수']),
    adi: numberValue(row, ['adi', 'ADI']),
    cv: numberValue(row, ['cv', 'CV']),
    cv2: numberValue(row, ['cv2', 'cv_squared', 'CV²', 'CV2']),
    noDemandRate: numberValue(row, ['no_demand_rate', 'zero_demand_rate', '무수요율']),
    trend: numberValue(row, ['trend', 'trend_per_period', '추세']),
    recentChangeRate: numberValue(row, ['recent_change_rate', 'recentChangeRate', '최근증감률']),
    peakPeriod: value(row, ['peak_period', 'peakPeriod', '최대수요기간']) === null ? null : String(value(row, ['peak_period', 'peakPeriod', '최대수요기간'])),
    demandType: demandType === null ? null : String(demandType),
    seasonality: seasonality === null ? null : seasonality === true || String(seasonality).toLowerCase() === 'true',
    reasonCode: reason === null ? null : String(reason),
    stability: value(row, ['stability', '안정성']) === null ? null : String(value(row, ['stability', '안정성'])),
  };
}

export function normalizeDemandProfileKpi(row: Record<string, unknown>): DemandProfileKpi {
  return { totalItems: numberValue(row, ['total_items']) ?? 0, nSmooth: numberValue(row, ['n_smooth']) ?? 0, nIntermittent: numberValue(row, ['n_intermittent']) ?? 0, nErratic: numberValue(row, ['n_erratic']) ?? 0, nLumpy: numberValue(row, ['n_lumpy']) ?? 0, nCrostonNeeded: numberValue(row, ['n_croston_needed']) ?? 0, nCalculationUnavailable: numberValue(row, ['n_calculation_unavailable']) ?? 0 };
}

export function normalizeOlAccuracy(row: Record<string, unknown>): OlAccuracy {
  const fy = value(row, ['fy', 'fy_sheet', 'fiscal_year', '회계연도']);
  return {
    modelBase: String(value(row, ['model_base', 'modelBase', '기종']) ?? ''),
    fy: fy === null ? null : String(fy),
    wape: numberValue(row, ['wape', 'WAPE']),
    bias: numberValue(row, ['bias', 'Bias']),
  };
}

export function normalizeBomRequirement(row: Record<string, unknown>): BomRequirement {
  const itemName = value(row, ['item_name', 'item_description', '품목명']);
  const bomGroup = value(row, ['bom_group', 'bomGroup', '구성그룹']);
  const active = value(row, ['active', '활성']);
  return {
    modelBase: String(value(row, ['model_base', 'modelBase', '기종']) ?? ''),
    itemCode: String(value(row, ['item_code', 'itemCode', '품목코드']) ?? ''),
    itemName: itemName === null ? null : String(itemName),
    quantity: numberValue(row, ['qty', 'quantity', 'requirement_qty', '구성수량']),
    bomGroup: bomGroup === null ? null : String(bomGroup),
    active: active === null ? null : String(active),
  };
}
