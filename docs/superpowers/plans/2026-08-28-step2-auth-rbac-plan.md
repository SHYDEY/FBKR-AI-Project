# STEP2 인증·Role·RBAC 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase Auth session, Next.js server 보호, 사용자 role 관리, audit log, DB RLS를 연결해 ADMIN과 USER 권한을 세 계층에서 강제한다.

**Architecture:** Auth profile과 audit log는 `core` schema에 두고 `auth.users` insert/update trigger와 RLS로 보호한다. Next.js는 `@supabase/ssr` cookie client와 middleware로 session을 갱신하고, `lib/auth.ts`의 `requireUser`/`requireAdmin`을 page, layout, server action의 서버 경계로 사용한다. service role key는 사용하지 않으며 사용자 role/active mutation은 authenticated ADMIN + DB policy + audit trigger의 삼중 방어로 처리한다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, `@supabase/ssr`, Supabase Auth/PostgreSQL RLS, 순수 CSS

**Spec:** `docs/superpowers/specs/2026-08-28-step2-auth-rbac-design.md`

## Global Constraints

- anon은 업무 schema usage와 데이터 권한이 없어야 한다.
- USER는 허용된 analytics 조회만 가능하고 관리자 mutation은 불가하다.
- ADMIN 권한은 클라이언트 메뉴가 아니라 server helper와 DB RLS로 판정한다.
- service role key를 브라우저 코드나 `NEXT_PUBLIC_*` 환경변수에 넣지 않는다.
- role/active 변경은 자신의 계정에 대해 불가하다.
- role 또는 active 변경은 `core.audit_log`에 DB trigger로 기록한다.
- 기존 raw 데이터와 analytics 계산 view는 변경하지 않는다.
- 기존 `components/workflow/*`는 수정하지 않는다.
- 화면 문구와 주석은 한국어로 작성한다.
- 완료 전에 `npm test`와 `npm run build`를 실행한다.

## File Map

- Create: `supabase/migrations/20260828000200_auth_rbac.sql`
- Modify: `sql/01-grants.sql`
- Modify: `sql/02-policies.sql`
- Modify: `lib/supabase/server.ts`
- Modify: `lib/supabase/client.ts`
- Modify: `lib/supabase.ts`
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Create: `app/forbidden.tsx`
- Create: `app/(auth)/login/actions.ts`
- Create: `app/(auth)/logout/actions.ts`
- Modify: `app/(auth)/login/page.tsx`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/logout-button.tsx`
- Modify: `app/(user)/layout.tsx`
- Modify: `app/(admin)/layout.tsx`
- Modify: `lib/menu.ts`
- Create: `app/(admin)/admin/users/page.tsx`
- Create: `app/(admin)/admin/users/actions.ts`
- Modify: `components/shell/topbar.tsx`
- Modify: `lib/scm-model.test.ts` or Create: `lib/auth-rbac.test.ts`

### Task 1: DB migration, grants, RLS, and audit triggers

**Files:**
- Create: `supabase/migrations/20260828000200_auth_rbac.sql`
- Modify: `sql/01-grants.sql`
- Modify: `sql/02-policies.sql`

**Interfaces:**

```sql
core.app_user(user_id, email, name, department, role, active, last_login_at, created_at, updated_at)
core.audit_log(id, actor, action, target_type, target_id, before, after, at)
core.is_admin() returns boolean
core.record_login() returns void
```

- [ ] **Step 1: Write a failing SQL security source test**

Create `lib/auth-rbac.test.ts` that reads the migration and asserts it contains `core.app_user`, `core.audit_log`, `core.is_admin`, `auth.users`, `revoke all on schema core from anon`, an ADMIN-only update policy, and a trigger for role/active changes.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/auth-rbac.test.ts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Implement the migration**

Create schemas/tables only if absent, enable RLS, create `set_updated_at`, create the `auth.users` profile trigger, create `core.is_admin()` as `security definer` with fixed search path and row security bypass, and create `core.record_login()` as a restricted security definer function. Drop existing broad policies and revoke anon usage/privileges on `raw`, `core`, and `analytics`. Grant authenticated schema usage/select and ADMIN-only core mutations. Add policies that allow self/admin profile select, deny self profile updates, allow only ADMIN audit insert/select, and deny audit update/delete.

- [ ] **Step 4: Align manual SQL scripts**

Replace the current `sql/01-grants.sql` and `sql/02-policies.sql` examples so they no longer grant anon writes or create `using (true)`/`with check (true)` write policies. The migration remains the canonical deploy path; the scripts document the same secure grants and policies for dashboard execution.

- [ ] **Step 5: Run the source test**

Run: `node --test lib/auth-rbac.test.ts`

Expected: PASS.

### Task 2: Cookie-based SSR clients and auth helpers

**Files:**
- Modify: `lib/supabase/server.ts`
- Modify: `lib/supabase/client.ts`
- Modify: `lib/supabase.ts`
- Create: `lib/auth.ts`

**Interfaces:**

```ts
export type AppRole = 'ADMIN' | 'USER';
export type AppUser = { userId: string; email: string; name: string; department: string; role: AppRole; active: boolean; lastLoginAt: string | null };
export type AuthContext = { user: User; profile: AppUser };
export async function getRole(): Promise<AppRole | null>;
export async function requireUser(): Promise<AuthContext>;
export async function requireAdmin(): Promise<AuthContext>;
```

- [ ] **Step 1: Add failing source assertions**

Extend `lib/auth-rbac.test.ts` to assert server/client source imports `@supabase/ssr`, server source uses `cookies`, and `lib/auth.ts` exports all three helpers.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/auth-rbac.test.ts`

