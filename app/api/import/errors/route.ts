import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const csv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const batchId = new URL(request.url).searchParams.get('batch_id');
    if (!batchId) return NextResponse.json({ error: 'batch_id가 필요합니다.' }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    const [errorsResult, stagingResult] = await Promise.all([
      supabase.schema('core').from('validation_error').select('row_number, field_name, error_code, error_message, severity, original_value').eq('batch_id', batchId).order('row_number'),
      supabase.schema('core').from('import_staging').select('row_number, original_data').eq('batch_id', batchId).order('row_number'),
    ]);
    if (errorsResult.error) return NextResponse.json({ error: errorsResult.error.message }, { status: 500 });
    if (stagingResult.error) return NextResponse.json({ error: stagingResult.error.message }, { status: 500 });
    const errorByRow = new Map<number, typeof errorsResult.data>();
    for (const error of errorsResult.data ?? []) errorByRow.set(error.row_number, [...(errorByRow.get(error.row_number) ?? []), error]);
    const columns = Array.from(new Set((stagingResult.data ?? []).flatMap((row) => Object.keys((row.original_data ?? {}) as Record<string, unknown>))));
    const header = [...columns, 'row_number', 'field_name', 'error_code', 'error_message', 'severity', 'original_value'];
    const lines = [header, ...(stagingResult.data ?? []).flatMap((row) => (errorByRow.get(row.row_number) ?? []).map((error) => { const original = (row.original_data ?? {}) as Record<string, unknown>; return [...columns.map((column) => original[column]), row.row_number, error.field_name, error.error_code, error.error_message, error.severity, error.original_value]; }))].map((line) => line.map(csv).join(',')).join('\r\n');
    return new NextResponse(`\uFEFF${lines}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="validation-errors-${batchId}.csv"` } });
  } catch { return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 }); }
}
