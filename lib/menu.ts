export type MenuRole = 'USER' | 'ADMIN';
export type MenuItem = { label: string; href: string; section?: string };

export const menu = {
  USER: [
    { label: '전체 현황', href: '/' },
    { label: '리드타임 분석', href: '/analysis/leadtime' },
    { label: 'Stockout Risk', href: '/analysis/stockout' },
  ],
  ADMIN: [
    { label: '사용자 관리', href: '/admin/users' },
  ],
} satisfies Record<MenuRole, MenuItem[]>;

export function getMenu(role: MenuRole = 'USER') { return [...menu.USER, ...(role === 'ADMIN' ? menu.ADMIN : [])]; }
