# STEP1 Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SCM 분석 화면이 공통 디자인 토큰, 컴포넌트, 메뉴 및 route group을 사용하는 기반을 만든다.

**Architecture:** `app/globals.css`는 토큰과 전역 기본값만 소유하고, shell/component/chart 스타일은 `styles/`로 분리한다. 서버 조회 화면은 기존 `lib/scm.ts`를 사용하며 UI는 공통 컴포넌트만 조합한다. 레거시 workflow는 `app/(legacy)/workflow`에 둔다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, 순수 CSS, 기존 Supabase 조회 계층.

**Spec:** 사용자 제공 STEP1 요구사항과 `AGENTS.md`, `SCHEMA.md`.

## Global Constraints

- Tailwind, styled-components, CSS Modules를 추가하지 않는다.
- 화면 컴포넌트에 hex 색상과 계산 로직을 직접 작성하지 않는다.
- 계산 불가 값은 0으로 대체하지 않고 `EmptyValue`로 표시한다.
- 기존 DB 계산 SQL과 레거시 workflow 구현은 변경하지 않는다.
- 화면 문구와 주석은 한국어로 작성한다.

### Task 1: Foundation contract

**Files:**
- Create: `lib/step1-foundation.test.ts`
- Create: `docs/superpowers/plans/2026-09-04-step1-design-system.md`

- [x] 프로젝트 구조와 기존 CSS/layout/analysis/workflow를 확인한다.
- [x] 공통 파일, route group, 메뉴 및 상태 토큰의 계약을 테스트로 고정한다.

### Task 2: Tokens and styles

**Files:**
- Modify: `app/globals.css`
- Create: `styles/shell.css`
- Create: `styles/components.css`
- Create: `styles/chart.css`
- Modify: `app/layout.tsx`

- [ ] 전역 토큰과 기본 타이포그래피를 `globals.css`에 둔다.
- [ ] shell, UI, chart 스타일을 각 파일로 분리하고 layout에서 로드한다.
- [ ] SAFE, WARNING, CRITICAL, CALCULATION_UNAVAILABLE 상태 스타일을 토큰으로 제공한다.

### Task 3: Shared components and menu

**Files:**
- Create: `components/shell/sidebar.tsx`
- Create: `components/shell/topbar.tsx`
- Create: `components/shell/page-header.tsx`
- Create: `components/ui/kpi-card.tsx`
- Create: `components/ui/panel.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/button.tsx`
- Create: `components/ui/data-table.tsx`
- Create: `components/ui/alert-row.tsx`
- Create: `components/ui/insight-banner.tsx`
- Create: `components/ui/empty-value.tsx`
- Create: `lib/menu.ts`

- [ ] 상태와 null 표현을 공통 컴포넌트 props로 제공한다.
- [ ] USER/ADMIN 메뉴를 `lib/menu.ts`에서만 정의한다.

### Task 4: Route groups and screens

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(user)/layout.tsx`
- Create: `app/(admin)/layout.tsx`
- Create: `app/(user)/analysis/leadtime/page.tsx`
- Create: `app/(user)/analysis/stockout/page.tsx`
- Modify: `app/page.tsx`
- Modify: `app/analysis/leadtime/page.tsx`
- Modify: `components/analysis/analysis-frame.tsx`

- [ ] 공통 shell을 route group layout에서 사용한다.
- [ ] Lead Time과 Stockout Risk를 공통 UI로 렌더링한다.
- [ ] 레거시 workflow는 기존 위치에만 둔다.

### Task 5: Verification

- [ ] `npm test`를 실행한다.
- [ ] `npm run build`를 실행한다.
- [ ] 화면 코드의 직접 hex 색상과 route/file 계약을 확인한다.
