import PageHeader from '@/components/shell/page-header';
import KpiCard from '@/components/ui/kpi-card';
import Panel from '@/components/ui/panel';
import InsightBanner from '@/components/ui/insight-banner';

export default function UserOverviewPage() {
  return <section className="page-section"><PageHeader eyebrow="WORKSPACE OVERVIEW" title="월간 발주계획 현황" description="수요·재고·리드타임 분석을 한 화면에서 확인합니다." /><div className="grid grid-4"><KpiCard label="분석 화면" value="2" unit="개" description="Lead Time · Stockout" /><KpiCard label="기준월도" value="2026.09" description="현재 작업 기준월도" /><KpiCard label="데이터 영역" value="analytics" description="Supabase 분석 뷰" tone="info" /><KpiCard label="계산 불가 표시" value="표준화" description="EmptyValue 적용" tone="safe" /></div><div className="section grid grid-2"><Panel title="다음 작업" description="공통 분석 화면으로 이동"><InsightBanner title="분석 기준을 먼저 확인하세요.">Lead Time과 Stockout Risk 화면은 동일한 상태 배지와 계산 불가 표현을 사용합니다.</InsightBanner></Panel><Panel title="운영 원칙" description="SCM 분석 데이터 흐름"><InsightBanner tone="safe" title="analytics 뷰만 조회합니다.">원본 raw 데이터와 DB 계산 로직은 화면에서 직접 변경하지 않습니다.</InsightBanner></Panel></div></section>;
}
