import Link from 'next/link';
import { getMenu, type MenuRole } from '@/lib/menu';

export default function Sidebar({ role = 'USER' }: { role?: MenuRole }) {
  return <aside className="sidebar"><div className="brand"><div className="brand-mark">SC</div><div className="brand-copy"><strong>Super SCM</strong><span>Supply Chain Control</span></div></div><div className="nav-label">MENU</div><nav className="nav-list" aria-label="주 메뉴">{getMenu(role).map((item) => <Link className="nav-button" href={item.href} key={item.href}><span>{item.label}</span></Link>)}</nav><div className="sidebar-foot"><b>{role}</b><br />분석 조회 계층 · Supabase Live</div></aside>;
}
