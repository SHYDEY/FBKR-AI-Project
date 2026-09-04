import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ParsedImport, RawRow } from './types';

export function parseImportFile(fileName: string, buffer: Buffer): ParsedImport { const extension = fileName.toLowerCase().split('.').pop(); if (extension === 'csv') { const result = Papa.parse<RawRow>(buffer.toString('utf8'), { header: true, skipEmptyLines: true, dynamicTyping: false }); if (result.errors.length) throw new Error(`CSV_PARSE_ERROR: ${result.errors[0].message}`); const rows = result.data; return { rows, columns: result.meta.fields ?? [], format: 'csv' }; } if (extension === 'xlsx') { const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: null, raw: false }); return { rows, columns: rows.length ? Object.keys(rows[0]) : [], format: 'xlsx' }; } throw new Error('UNSUPPORTED_FILE_TYPE'); }
