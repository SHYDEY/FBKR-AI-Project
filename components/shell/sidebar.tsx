'use client';

import Link from 'next/link';
import { BarChart3, Boxes, Gauge, Settings2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { MenuIcon, MenuItem } from '@/lib/menu';

const icons: Record<MenuIcon, typeof Gauge> = { dashboard: Gauge, leadtime: BarChart3, stockout: Boxes, admin: Settings2 };

export default function Sidebar({ items, title = '월간 발주계획' }: { items: readonly MenuItem[]; title?: string }) {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">SC</div>
        <div className="brand-copy"><strong>{title}</strong><span>Supply Chain Control</span></div>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list" aria-label="주요 메뉴">
        {items.map((item) => {
          const Icon = icons[item.icon];
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return <Link key={item.href} className={`nav-button ${active ? 'active' : ''}`} href={item.href} aria-current={active ? 'page' : undefined}>
            <span className="nav-number"><Icon size={13} aria-hidden="true" /></span><span>{item.label}</span>
          </Link>;
        })}
      </nav>
      <div className="sidebar-foot"><b>2026년 09월 발주계획</b><br />공통 SCM 분석 공간<br />기준과 계산 결과를 한 곳에서 관리합니다.</div>
    </aside>
  );
}