Expected: FAIL because the SSR adapter and auth helper do not exist.

- [ ] **Step 3: Implement SSR clients**

Use `createServerClient` with `cookies().getAll()`/`setAll()` in the server client. Use `createBrowserClient` in the browser client. Do not add a service role client or expose secret environment variables.

- [ ] **Step 4: Implement auth helpers**

`getRole()` reads the current Auth user and active `core.app_user` row. `requireUser()` redirects unauthenticated/inactive sessions to `/login`. `requireAdmin()` calls `requireUser()` then throws the project 403 response for non-admin users. Keep role lookup server-side and do not trust menu state.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: all tests pass.

### Task 3: Middleware, route layouts, and menu role selection

**Files:**
- Create: `middleware.ts`
- Create: `app/forbidden.tsx`
- Modify: `app/(user)/layout.tsx`
- Modify: `app/(admin)/layout.tsx`
- Modify: `lib/menu.ts`

**Interfaces:**

- Protected matcher paths: `/`, `/analysis/:path*`, `/workflow`, `/admin/:path*`
- Public paths: `/login`, `/api/health/supabase`, Next internal/static files
- USER layout calls `requireUser()` and chooses USER menu; active ADMIN may see USER + ADMIN link.
- ADMIN layout calls `requireAdmin()` before rendering children.

- [ ] **Step 1: Add failing middleware/route source assertions**

Extend `lib/auth-rbac.test.ts` to assert `middleware.ts` calls `getUser`, includes `/login`, `next`, and protected matchers; assert admin layout imports `requireAdmin`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/auth-rbac.test.ts`

Expected: FAIL because middleware and layout protection are missing.

- [ ] **Step 3: Implement middleware**

Create request/response cookie handling with `createServerClient`, refresh the Auth user, and redirect unauthenticated protected requests to `/login?next=<encoded pathname+search>`. Exclude static assets, `_next`, favicon, login, and health endpoint. Middleware only checks session; role authorization stays in `requireAdmin` and RLS.

- [ ] **Step 4: Protect layouts and update menu selection**

Call `requireUser()` in `(user)/layout.tsx`, call `requireAdmin()` in `(admin)/layout.tsx`, add `/admin/users` to `ADMIN_MENU`, and preserve menu hiding as UX only. Render `app/forbidden.tsx` for 403 responses.

- [ ] **Step 5: Run tests and build**

Run: `npm test` then `npm run build`

Expected: PASS and all existing routes compile.

### Task 4: Login, logout, next redirect, and login timestamp

**Files:**
- Create: `app/(auth)/login/actions.ts`
- Create: `app/(auth)/logout/actions.ts`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/logout-button.tsx`
- Modify: `app/(auth)/login/page.tsx`
- Modify: `components/shell/topbar.tsx`

