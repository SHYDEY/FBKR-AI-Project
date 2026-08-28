# STEP2 인증·Role·RBAC 설계

## 목표

ADMIN과 USER 권한을 프론트엔드 UX, Next.js 서버, Supabase RLS 세 계층에서 일관되게 강제한다. 로그인은 Supabase Auth session을 사용하고, 애플리케이션 사용자·감사 로그·관리자 mutation은 `core` 스키마에서 관리한다.

## 현재 상태

- `@supabase/ssr`가 의존성에 있으나 현재 server client는 세션 없는 `createClient`다.
- browser client도 `@supabase/supabase-js` 직접 client이며 cookie session 구성이 없다.
- `middleware.ts`가 없다.
- STEP1 route group은 `(auth)`, `(user)`, `(admin)`, `(legacy)`로 나뉘어 있다.
- `lib/menu.ts`에 USER/ADMIN 메뉴가 분리되어 있다.
- `core.app_user`, `core.audit_log`, `core.is_admin()`은 아직 없다.
- 기존 `sql/02-policies.sql`은 `anon`과 `authenticated`에 `using (true)`/`with check (true)` 쓰기를 허용하므로 제거 대상이다.
- 첫 ADMIN은 신규 Auth 사용자 생성 후 SQL Editor에서 1회 수동 승격한다.

## 권한 모델

| 상태 | 인증 | role | 접근 |
|---|---|---|---|
| 미로그인 | 없음 | 없음 | `/login`만 허용 |
| 활성 사용자 | 있음 | USER | USER route 및 허용된 analytics 조회 |
| 활성 관리자 | 있음 | ADMIN | USER route, ADMIN route, 관리자 mutation |
| 비활성 사용자 | 있음 | USER/ADMIN | 보호 경로 거부 |

role은 브라우저 state나 메뉴 표시를 신뢰하지 않는다. 서버는 매 요청마다 cookie session의 Auth user와 `core.app_user`의 활성 role을 확인하고, DB는 `auth.uid()`와 `core.is_admin()`을 기준으로 RLS를 적용한다.

## 데이터베이스 설계

### `core.app_user`

```text
user_id uuid primary key references auth.users(id) on delete cascade
email text not null
name text not null default ''
department text not null default ''
role text not null default 'USER' check (role in ('ADMIN', 'USER'))
active boolean not null default true
last_login_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

`auth.users` insert trigger가 metadata에서 email/name/department를 읽어 USER profile을 생성한다. email 변경 시 profile email은 별도 trigger에서 동기화하지 않고, 관리자 화면의 role/active 변경 범위를 단순하게 유지한다.

### `core.audit_log`

```text
id uuid primary key default gen_random_uuid()
actor uuid references auth.users(id)
action text not null
target_type text not null
target_id text not null
before jsonb
after jsonb
at timestamptz not null default now()
```

`app_user`의 role 또는 active 변경을 `AFTER UPDATE` trigger가 감지해 각각 기록한다. actor는 `auth.uid()`이며, SQL Editor 등 session 없는 변경은 null일 수 있다. API에서 직접 audit row를 신뢰하지 않고 DB trigger를 최종 기록 지점으로 사용한다.

### 보안 함수

`core.is_admin()`은 `security definer`, 고정 `search_path`, `row_security = off`로 실행하며 현재 `auth.uid()`의 활성 profile이 ADMIN인지 확인한다. anon에는 execute 권한을 주지 않고 authenticated에만 실행 권한을 준다.

`core.record_login()`은 현재 `auth.uid()`의 `last_login_at`만 갱신하는 security definer 함수다. role/active 변경 권한을 노출하지 않고 로그인 시간만 기록하기 위해 사용한다.

## RLS와 권한

### 역할별 기본 원칙

- `anon`: core/analytics/raw schema usage 및 데이터 권한 없음
- `authenticated USER`: analytics 조회, 자기 `app_user` profile 조회
- `authenticated ADMIN`: analytics/core 조회, 다른 사용자 profile의 role/active 변경, audit 조회
- raw 테이블: API role에 직접 접근 권한 없음
- `leadtime_plan`, `usage_profile`: authenticated 조회, ADMIN만 insert/update/delete

### 주요 정책

- `app_user` select: 자기 행 또는 `core.is_admin()`인 경우
- `app_user` update: ADMIN이 자기 자신이 아닌 행만 허용
- `audit_log` insert: ADMIN이며 `actor = auth.uid()`인 경우
- `audit_log` select: ADMIN만 허용
- audit update/delete: 모두 거부
- 기존 수업용 전체 허용 정책과 anon write grant는 migration에서 drop/revoke

RLS는 grants와 별개로 적용하므로 schema usage, select, mutation grant와 정책을 함께 설정한다.

## SSR 인증 흐름

```text
브라우저 login form
  → Server Action signInWithPassword
  → @supabase/ssr cookie session 저장
  → middleware에서 getUser로 session 갱신
  → requireUser/requireAdmin에서 app_user role·active 조회
  → page/layout/server action 실행
