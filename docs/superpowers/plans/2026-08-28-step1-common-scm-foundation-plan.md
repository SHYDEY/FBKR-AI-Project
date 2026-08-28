# STEP1 공통 SCM 기반 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공통 디자인 시스템, shell 컴포넌트, USER/ADMIN/AUTH route group, 메뉴 정의를 만들고 Lead Time과 Stockout 화면에서 실제로 재사용한다.

**Architecture:** `app/globals.css`는 reset·토큰·stylesheet import만 담당하고, shell·UI·chart 스타일은 `styles/`로 분리한다. `(user)`와 `(admin)` layout은 공통 shell을 조합하며, `(legacy)/workflow`는 기존 `ProcurementApp`을 수정 없이 보존한다. 분석 페이지는 `lib/scm.ts` 조회 함수와 `lib/scm-model.ts` 정규화 타입을 거쳐 공통 UI를 렌더링한다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, 순수 CSS, lucide-react, Supabase 기존 server client

**Spec:** `docs/superpowers/specs/2026-08-28-step1-design.md`

## Global Constraints

- Tailwind, styled-components, CSS Modules를 추가하지 않는다.
- 화면 컴포넌트에 hex 색상과 계산식을 작성하지 않는다.
- Supabase raw 데이터와 기존 DB 계산 로직을 변경하지 않는다.
- 화면은 원칙적으로 `analytics` 뷰만 조회한다.
- 계산 불가 값은 숫자 0으로 대체하지 않고 `EmptyValue`를 사용한다.
- 화면 문구와 주석은 한국어로 작성한다.
- 기존 `components/workflow/*`는 수정하지 않는다.
- 완료 전에 `npm test`와 `npm run build`를 실행한다.

## 파일 구조와 책임

- Create `styles/shell.css`: sidebar, topbar, page shell, responsive shell layout
- Create `styles/components.css`: page header, cards, panels, buttons, badges, tables, alerts, empty values
- Create `styles/chart.css`: chart container와 데이터 시각화용 공통 구조만 정의
- Modify `app/globals.css`: reset, root token, font, stylesheet import만 남김
- Create `lib/menu.ts`: USER_MENU와 ADMIN_MENU 타입 및 항목 정의
- Create `components/shell/sidebar.tsx`: 전달받은 메뉴를 렌더링하는 client navigation
- Create `components/shell/topbar.tsx`: 제목·검색 표시·기준월 영역
- Create `components/shell/page-header.tsx`: eyebrow·title·description·action
- Create `components/shell/app-shell.tsx`: Sidebar와 Topbar를 조합하는 공통 wrapper
- Create `components/ui/kpi-card.tsx`: KPI 값, 단위, 보조 설명, tone
- Create `components/ui/panel.tsx`: 제목과 children을 담는 공통 패널
- Create `components/ui/badge.tsx`: 상태 tone을 semantic class로 변환
- Create `components/ui/button.tsx`: 공통 button variant
- Create `components/ui/data-table.tsx`: 분석 화면용 typed data table
- Create `components/ui/alert-row.tsx`: 상태별 알림 행
- Create `components/ui/insight-banner.tsx`: 안내·경고·성공 메시지
- Create `components/ui/empty-value.tsx`: `— + reason_code` 표시
- Create `app/(user)/layout.tsx`: USER AppShell
- Create `app/(user)/page.tsx`: USER overview 진입 화면
- Create `app/(user)/analysis/leadtime/page.tsx`: 공통 컴포넌트 기반 Lead Time 화면
- Create `app/(user)/analysis/stockout/page.tsx`: 공통 컴포넌트 기반 Stockout Risk 화면
- Create `app/(admin)/layout.tsx`: ADMIN AppShell
- Create `app/(admin)/admin/page.tsx`: ADMIN 준비 화면
- Create `app/(auth)/login/page.tsx`: 인증 준비 화면
- Create `app/(legacy)/workflow/page.tsx`: 기존 ProcurementApp wrapper
- Delete `app/page.tsx`: root route를 `(user)/page.tsx`로 이동하기 위해 제거
- Delete `app/analysis/leadtime/page.tsx`: `(user)` route group 아래로 이동
- Modify `lib/scm-model.ts`: Stockout 타입 및 null/reason 정규화 추가
- Modify `lib/scm.ts`: `getStockoutRisks` 조회 함수 추가
- Modify `app/layout.tsx`: 전역 stylesheet import 유지 및 metadata 보완

### Task 1: 전역 토큰과 스타일 파일 분리

**Files:**
- Modify: `app/globals.css`
- Create: `styles/shell.css`
- Create: `styles/components.css`
- Create: `styles/chart.css`

**Interfaces:**
- `globals.css` imports the three stylesheets once.
- Semantic classes use `--color-*`, `--space-*`, `--radius-*`, and `--status-*` tokens.

- [ ] **Step 1: Write a failing stylesheet structure check**

