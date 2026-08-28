import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = process.cwd();

test('디자인 시스템 스타일 파일과 상태 토큰이 존재한다', () => {
  const globals = readFileSync(`${root}/app/globals.css`, 'utf8');
  const components = readFileSync(`${root}/styles/components.css`, 'utf8');

  assert.match(globals, /@import ['"]\.\.\/styles\/shell\.css['"]/);
  assert.match(globals, /@import ['"]\.\.\/styles\/components\.css['"]/);
  assert.match(globals, /@import ['"]\.\.\/styles\/chart\.css['"]/);
  assert.match(components, /\.status-safe/);
  assert.match(components, /\.status-warning/);
  assert.match(components, /\.status-critical/);
  assert.match(components, /\.status-unavailable/);
});

test('공통 route 파일과 메뉴 정의가 존재한다', () => {
  for (const route of [
    'app/(user)/page.tsx',
    'app/(user)/analysis/leadtime/page.tsx',
    'app/(user)/analysis/stockout/page.tsx',
    'app/(admin)/admin/page.tsx',
    'app/(auth)/login/page.tsx',
    'app/(legacy)/workflow/page.tsx',
    'lib/menu.ts',
  ]) {
    assert.equal(existsSync(`${root}/${route}`), true, `${route} 파일이 없습니다.`);
  }
});

test('분석 화면은 화면 내부에서 hex 색상과 직접 조회를 사용하지 않는다', () => {
  for (const page of ['app/(user)/analysis/leadtime/page.tsx', 'app/(user)/analysis/stockout/page.tsx']) {
    const source = readFileSync(`${root}/${page}`, 'utf8');
    assert.doesNotMatch(source, /#[0-9a-f]{3,8}/i);
    assert.doesNotMatch(source, /\.from\(/);
  }
});
