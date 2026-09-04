'use client';

import { useState, useTransition } from 'react';
import { approveImport, previewImport, validateAndStage, type ImportActionState } from '@/lib/import/actions';
import { importSchemas } from '@/lib/import/schema';
import { IMPORT_TYPES, type ImportType } from '@/lib/import/types';

const initial: ImportActionState = { error: null };

export default function UploadForm() {
  const [preview, setPreview] = useState<ImportActionState['preview']>();
  const [result, setResult] = useState<ImportActionState>();
  const [file, setFile] = useState<File>();
  const [type, setType] = useState<ImportType>(IMPORT_TYPES[0]);
  const [mode, setMode] = useState<'append' | 'upsert' | 'replace'>('append');
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const targets = Object.keys(importSchemas[type].aliases);
  const runPreview = () => { if (!file) return; const data = new FormData(); data.set('file', file); data.set('import_type', type); startTransition(async () => { const state = await previewImport(initial, data); setPreview(state.preview); setMapping(state.preview?.mapping ?? {}); setResult(state); }); };
  const runValidation = () => { if (!file) return; const data = new FormData(); data.set('file', file); data.set('import_type', type); data.set('import_mode', mode); data.set('mapping_json', JSON.stringify(mapping)); startTransition(async () => setResult(await validateAndStage(initial, data))); };
  const runImport = () => { if (!result?.batchId) return; const confirmed = mode !== 'replace' || window.confirm('replace는 기존 대상 데이터를 삭제할 수 있습니다. 계속하시겠습니까?'); if (!confirmed) return; startTransition(async () => setResult({ error: (await approveImport(result.batchId!, confirmed)).error ?? '적재 완료' })); };
  return <div className="import-flow"><label>파일<input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files?.[0])} /></label><label>데이터 종류<select value={type} onChange={(e) => { setType(e.target.value as ImportType); setPreview(undefined); setResult(undefined); }}>{IMPORT_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Import mode<select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}><option value="append">append</option><option value="upsert">upsert</option><option value="replace">replace</option></select></label><div className="button-row"><button className="button" onClick={runPreview} disabled={!file || pending}>Preview</button><button className="button button-primary" onClick={runValidation} disabled={!preview || pending}>Validation</button><button className="button" onClick={runImport} disabled={!result?.batchId || result.validation?.errorRows !== 0 || pending}>Import</button></div>{preview && <><h3>Column Mapping</h3><div className="mapping-grid">{preview.columns.map((column) => <label key={column}>{column}<select value={mapping[column] ?? ''} onChange={(e) => setMapping((current) => ({ ...current, [column]: e.target.value }))}><option value="">매핑 안 함</option>{targets.map((target) => <option key={target} value={target}>{target}</option>)}</select></label>)}</div><h3>Preview (최대 20행)</h3><pre>{JSON.stringify({ columns: preview.columns, rows: preview.rows }, null, 2)}</pre></>}{result?.validation && <p>검증 결과: {result.validation.status} · 성공 {result.validation.successRows} · 경고 {result.validation.warningRows} · 오류 {result.validation.errorRows}</p>}{result?.error && <p className={result.error === '적재 완료' ? 'text-good' : 'text-danger'}>{result.error}</p>}</div>;
}
