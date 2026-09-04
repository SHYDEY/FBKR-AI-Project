import Sidebar from '@/components/shell/sidebar';
import Topbar from '@/components/shell/topbar';
import { requireAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) { await requireAdmin(); return <div className="app-shell"><Sidebar role="ADMIN" /><main className="main"><Topbar title="관리자" /><div className="content">{children}</div></main></div>; }