Add a lightweight Node test under `lib/design-system.test.ts` that reads the four stylesheet files and asserts that `globals.css` imports each split stylesheet and `components.css` contains the status classes `status-safe`, `status-warning`, `status-critical`, and `status-unavailable`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test lib/design-system.test.ts`

Expected: FAIL because the `styles/` files and imports do not yet exist.

- [ ] **Step 3: Move CSS responsibilities without changing visual behavior unnecessarily**

Keep reset, body defaults, and tokens in `app/globals.css`. Move shell selectors to `styles/shell.css`, shared UI selectors to `styles/components.css`, and chart selectors to `styles/chart.css`. Use only CSS variables for colors, spacing, status colors, borders, and shadows.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test lib/design-system.test.ts`

Expected: PASS.

### Task 2: Menu definitions and reusable shell

**Files:**
- Create: `lib/menu.ts`
- Create: `components/shell/sidebar.tsx`
- Create: `components/shell/topbar.tsx`
- Create: `components/shell/page-header.tsx`
- Create: `components/shell/app-shell.tsx`

**Interfaces:**

```ts
export type MenuItem = {
  label: string;
  href: string;
  icon: 'dashboard' | 'leadtime' | 'stockout' | 'admin';
  description?: string;
};

export const USER_MENU: readonly MenuItem[];
export const ADMIN_MENU: readonly MenuItem[];
```

`AppShell` accepts `{ menu: readonly MenuItem[]; children: React.ReactNode; title: string }` and renders `Sidebar`, `Topbar`, and the content area. `Sidebar` uses `usePathname()` only to determine the active link; it does not define menu labels itself.

- [ ] **Step 1: Add menu contract test**

Extend `lib/design-system.test.ts` with assertions that USER contains `/`, `/analysis/leadtime`, `/analysis/stockout`, ADMIN contains `/admin`, and no menu item has an empty label or href.

- [ ] **Step 2: Run the test to verify the new assertions fail**

Run: `node --test lib/design-system.test.ts`

Expected: FAIL because `lib/menu.ts` does not exist.

- [ ] **Step 3: Implement menu definitions and shell components**

Use lucide icons already present in the dependency list. Render links with accessible labels, active state, and keyboard focus styles. Keep the shell presentational; it must not fetch data or calculate metrics.

- [ ] **Step 4: Run the test and TypeScript check**

Run: `node --test lib/design-system.test.ts`

Expected: PASS. TypeScript errors will be checked in the build task after route layouts exist.

### Task 3: Common UI components and empty-value semantics

**Files:**
- Create: `components/ui/kpi-card.tsx`
- Create: `components/ui/panel.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/button.tsx`
- Create: `components/ui/data-table.tsx`
- Create: `components/ui/alert-row.tsx`
- Create: `components/ui/insight-banner.tsx`
- Create: `components/ui/empty-value.tsx`

**Interfaces:**

```ts
export type StatusTone = 'safe' | 'warning' | 'critical' | 'unavailable';
export type BadgeTone = StatusTone | 'info' | 'neutral';

export function EmptyValue({ reasonCode }: { reasonCode?: string | null }): JSX.Element;
export function Badge(props: { tone: BadgeTone; children: React.ReactNode }): JSX.Element;
export function KpiCard(props: { label: string; value: React.ReactNode; unit?: string; description?: string; tone?: BadgeTone }): JSX.Element;
```

`EmptyValue` renders `—` alone when no reason exists, otherwise renders `— + {reasonCode}`. `DataTable` accepts typed columns with a `render` function so pages can choose `EmptyValue` for nullable values.

- [ ] **Step 1: Add pure helper tests for empty values and status mapping**

Test a pure exported formatter from `components/ui/empty-value.tsx` or a small adjacent utility: `null` reason gives `—`, and `NO_USAGE` gives `— + NO_USAGE`. Test each `StatusTone` maps to its corresponding semantic class.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test lib/design-system.test.ts`

Expected: FAIL because the component contracts do not exist.

- [ ] **Step 3: Implement the components with semantic classes only**

Do not place hex colors in JSX or component files. Use `button` native props and `forwardRef` only if required by existing usage. Keep table formatting separate from calculations.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`

Expected: all existing model tests plus the new design-system tests pass.

### Task 4: Route groups and legacy isolation

**Files:**
- Create: `app/(user)/layout.tsx`
- Create: `app/(user)/page.tsx`
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/admin/page.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(legacy)/workflow/page.tsx`
- Delete: `app/page.tsx`

**Interfaces:**

- `/` renders the new USER overview inside `AppShell`.
- `/admin` renders the ADMIN placeholder inside `AppShell`.
- `/login` renders an auth placeholder without the USER/ADMIN menu.
- `/workflow` renders the unchanged `ProcurementApp`.

- [ ] **Step 1: Add route existence assertions**

Extend the design-system test to assert the required route files exist: `(user)/page.tsx`, `(user)/analysis/leadtime/page.tsx`, `(user)/analysis/stockout/page.tsx`, `(admin)/admin/page.tsx`, `(auth)/login/page.tsx`, and `(legacy)/workflow/page.tsx`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/design-system.test.ts`

