import type { ReactNode } from 'react';
import AppShell from '@/components/shell/app-shell';
import { ADMIN_MENU, USER_MENU } from '@/lib/menu';
import { requireUser } from '@/lib/auth';

export default async function UserLayout({ children }: { children: ReactNode }) {
  const context = await requireUser();
  const menu = context.profile.role === 'ADMIN' ? [...USER_MENU, ...ADMIN_MENU] : USER_MENU;
  return <AppShell menu={menu} title="월간 발주계획">{children}</AppShell>;
}
