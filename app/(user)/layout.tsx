import Sidebar from '@/components/shell/sidebar';
import Topbar from '@/components/shell/topbar';
import { requireUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) { await requireUser(); return <div className="app-shell"><Sidebar role="USER" /><main className="main"><Topbar /><div className="content">{children}</div></main></div>; }
