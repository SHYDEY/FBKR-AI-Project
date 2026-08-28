import PageHeader from '@/components/shell/page-header';
import Badge from '@/components/ui/badge';
import DataTable, { type TableColumn } from '@/components/ui/data-table';
import EmptyValue from '@/components/ui/empty-value';
import KpiCard from '@/components/ui/kpi-card';
import Panel from '@/components/ui/panel';
import InsightBanner from '@/components/ui/insight-banner';
import { getLeadtimeGap } from '@/lib/scm';
import type { LeadtimeGap } from '@/lib/scm-model';

export const dynamic = 'force-dynamic';

function formatDays(value: number | null) {
  if (value === null) return <EmptyValue />;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}일`;
}

function GapCell({ row }: { row: LeadtimeGap }) {
  if (row.gap === null) return <EmptyValue reasonCode="NO_LEADTIME" />;
  const tone = row.gap > 0 ? 'critical' : 'safe';
  const sign = row.gap > 0 ? '+' : '';
  return <Badge tone={tone}>{sign}{formatDays(row.gap)}</Badge>;
}

const columns: readonly TableColumn<LeadtimeGap>[] = [
  { key: 'supplier', label: '공급처' },
  { key: 'country', label: '국가' },
  { key: 'masterLeadTime', label: '마스터', align: 'right', render: (row) => formatDays(row.masterLeadTime) },
  { key: 'sampleCount', label: '표본수', align: 'right', render: (row) => row.sampleCount.toLocaleString() },
  { key: 'actualAverage', label: '실적평균', align: 'right', render: (row) => formatDays(row.actualAverage) },
  { key: 'p80', label: 'P80', align: 'right', render: (row) => formatDays(row.p80) },
  { key: 'gap', label: '격차', align: 'right', render: (row) => <GapCell row={row} /> },
];

export default async function LeadtimePage() {
  const { rows, error } = await getLeadtimeGap();

  if (error) return <section className="page-section"><PageHeader title="리드타임 격차" description="공급처별 마스터 리드타임과 실제 실적을 비교합니다." /><InsightBanner tone="critical" title="조회에 실패했습니다.">{error}</InsightBanner></section>;

  const nLonger = rows.filter((row) => row.gap !== null && row.gap > 0).length;
  const nLowSample = rows.filter((row) => row.sampleCount < 10).length;

  return <section className="page-section"><PageHeader title="리드타임 격차" description="마스터 표준 리드타임과 실제 실적 P80을 비교해 계획이 현실보다 짧게 잡혀 있는 공급처를 찾습니다." /><div className="grid grid-3"><KpiCard label="공급처" value={rows.length} unit="곳" description="사용 중인 생산법인" /><KpiCard label="실제가 더 김" value={nLonger} unit="곳" description="격차가 양수인 공급처" tone={nLonger ? 'warning' : 'safe'} /><KpiCard label="표본 부족" value={nLowSample} unit="곳" description="표본 10건 미만" tone={nLowSample ? 'warning' : 'safe'} /></div><div className="section"><Panel title="공급처별 리드타임" description="격차 = P80 − 마스터"><DataTable columns={columns} rows={rows} rowKey={(row, index) => `${row.supplier}-${index}`} empty="표시할 데이터가 없습니다. analytics.v_leadtime_gap을 확인하세요." /></Panel></div></section>;
}
