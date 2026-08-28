import PageHeader from '@/components/shell/page-header';
import AlertRow from '@/components/ui/alert-row';
import Badge, { type BadgeTone } from '@/components/ui/badge';
import DataTable, { type TableColumn } from '@/components/ui/data-table';
import EmptyValue from '@/components/ui/empty-value';
import InsightBanner from '@/components/ui/insight-banner';
import KpiCard from '@/components/ui/kpi-card';
import Panel from '@/components/ui/panel';
import { getStockoutKpi, getStockoutRisks } from '@/lib/scm';
import type { StockoutRisk } from '@/lib/scm-model';

export const dynamic = 'force-dynamic';

function toneFor(status: StockoutRisk['riskStatus']): BadgeTone {
  if (status === 'SAFE') return 'safe';
  if (status === 'CRITICAL') return 'critical';
  return 'unavailable';
}

function formatDays(value: number | null, reason: StockoutRisk['reason']) {
  if (value === null) return <EmptyValue reasonCode={reason} />;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}일`;
}

const columns: readonly TableColumn<StockoutRisk>[] = [
  { key: 'itemId', label: '품목코드' },
  { key: 'itemName', label: '품목명' },
  { key: 'supplierId', label: '공급처' },
  { key: 'availableQty', label: '가용수량', align: 'right', render: (row) => row.availableQty === null ? <EmptyValue /> : row.availableQty.toLocaleString() },
  { key: 'dailyUsageAvg', label: '일평균 사용량', align: 'right', render: (row) => row.dailyUsageAvg === null ? <EmptyValue reasonCode={row.reason} /> : row.dailyUsageAvg.toFixed(1) },
  { key: 'stockoutDays', label: '소진 예상', align: 'right', render: (row) => formatDays(row.stockoutDays, row.reason) },
  { key: 'stockoutDate', label: '예상일', render: (row) => row.stockoutDate ?? <EmptyValue reasonCode={row.reason} /> },
  { key: 'riskStatus', label: '상태', render: (row) => <Badge tone={toneFor(row.riskStatus)}>{row.riskStatus === 'UNKNOWN' ? 'CALCULATION_UNAVAILABLE' : row.riskStatus}</Badge> },
];

export default async function StockoutPage() {
  const [{ rows, error: risksError }, { data: kpi, error: kpiError }] = await Promise.all([getStockoutRisks(), getStockoutKpi()]);
  const error = risksError ?? kpiError;
  if (error) return <section className="page-section"><PageHeader title="소진 위험 분석" description="품목별 가용수량과 사용량을 기준으로 재고 소진 위험을 확인합니다." /><InsightBanner tone="critical" title="조회에 실패했습니다.">{error}</InsightBanner></section>;

  const criticalRows = rows.filter((row) => row.riskStatus === 'CRITICAL').slice(0, 3);
  return <section className="page-section"><PageHeader title="소진 위험 분석" description="analytics.v_stockout_risk의 계산 결과를 기준으로 안전·주의·위험 품목을 확인합니다." /><div className="grid grid-4"><KpiCard label="전체 품목" value={kpi?.nItems ?? 0} unit="개" description="분석 대상 품목" /><KpiCard label="CRITICAL" value={kpi?.nCritical ?? 0} unit="개" description="즉시 확인 필요" tone="critical" /><KpiCard label="SAFE" value={kpi?.nSafe ?? 0} unit="개" description="안전 범위" tone="safe" /><KpiCard label="계산 불가" value={kpi?.nUnknown ?? 0} unit="개" description="사유 코드 확인 필요" tone="unavailable" /></div><div className="section grid grid-2"><Panel title="위험 알림" description="CRITICAL 품목"><div>{criticalRows.length === 0 ? <InsightBanner tone="safe">현재 CRITICAL 품목이 없습니다.</InsightBanner> : criticalRows.map((row) => <AlertRow key={row.itemId} tone="critical" title={`${row.itemId} · ${row.itemName}`} description={`소진 예상 ${formatDays(row.stockoutDays, row.reason)}`} />)}</div></Panel><Panel title="계산 기준 안내" description="null 값을 임의 변환하지 않음"><InsightBanner tone="info" title="계산 불가 값은 별도 표시됩니다.">사용 이력 또는 리드타임이 없으면 숫자 대신 EmptyValue와 reason code를 표시합니다.</InsightBanner></Panel></div><div className="section"><Panel title="품목별 소진 위험" description="SAFE · CRITICAL · CALCULATION_UNAVAILABLE"><DataTable columns={columns} rows={rows} rowKey={(row) => row.itemId} empty="표시할 데이터가 없습니다. analytics.v_stockout_risk를 확인하세요." /></Panel></div></section>;
}
