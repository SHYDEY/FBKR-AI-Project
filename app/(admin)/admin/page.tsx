import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';
import InsightBanner from '@/components/ui/insight-banner';
import Link from 'next/link';

export default function AdminPage() {
  return <section className="page-section"><PageHeader eyebrow="ADMINISTRATION" title="관리자 현황" description="기준정보와 운영 설정을 관리하는 화면입니다." /><Panel title="사용자 관리" description="ADMIN 전용"><InsightBanner tone="info">사용자 role과 활성 상태를 관리할 수 있습니다.</InsightBanner><Link className="ui-button primary admin-link" href="/admin/users">사용자 관리 화면으로 이동</Link></Panel></section>;
}