**Interfaces:**

```ts
export async function signInAction(previous: { error: string | null }, formData: FormData): Promise<{ error: string | null }>;
export async function signOutAction(): Promise<never>;
```

- [ ] **Step 1: Add failing login source assertions**

Extend `lib/auth-rbac.test.ts` to assert the login action calls `signInWithPassword`, validates a relative `next`, calls `record_login`, and returns an error message instead of exposing raw auth errors. Assert logout calls `signOut`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/auth-rbac.test.ts`

Expected: FAIL because actions and form do not exist.

- [ ] **Step 3: Implement server actions and form**

Use the cookie server client in actions. On failed sign-in, return a Korean message. On success, call `core.record_login` and redirect to a safe same-origin relative `next` or `/`. The client form uses `useActionState` and shows the returned error. Logout signs out via the server client and redirects to `/login`.

- [ ] **Step 4: Add logout control**

Render `LogoutButton` in the shared topbar using a server action form. Do not put access tokens or service keys into the component.

- [ ] **Step 5: Run tests and build**

Run: `npm test` then `npm run build`

Expected: PASS.

### Task 5: Administrator user management and audit-backed mutation

**Files:**
- Create: `app/(admin)/admin/users/actions.ts`
- Create: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/page.tsx`

**Interfaces:**

```ts
export async function updateUserRole(formData: FormData): Promise<{ error: string | null }>;
export async function updateUserActive(formData: FormData): Promise<{ error: string | null }>;
```

- [ ] **Step 1: Add failing admin action source assertions**

Extend `lib/auth-rbac.test.ts` to assert both actions call `requireAdmin()` before mutation and contain a self-target guard for `user_id === actor.user.id`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/auth-rbac.test.ts`

Expected: FAIL because the actions do not exist.

- [ ] **Step 3: Implement protected server actions**

Parse the target user id and requested role/active value, call `requireAdmin()` first, reject self role and active changes, update only `core.app_user`, and return a Korean error on failure. RLS is the independent final check; do not insert audit rows from the browser.

- [ ] **Step 4: Implement `/admin/users`**

Call `requireAdmin()` before querying `core.app_user`. Render user list, role select/action, active toggle/action, email/name/department/last login, and action errors. Disable controls for the current actor in the UI, while keeping server and DB protections authoritative.

- [ ] **Step 5: Add admin entry point**

Update `/admin` to link to `/admin/users` using the common `Button` or link style. Keep all data operations server-side.

- [ ] **Step 6: Run tests and build**

Run: `npm test` then `npm run build`

Expected: PASS.

### Task 6: Final security verification and handoff

**Files:**
- Review: `supabase/migrations/20260828000200_auth_rbac.sql`
- Review: `sql/01-grants.sql`
- Review: `sql/02-policies.sql`
- Review: `middleware.ts`
- Review: `lib/auth.ts`
- Review: `app/(admin)/admin/users/actions.ts`

- [ ] **Step 1: Run forbidden-pattern scans**

Run:

```powershell
rg -n "to anon|using \(true\)|with check \(true\)|service_role|sb_secret|NEXT_PUBLIC.*SECRET" supabase sql app lib components middleware.ts
```

Expected: no insecure grant/policy or secret-key matches in active implementation. Historical comments must be updated or clearly marked as non-executable documentation.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: build succeeds and lists `/login`, `/`, `/analysis/leadtime`, `/analysis/stockout`, `/admin`, and `/admin/users`.

- [ ] **Step 4: Review manual Supabase setup**

Document that the migration must be run, `core` and `analytics` must be exposed, the first Auth user must be created, and that user must be promoted once with:

```sql
update core.app_user set role = 'ADMIN' where email = '관리자이메일@example.com';
```

- [ ] **Step 5: Check git scope**

Run: `git status --short`

Confirm no changes were made to existing analytics calculation SQL, raw data, or `components/workflow/*`.