```

`lib/supabase/server.ts`는 `cookies()`의 getAll/setAll을 `createServerClient`에 연결한다. set cookie가 middleware response에서 필요한 경우 middleware는 request와 response를 함께 구성한다. service role client는 사용하지 않는다.

## 보호 경로

middleware는 다음을 보호한다.

```text
/
/analysis/*
/workflow
/admin/*
```

미로그인 요청은 `/login?next=<encoded-original-path>`로 redirect한다. `/login`과 정적 asset, Next 내부 경로, health endpoint는 제외한다. middleware는 role을 판정하지 않고 session 갱신과 로그인 여부만 담당한다.

`app/(admin)/layout.tsx`는 `requireAdmin()`을 호출한다. USER가 직접 `/admin/*`를 요청해도 메뉴가 아니라 server helper에서 403을 반환한다. `app/forbidden.tsx`는 공통 403 안내를 렌더링한다.

## Auth helper

`lib/auth.ts`는 다음 계약을 제공한다.

```ts
type AppRole = 'ADMIN' | 'USER';
type AuthContext = { user: User; profile: AppUser };

async function getRole(): Promise<AppRole | null>;
async function requireUser(): Promise<AuthContext>;
async function requireAdmin(): Promise<AuthContext>;
```

`requireUser()`는 session user와 활성 profile을 모두 확인한다. `requireAdmin()`은 USER를 403으로 거부한다. 관리자 server action은 첫 줄에서 `requireAdmin()`을 호출하고, DB RLS는 동일 조건을 독립적으로 재확인한다.

## 로그인과 로그아웃

- `/login`은 email/password form과 `next` hidden field를 사용한다.
- 로그인 실패는 form 내부의 한국어 오류 메시지로 반환한다.
- 로그인 성공 후 안전한 상대 경로인 `next`로 redirect한다. 외부 URL은 허용하지 않는다.
- 성공 후 `core.record_login()`을 호출한다.
- 로그아웃 server action은 session을 종료하고 `/login`으로 redirect한다.

## 관리자 사용자 관리

`/admin/users`는 `requireAdmin()` 이후 `core.app_user` 목록을 조회한다.

- role 변경과 active 변경은 각각 server action으로 처리한다.
- 대상 user_id가 현재 actor와 같으면 server action에서 거부한다.
- DB policy에서도 자기 자신 update를 거부한다.
- role/active 변경은 DB audit trigger로 기록된다.
- 사용자를 숨기는 USER 메뉴는 보안 경계가 아니다.

## 오류 처리

- 미로그인: login redirect
- USER의 관리자 접근: 403
- inactive profile: login redirect 또는 접근 거부 메시지
- Supabase 조회 실패: 오류 메시지와 함께 화면 표시
- admin mutation 실패: action 결과에 한국어 오류 반환
- 직접 REST/Server Action 호출: server helper와 RLS 양쪽에서 거부

## 검증 계획

1. migration source에 app_user, audit_log, trigger, revoke, RLS policy가 존재하는지 정적 검사
2. server client가 `@supabase/ssr` cookie adapter를 사용하는지 정적 검사
3. middleware 보호 matcher와 login next redirect 검사
4. admin action에 `requireAdmin`이 먼저 호출되는지 검사
5. self role/active 변경 방지 조건 검사
6. `npm test`
7. `npm run build`

## 수동 설정

1. migration 실행 후 Supabase API의 exposed schemas에 `core`, `analytics`가 포함되어 있는지 확인한다.
2. Auth Dashboard에서 첫 사용자를 생성한다.
3. SQL Editor에서 해당 profile을 1회 ADMIN으로 승격한다.
4. 이후 관리자 화면에서 나머지 사용자 role과 active를 변경한다.

## 제외 범위

- service role key 사용
- 실제 이메일 초대/비밀번호 재설정
- 조직별 다중 tenant 권한
- 기존 analytics 계산 view 변경
