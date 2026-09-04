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
  adi: number | null;
  cv2: number | null;
  noDemandRate: number | null;
  demandType: string | null;
  reasonCode: string | null;
};

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
  return {
    itemCode: String(value(row, ['item_code', 'itemCode', '품목코드']) ?? ''),
    adi: numberValue(row, ['adi', 'ADI']),
    cv2: numberValue(row, ['cv2', 'cv_squared', 'CV²', 'CV2']),
    noDemandRate: numberValue(row, ['no_demand_rate', 'zero_demand_rate', '무수요율']),
    demandType: demandType === null ? null : String(demandType),
    reasonCode: reason === null ? null : String(reason),
  };
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
