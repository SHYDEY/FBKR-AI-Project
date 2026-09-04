import PageHeader from '@/components/shell/page-header';
import KpiCard from '@/components/ui/kpi-card';
import Panel from '@/components/ui/panel';
import { getDemandProfileKpi, getDemandProfileRt } from '@/lib/scm';
import DemandProfileTable from './demand-profile-table';
export const dynamic = 'force-dynamic';
export default async function DemandProfilePage() { const [profiles, kpi] = await Promise.all([getDemandProfileRt(), getDemandProfileKpi()]); return <section className="analysis-page"><PageHeader title="SKU Demand Profile" description="학습 기간의 SKU 수요 특성을 분석해 Forecast 모델 후보 선택에 사용합니다." />{profiles.error || kpi.error ? <Panel><p className="text-danger">조회에 실패했습니다: {profiles.error ?? kpi.error}</p></Panel> : <><div className="grid grid-4"><KpiCard label="전체 SKU" value={kpi.rows[0]?.totalItems ?? 0} /><KpiCard label="SMOOTH" value={kpi.rows[0]?.nSmooth ?? 0} tone="safe" /><KpiCard label="Croston 필요" value={kpi.rows[0]?.nCrostonNeeded ?? 0} tone="warning" /><KpiCard label="계산 불가" value={kpi.rows[0]?.nCalculationUnavailable ?? 0} tone="unavailable" /></div><Panel title="SKU별 수요 프로파일"><DemandProfileTable rows={profiles.rows} /></Panel></>}</section>; }
