import type { ReactNode } from 'react';
import AppShell from '@/components/shell/app-shell';
import { USER_MENU } from '@/lib/menu';

export default function UserLayout({ children }: { children: ReactNode }) {
  return <AppShell menu={USER_MENU} title="월간 발주계획">{children}</AppShell>;
}