Expected: FAIL because the route group files do not exist.

- [ ] **Step 3: Create route layouts and move the legacy entry point**

Create a minimal user overview with shared `PageHeader`, `KpiCard`, `Panel`, and `InsightBanner`. Create ADMIN and AUTH placeholders. Move only the wrapper responsibility; do not modify `components/workflow/*`.

- [ ] **Step 4: Run the route existence test**

Run: `node --test lib/design-system.test.ts`

Expected: PASS.

### Task 5: Move and convert Lead Time analysis

**Files:**
- Create: `app/(user)/analysis/leadtime/page.tsx`
- Delete: `app/analysis/leadtime/page.tsx`
- Modify: `components/analysis/analysis-frame.tsx` only if needed to remove duplicate shell behavior
- Reuse: `lib/scm.ts`, `lib/scm-model.ts`

**Interfaces:**

- Preserve `getLeadtimeGap()` and its existing normalized `LeadtimeGap` shape.
- Render page heading with `PageHeader`, metrics with `KpiCard`, table container with `Panel`, and gap/confidence states with `Badge`.

- [ ] **Step 1: Add a static source check for forbidden screen colors and direct Supabase calls**

Extend the test to scan the new Lead Time page and assert it contains no `#[0-9A-Fa-f]` color and no `.from(` call. Assert it imports `KpiCard`, `Panel`, and `EmptyValue` or `Badge` as appropriate.

- [ ] **Step 2: Run the check to verify it fails**

Run: `node --test lib/design-system.test.ts`

Expected: FAIL because the new page does not exist.

- [ ] **Step 3: Convert the page without changing calculations**

Keep `getLeadtimeGap()` as the only data entry point. Preserve error-versus-empty handling. Use `EmptyValue` for nullable lead-time values and `Badge` for confidence/status labels. Do not add averages, percentiles, or other calculations in JSX.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

### Task 6: Add Stockout model, query, and screen

**Files:**
- Modify: `lib/scm-model.ts`
- Modify: `lib/scm.ts`
- Create: `app/(user)/analysis/stockout/page.tsx`

**Interfaces:**

```ts
export type StockoutRisk = {
  itemId: string;
  itemName: string;
  supplierId: string;
  currentStock: number | null;
  inboundQty: number | null;
  availableQty: number | null;
  dailyUsageAvg: number | null;
  stockoutDays: number | null;
  stockoutDate: string | null;
  riskStatus: 'SAFE' | 'CRITICAL' | 'UNKNOWN';
  reason: 'NO_USAGE' | 'NO_LEADTIME' | null;
};

export async function getStockoutRisks(): Promise<{ rows: StockoutRisk[]; error: string | null }>;
```

- [ ] **Step 1: Add failing normalization tests**

Add tests for a normal risk row and rows with `stockout_days: null` plus `reason: 'NO_USAGE'` or `'NO_LEADTIME'`. The expected normalized result must preserve `null` and reason, never substitute zero.

- [ ] **Step 2: Run model tests to verify they fail**

Run: `npm test`

Expected: FAIL because the Stockout type and normalizer do not exist.

- [ ] **Step 3: Implement normalization and analytics-only query**

Read `analytics.v_stockout_risk` through the existing server Supabase client. Normalize column aliases using the existing `value()` pattern. Do not modify SQL views or calculate stockout days in React.

- [ ] **Step 4: Implement the page using common UI**

Use `PageHeader`, `KpiCard`, `Panel`, `DataTable`, `Badge`, `AlertRow`, `InsightBanner`, and `EmptyValue`. Display SAFE, CRITICAL, and UNKNOWN consistently; map UNKNOWN with a reason to `CALCULATION_UNAVAILABLE`/unavailable presentation.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: PASS.

### Task 7: Global verification and cleanup

**Files:**
- Modify: `app/layout.tsx` if metadata or stylesheet import cleanup is needed
- Review: all files under `app`, `components`, `lib`, `styles`

- [ ] **Step 1: Check forbidden patterns**

Run: `rg -n "#[0-9A-Fa-f]{3,8}" app components lib styles` and confirm no screen/component file contains a hex color. Run `rg -n "from\(" "app/(user)"` and confirm data access remains in `lib/scm.ts`.

- [ ] **Step 2: Run tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: build completes successfully and lists `/`, `/login`, `/admin`, `/workflow`, `/analysis/leadtime`, and `/analysis/stockout` routes.

- [ ] **Step 4: Check git diff scope**

Run: `git status --short` and verify unrelated `docs/ARCHITECTURE.md`, prior user changes, and existing workflow files were not modified.

