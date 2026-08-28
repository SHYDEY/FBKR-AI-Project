import type { ReactNode } from 'react';

export type TableColumn<T> = { key: string; label: string; align?: 'left' | 'right' | 'center'; render?: (row: T) => ReactNode };

export default function DataTable<T extends Record<string, unknown>>({ columns, rows, rowKey, empty = '표시할 데이터가 없습니다.' }: { columns: readonly TableColumn<T>[]; rows: readonly T[]; rowKey?: (row: T, index: number) => string; empty?: string }) {
  if (rows.length === 0) return <p className="empty-state">{empty}</p>;
  return <div className="data-table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key} className={column.align ? `align-${column.align}` : ''}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={rowKey ? rowKey(row, index) : String(index)}>{columns.map((column) => <td key={column.key} className={column.align ? `align-${column.align}` : ''}>{column.render ? column.render(row) : String(row[column.key] ?? '—')}</td>)}</tr>)}</tbody></table></div>;
}
