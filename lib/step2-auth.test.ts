import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();

test('STEP2 인증 보호 파일과 관리자 경로가 존재한다', () => {
  for (const file of ['lib/auth.ts', 'middleware.ts', 'app/(auth)/login/actions.ts', 'app/(auth)/login/login-form.tsx', 'app/(admin)/admin/users/actions.ts', 'supabase/migrations/20260904000100_create_auth_rbac.sql']) {
    assert.equal(existsSync(join(root, file)), true, file);
  }
});

test('middleware는 로그인과 관리자 경로를 구분한다', () => {
  const source = readFileSync(join(root, 'middleware.ts'), 'utf8');
  assert.match(source, /login\?next=/);
  assert.match(source, /admin/);
  assert.match(source, /is_admin|role/);
});

test('RBAC SQL은 anon 쓰기와 using true를 허용하지 않는다', () => {
  const policy = readFileSync(join(root, 'sql/02-policies.sql'), 'utf8');
  const migration = readFileSync(join(root, 'supabase/migrations/20260904000100_create_auth_rbac.sql'), 'utf8');
  assert.doesNotMatch(policy, /to anon.*\n[\s\S]*insert|to anon.*\n[\s\S]*update|to anon.*\n[\s\S]*delete/i);
  assert.doesNotMatch(policy, /to\s+anon[\s\S]{0,160}using\s*\(\s*true\s*\)/i);
  assert.match(migration, /create table if not exists core\.app_user/i);
  assert.match(migration, /create table if not exists core\.audit_log/i);
  assert.match(migration, /create or replace function core\.is_admin/i);
  assert.match(migration, /auth\.users/i);
  assert.match(migration, /audit_log/i);
});

test('관리자 mutation은 서버에서 requireAdmin을 먼저 호출한다', () => {
  const source = readFileSync(join(root, 'app/(admin)/admin/users/actions.ts'), 'utf8');
  assert.match(source, /requireAdmin\(\)/);
  assert.match(source, /admin_update_app_user/);
  assert.match(source, /자신|self|currentUser/i);
});
