import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync('lib/supabase/server.ts', 'utf8');

test('서버 Supabase 클라이언트가 SSR 쿠키를 사용한다', () => {
  assert.match(source, /createServerClient/);
  assert.match(source, /from ['"]@supabase\/ssr['"]/);
  assert.match(source, /from ['"]next\/headers['"]/);
  assert.match(source, /getAll\(\)/);
  assert.match(source, /setAll\(/);
  assert.doesNotMatch(source, /from ['"]@supabase\/supabase-js['"]/);
});
