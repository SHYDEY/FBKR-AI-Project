import type { ReactNode } from 'react';
import AppShell from '@/components/shell/app-shell';
import { ADMIN_MENU } from '@/lib/menu';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <AppShell menu={ADMIN_MENU} title="SCM 관리자">{children}</AppShell>;
}
