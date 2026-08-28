import type { ReactNode } from 'react';
import type { MenuItem } from '@/lib/menu';
import Sidebar from './sidebar';
import Topbar from './topbar';

export default function AppShell({ children, menu, title }: { children: ReactNode; menu: readonly MenuItem[]; title: string }) {
  return <div className="app-shell"><Sidebar items={menu} /><div className="main"><Topbar title={title} /><main className="content">{children}</main></div></div>;
}
