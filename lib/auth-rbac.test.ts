import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = process.cwd();
const read = (path: string) => readFileSync(`${root}/${path}`, 'utf8');

test('인증 RBAC migration이 profile, audit, admin 함수와 안전한 RLS를 선언한다', () => {
  const source = read('supabase/migrations/20260828000200_auth_rbac.sql');
  assert.match(source, /core\.app_user/);
  assert.match(source, /core\.audit_log/);
  assert.match(source, /core\.is_admin/);
  assert.match(source, /auth\.users/);
  assert.match(source, /revoke all on schema core from anon/i);
  assert.match(source, /for update\s+to authenticated/i);
  assert.match(source, /role|active/);
});

test('SSR client와 서버 auth helper가 존재한다', () => {
  assert.match(read('lib/supabase/server.ts'), /@supabase\/ssr/);
  assert.match(read('lib/supabase/server.ts'), /cookies/);
  assert.match(read('lib/supabase/client.ts'), /@supabase\/ssr/);
  const auth = read('lib/auth.ts');
  assert.match(auth, /export async function getRole/);
  assert.match(auth, /export async function requireUser/);
  assert.match(auth, /export async function requireAdmin/);
});

test('보호 경로, 관리자 layout, login action이 서버 경계를 가진다', () => {
  const middleware = read('middleware.ts');
  assert.match(middleware, /getUser/);
  assert.match(middleware, /\/login/);
  assert.match(middleware, /next/);
  assert.match(read('app/(admin)/layout.tsx'), /requireAdmin/);
  assert.match(read('app/(auth)/login/actions.ts'), /signInWithPassword/);
  assert.match(read('app/(auth)/logout/actions.ts'), /signOut/);
});

test('관리자 action은 self 변경을 거부한다', () => {
  for (const path of ['app/(admin)/admin/users/actions.ts']) {
    assert.equal(existsSync(`${root}/${path}`), true);
    const source = read(path);
    assert.match(source, /requireAdmin/);
    assert.match(source, /user_id/);
    assert.match(source, /actor/);
  }
});
