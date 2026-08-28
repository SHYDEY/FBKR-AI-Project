import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';
import InsightBanner from '@/components/ui/insight-banner';

export default function AdminPage() {
  return <section className="page-section"><PageHeader eyebrow="ADMINISTRATION" title="관리자 현황" description="기준정보와 운영 설정을 관리하는 화면입니다." /><Panel title="관리자 기능 준비 중" description="STEP1 공통 route"> <InsightBanner tone="info">공급처 기준, 사용자 권한, 분석 뷰 점검 기능은 다음 단계에서 연결합니다.</InsightBanner></Panel></section>;
}
