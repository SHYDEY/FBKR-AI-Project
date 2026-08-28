import { Search } from 'lucide-react';
import LogoutButton from '@/components/auth/logout-button';

export default function Topbar({ title, eyebrow = 'MONTHLY PROCUREMENT CONTROL' }: { title: string; eyebrow?: string }) {
  return <header className="topbar">
    <div className="topbar-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div><label className="topbar-search"><Search size={15} aria-hidden="true" /><span className="sr-only">업무 검색</span><input aria-label="업무 검색" placeholder="업무 검색" /></label></div>
    <div className="topbar-tools"><nav className="top-nav" aria-label="보조 메뉴"><span className="top-nav-link active">전체 현황</span><span className="top-nav-link">지표</span><span className="top-nav-link">인사이트</span></nav><div className="top-meta"><span className="local-badge">SUPABASE LIVE</span><span>기준월도 <b>2026.09</b></span><LogoutButton /></div></div>
  </header>;
}
