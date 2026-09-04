import { createSupabaseServerClient } from './supabase/server';
import {
  normalizeBomRequirement,
  normalizeDemandProfile,
  normalizeDemandProfileKpi,
  normalizeLeadtimeGap,
  normalizeOlAccuracy,
  normalizeShipmentTrend,
  type BomRequirement,
  type DemandProfile,
  type DemandProfileKpi,
  type LeadtimeGap,
  type OlAccuracy,
  type ShipmentTrend,
} from './scm-model';

type QueryResult<T> = { rows: T[]; error: string | null };

async function readAnalyticsRows<T>(
  view: string,
  normalize: (row: Record<string, unknown>) => T,
  filter?: { column: string; value: string }
): Promise<QueryResult<T>> {
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase.schema('analytics').from(view).select('*');
    if (filter) query = query.eq(filter.column, filter.value);
    const { data, error } = await query;
    if (error) return { rows: [], error: error.message };
    return {
      rows: (data ?? []).map((row) => normalize(row as Record<string, unknown>)),
      error: null,
    };
  } catch (error) {
    return { rows: [], error: error instanceof Error ? error.message : 'Supabase 조회에 실패했습니다.' };
  }
}

export function getShipmentTrend(itemCode?: string): Promise<QueryResult<ShipmentTrend>> {
  return readAnalyticsRows('v_shipment_trend', normalizeShipmentTrend, itemCode ? { column: 'item_code', value: itemCode } : undefined);
}

export function getDemandProfileRt(itemCode?: string): Promise<QueryResult<DemandProfile>> {
  return readAnalyticsRows('v_sku_demand_profile', normalizeDemandProfile, itemCode ? { column: 'item_id', value: itemCode } : undefined);
}

export function getDemandProfileKpi(): Promise<QueryResult<DemandProfileKpi>> { return readAnalyticsRows('v_demand_profile_kpi', normalizeDemandProfileKpi); }

export function getOlAccuracy(modelBase?: string): Promise<QueryResult<OlAccuracy>> {
  return readAnalyticsRows('v_ol_accuracy', normalizeOlAccuracy, modelBase ? { column: 'model_base', value: modelBase } : undefined);
}

export function getBomRequirement(modelBase: string): Promise<QueryResult<BomRequirement>> {
  return readAnalyticsRows('v_bom_requirement_x', normalizeBomRequirement, { column: 'model_base', value: modelBase });
}

export async function getLeadtimeGap(): Promise<{ rows: LeadtimeGap[]; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.schema('analytics').from('v_leadtime_gap').select('*');
    if (error) return { rows: [], error: error.message };
    return { rows: (data ?? []).map((row) => normalizeLeadtimeGap(row as Record<string, unknown>)), error: null };
  } catch (error) {
    return { rows: [], error: error instanceof Error ? error.message : 'Supabase 조회에 실패했습니다.' };
  }
}

export async function getStockoutKpi() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.schema('analytics').from('v_stockout_kpi').select('*').maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Supabase 조회에 실패했습니다.' };
  }
}
