import type { ReactNode } from 'react';
import AppShell from '@/components/shell/app-shell';
import { ADMIN_MENU } from '@/lib/menu';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell menu={ADMIN_MENU} title="SCM 관리자">{children}</AppShell>;
}
