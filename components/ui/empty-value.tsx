export function formatEmptyValue(reasonCode?: string | null) {
  return reasonCode ? `— + ${reasonCode}` : '—';
}

export default function EmptyValue({ reasonCode }: { reasonCode?: string | null }) {
  return <span className="empty-value" title={reasonCode ? `계산 불가 사유: ${reasonCode}` : '값 없음'}>{formatEmptyValue(reasonCode)}</span>;
}
