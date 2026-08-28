# STEP1 공통 SCM 디자인 시스템 및 라우팅 설계

## 목표

앞으로 추가될 SCM 화면이 동일한 디자인 토큰, 공통 컴포넌트, 메뉴 정의, route group을 사용하도록 기반을 만든다. 기존 계산 로직과 레거시 workflow는 변경하지 않고 새 USER 분석 화면에서 공통 기반의 재사용성을 검증한다.

## 현재 상태

- Next.js 15 App Router와 React 19를 사용한다.
- 스타일은 `app/globals.css`에 집중되어 있고 Tailwind는 사용하지 않는다.
- 현재 화면은 `/`의 하드코딩 workflow와 `/analysis/leadtime`의 분석 화면이다.
- Supabase 분석 데이터는 `analytics` 스키마를 통해 조회한다.
- `Stockout Risk` route와 화면은 아직 존재하지 않는다.
- 기존 workflow 컴포넌트는 `components/workflow/*`에 있다.

## 범위

### 포함

1. 디자인 토큰과 상태 표현 체계 정리
2. `styles/shell.css`, `styles/components.css`, `styles/chart.css` 분리
3. shell 및 UI 공통 컴포넌트 추가
4. USER, ADMIN, AUTH route group 추가
5. `lib/menu.ts`에 USER/ADMIN 메뉴 정의 추가
6. 기존 workflow를 `/workflow` 레거시 route로 격리
7. Lead Time 화면을 공통 컴포넌트 기반으로 변환
8. `analytics.v_stockout_risk` 기반 Stockout Risk 화면 추가
9. 계산 불가 값을 `EmptyValue`로 통일

### 제외

- Supabase SQL view와 계산식 변경
- raw 데이터 수정
- 실제 로그인·권한 인증 구현
- workflow의 기능 개선 또는 리팩터링
- 차트 라이브러리 도입
- Tailwind, styled-components, CSS Modules 도입

## 라우팅 구조

Route group은 URL에 노출하지 않는다.

```text
app/
├─ (auth)/
│  └─ login/page.tsx                 # /login
├─ (user)/
│  ├─ layout.tsx
│  ├─ page.tsx                       # /
│  └─ analysis/
│     ├─ leadtime/page.tsx           # /analysis/leadtime
│     └─ stockout/page.tsx           # /analysis/stockout
├─ (admin)/
│  ├─ layout.tsx
│  └─ admin/page.tsx                 # /admin
└─ (legacy)/
   └─ workflow/page.tsx              # /workflow
```

`(user)/layout.tsx`와 `(admin)/layout.tsx`는 공통 shell을 사용한다. `(auth)`는 로그인 화면을 위한 최소 route만 제공하며 실제 인증은 후속 범위다. `/workflow`는 현재 `ProcurementApp`을 그대로 렌더링한다.

## 디자인 시스템

`app/globals.css`에는 다음만 둔다.

- 브라우저 기본 reset
- 문서 기본 글꼴과 body 기본값
- 색상, 간격, radius, shadow, typography 토큰
- 세 상태와 계산 불가 상태의 semantic token
- 분리된 stylesheet import

화면 컴포넌트는 hex 색상, 상태별 개별 색상, 임의 간격을 직접 작성하지 않는다. 색상과 간격은 CSS custom property 또는 공통 class를 통해서만 사용한다.

상태 매핑은 다음과 같다.

| 도메인 상태 | 표현 | 의미 |
|---|---|---|
| `SAFE` | green | 안전 범위 |
| `WARNING` | amber | 확인 필요 |
| `CRITICAL` | red | 즉시 조치 필요 |
| `CALCULATION_UNAVAILABLE` | gray | 계산 불가 |

## 공통 컴포넌트 계약

### Shell

- `Sidebar`: `items`, `currentPath`, `title`을 받아 메뉴를 렌더링한다.
- `Topbar`: 현재 페이지 제목, 기준월, 검색 표시 영역을 렌더링한다.
- `PageHeader`: `eyebrow`, `title`, `description`, 선택적 action을 렌더링한다.

### UI

- `KpiCard`: label, value, optional unit, trend, tone, description을 표시한다.
- `Panel`: 제목, 설명, 우측 action, children을 담는 흰색 패널이다.
- `Badge`: `safe | warning | critical | unavailable | info | neutral` tone을 받아 상태를 표시한다.
- `Button`: `primary | secondary | ghost` variant와 native button 속성을 지원한다.
- `DataTable`: 컬럼 정의와 행, row key, 빈 결과 문구를 받아 표를 렌더링한다.
- `AlertRow`: 상태, 제목, 설명, 선택적 action을 한 행으로 표시한다.
- `InsightBanner`: 정보·경고·성공 tone의 안내 문구를 표시한다.
- `EmptyValue`: `reasonCode`를 받아 `— + REASON_CODE` 형식으로 표시한다. reason code가 없으면 `—`만 표시한다.

계산 불가 상태는 KPI, 표 셀, 상세 화면에서 숫자 `0`, `999`, 빈 문자열로 대체하지 않는다.

## 데이터 흐름

```text
Supabase analytics view
  → lib/scm.ts 조회 함수
  → lib/scm-model.ts 정규화 타입
  → route page
  → 공통 shell/UI 컴포넌트
```

화면은 Supabase client를 직접 호출하지 않는다. Lead Time의 기존 조회 함수와 정규화 규칙은 유지한다. Stockout은 기존 `getStockoutKpi` 패턴을 따라 `getStockoutRisks` 조회 함수를 추가하되, DB view와 계산식은 변경하지 않는다.

## 레거시 격리

기존 `app/page.tsx`의 `ProcurementApp` 렌더링은 `(legacy)/workflow/page.tsx`로 이동한다. 새 `(user)/page.tsx`는 공통 shell과 새 대시보드 진입 화면을 사용한다. `components/workflow/*`는 수정하지 않는다.

## 메뉴 정의

`lib/menu.ts`에서 `USER_MENU`와 `ADMIN_MENU`를 별도로 export한다. 각 항목은 `label`, `href`, `icon` 식별자, 선택적 `description`을 가진다. Sidebar는 메뉴 항목을 직접 선언하지 않고 전달받은 메뉴만 렌더링한다.

## 오류 및 빈 결과 처리

- 조회 오류: `조회에 실패했습니다`와 원인 메시지를 `InsightBanner` 또는 `Panel`에 표시한다.
- 빈 결과: 오류와 구분하여 `표시할 데이터가 없습니다`를 표시한다.
- 계산 불가: `EmptyValue`와 reason code를 표시한다.
- analytics route는 `dynamic = 'force-dynamic'`을 유지한다.

## 검증 계획

1. 공통 컴포넌트 import와 타입 검사를 통해 route group 빌드 여부를 확인한다.
2. Lead Time route에서 KPI, 표, 상태 배지, 오류/빈 결과 구조를 확인한다.
3. Stockout route에서 SAFE/WARNING/CRITICAL과 계산 불가 행을 확인한다.
4. 화면 파일의 hex 색상 검색 결과가 0건인지 확인한다.
5. `npm test`를 실행한다.
6. `npm run build`를 실행한다.

## 후속 작업

- 실제 인증·권한 middleware
- ADMIN 전용 데이터 관리 화면
- Supabase에 planning run 저장
- 차트 공통 컴포넌트의 실제 분석 데이터 연결
- 레거시 workflow를 단계별로 새 USER 화면으로 대체
