export type MenuIcon = 'dashboard' | 'leadtime' | 'stockout' | 'admin';

export type MenuItem = {
  label: string;
  href: string;
  icon: MenuIcon;
  description?: string;
};

export const USER_MENU: readonly MenuItem[] = [
  { label: '전체 현황', href: '/', icon: 'dashboard', description: '월간 발주계획 요약' },
  { label: '리드타임 분석', href: '/analysis/leadtime', icon: 'leadtime', description: '공급처별 리드타임 격차' },
  { label: '소진 위험 분석', href: '/analysis/stockout', icon: 'stockout', description: '품목별 재고 소진 위험' },
];

export const ADMIN_MENU: readonly MenuItem[] = [
  { label: '관리자 현황', href: '/admin', icon: 'admin', description: '기준과 운영 상태' },
];
