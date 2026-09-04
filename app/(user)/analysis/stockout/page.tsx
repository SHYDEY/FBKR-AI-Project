import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';
import InsightBanner from '@/components/ui/insight-banner';
import { getStockoutKpi } from '@/lib/scm';
export const dynamic = 'force-dynamic';
export default async function StockoutPage() { const { data, error } = await getStockoutKpi(); return <section className="analysis-page"><PageHeader title="Stockout Risk" description="재고 소진 위험 지표를 analytics 뷰에서 조회합니다." />{error ? <Panel><p className="text-danger">조회에 실패했습니다: {error}</p></Panel> : data ? <Panel title="현재 위험 요약"><InsightBanner>실데이터 기준 Stockout Risk KPI입니다.</InsightBanner><pre>{JSON.stringify(data, null, 2)}</pre></Panel> : <Panel><p className="muted">표시할 데이터가 없습니다.</p></Panel>}</section>; }
