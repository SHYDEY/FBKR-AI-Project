import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();

test('STEP1 공통 스타일 파일과 route group이 존재한다', () => {
  const requiredFiles = [
    'styles/shell.css',
    'styles/components.css',
    'styles/chart.css',
    'components/shell/sidebar.tsx',
    'components/shell/topbar.tsx',
    'components/shell/page-header.tsx',
    'components/ui/kpi-card.tsx',
    'components/ui/panel.tsx',
    'components/ui/badge.tsx',
    'components/ui/button.tsx',
    'components/ui/data-table.tsx',
    'components/ui/alert-row.tsx',
    'components/ui/insight-banner.tsx',
    'components/ui/empty-value.tsx',
    'lib/menu.ts',
    'app/(auth)/layout.tsx',
    'app/(user)/layout.tsx',
    'app/(admin)/layout.tsx',
    'app/(user)/analysis/leadtime/page.tsx',
    'app/(user)/analysis/stockout/page.tsx',
  ];

  for (const file of requiredFiles) assert.equal(existsSync(join(root, file)), true, file);
});

test('디자인 토큰과 계산 불가 표시 계약이 존재한다', () => {
  const globals = readFileSync(join(root, 'app/globals.css'), 'utf8');
  const components = readFileSync(join(root, 'components/ui/empty-value.tsx'), 'utf8');

  for (const token of ['--color-status-safe', '--color-status-warning', '--color-status-critical', '--color-status-unavailable']) {
    assert.match(globals, new RegExp(token));
  }
  assert.match(components, /—/);
  assert.match(components, /reasonCode/);
});

test('메뉴 정의는 USER와 ADMIN을 분리한다', () => {
  const menu = readFileSync(join(root, 'lib/menu.ts'), 'utf8');
  assert.match(menu, /USER/);
  assert.match(menu, /ADMIN/);
});
