'use server';

import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { inferMapping } from './schema';
import { parseImportFile } from './parse';
import { saveStaging, importBatch, rollbackBatch } from './repository';
import type { ImportMode, ImportType, ColumnMapping } from './types';
import { validateRows } from './validate';

export type ImportActionState = { error: string | null; batchId?: string; preview?: { columns: string[]; rows: Record<string, unknown>[]; mapping: ColumnMapping }; validation?: { totalRows: number; successRows: number; warningRows: number; errorRows: number; status: string } };

export async function previewImport(_state: ImportActionState, formData: FormData): Promise<ImportActionState> { await requireAdmin(); const file = formData.get('file'); const type = String(formData.get('import_type') ?? '') as ImportType; if (!(file instanceof File) || !file.size) return { error: 'CSV 또는 XLSX 파일을 선택해주세요.' }; try { const parsed = parseImportFile(file.name, Buffer.from(await file.arrayBuffer())); return { error: null, preview: { columns: parsed.columns, rows: parsed.rows.slice(0, 20), mapping: inferMapping(type, parsed.columns) } }; } catch (error) { return { error: error instanceof Error ? error.message : '파일을 읽을 수 없습니다.' }; } }

export async function validateAndStage(_state: ImportActionState, formData: FormData): Promise<ImportActionState> { const actor = await requireAdmin(); const file = formData.get('file'); const type = String(formData.get('import_type') ?? '') as ImportType; const mode = String(formData.get('import_mode') ?? 'append') as ImportMode; const mapping = JSON.parse(String(formData.get('mapping_json') ?? '{}')) as ColumnMapping; if (!(file instanceof File) || !file.size) return { error: '파일을 다시 선택해주세요.' }; try { const parsed = parseImportFile(file.name, Buffer.from(await file.arrayBuffer())); const supabase = await createSupabaseServerClient(); const [items, suppliers] = await Promise.all([supabase.schema('core').from('v_item_master').select('item_id'), supabase.schema('core').from('supplier_alias').select('supplier_id')]); const itemIds = new Set((items.data ?? []).map((row) => String(row.item_id))); const supplierIds = new Set((suppliers.data ?? []).map((row) => String(row.supplier_id)).filter(Boolean)); const validation = validateRows(type, parsed.rows, mapping, { itemIds, supplierIds }); const saved = await saveStaging({ fileName: file.name, importType: type, importMode: mode, rows: parsed.rows, mapping, validation, uploadedBy: actor.user.id }); if (saved.error) return { error: saved.error }; return { error: null, batchId: saved.batchId ?? undefined, validation: { totalRows: parsed.rows.length, successRows: validation.successRows, warningRows: validation.warningRows, errorRows: validation.errorRows, status: validation.status } }; } catch (error) { return { error: error instanceof Error ? error.message : '검증에 실패했습니다.' }; } }

export async function approveImport(batchId: string, replaceConfirmed = false) { await requireAdmin(); const supabase = await createSupabaseServerClient(); const { data: batch } = await supabase.schema('core').from('upload_batch').select('import_mode').eq('batch_id', batchId).maybeSingle(); if (batch?.import_mode === 'replace' && !replaceConfirmed) return { error: 'replace 실행 확인이 필요합니다.' }; return importBatch(batchId); }
export async function rollbackImportedBatch(batchId: string) { await requireAdmin(); return rollbackBatch(batchId); }
