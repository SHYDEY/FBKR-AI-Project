# SuperSCM 프로젝트 아키텍처

> 이 문서는 2026-08-27 기준 저장소의 실제 파일과 설정을 바탕으로 작성한 구조 요약 및 상세 설명입니다. 구현된 기능과 향후 연결 예정인 기능을 구분해 적었습니다.

## 1. 한눈에 보는 요약

### 1.1 프로젝트 목적

한국후지필름BI의 월간 기기·옵션 발주계획 업무를 웹 화면으로 표현한 Next.js 프로토타입입니다. 업무 흐름은 다음 6단계로 구성됩니다.

```text
전체 현황 → 수요 확정 → 재고·공급 → 마스터 검증 → 발주량 계산 → 보고자료
```

현재 홈 화면은 이 흐름을 브라우저 상태와 샘플 데이터로 보여주고, 별도의 분석 화면은 Supabase `analytics` 스키마의 뷰를 서버에서 읽어 표시합니다.

### 1.2 폴더별 기능 요약

| 폴더 | 기능 | 현재 역할 |
|---|---|---|
| `app/` | Next.js App Router 진입점, 공통 레이아웃, API 라우트, 화면 스타일 | 홈 업무 플로우와 리드타임 분석 페이지 제공 |
| `components/` | 화면을 구성하는 React 컴포넌트 | 업무 단계별 화면과 분석용 공통 표·프레임 제공 |
| `lib/` | 데이터 접근, 도메인 모델, Supabase 클라이언트 | 분석 조회와 행 정규화, 환경변수 검증 담당 |
| `sql/` | Supabase 권한 및 RLS 보조 SQL | `core`·`analytics` 읽기 권한과 실습용 쓰기 정책 제공 |
| `supabase/` | Supabase 프로젝트 설정과 마이그레이션 | 수요확정 관련 `public` 테이블 구조 관리 |
| `docs/` | 실습·제품 요구사항·개발 계획 문서 | 업무 배경과 구현 기준 보관 |
| 루트 스크립트 | 샘플 데이터·엑셀 생성 | 수업 및 검토용 산출물 생성 |

### 1.3 파일별 요약

#### `app/`

| 파일 | 역할 |
|---|---|
| `app/page.tsx` | `/` 홈에서 `ProcurementApp`을 렌더링하는 진입점 |
| `app/layout.tsx` | 전체 HTML 문서, 한국어 lang, 메타데이터, 전역 CSS 등록 |
| `app/globals.css` | 순수 CSS 기반 전체 레이아웃·컴포넌트·상태 스타일 |
| `app/analysis/leadtime/page.tsx` | `analytics.v_leadtime_gap`을 조회해 공급처별 리드타임 격차를 표시 |
| `app/api/health/supabase/route.ts` | Supabase 환경변수 설정 여부를 확인하는 GET API |

#### `components/`

| 파일 | 역할 |
|---|---|
| `components/procurement-app.tsx` | 6단계 네비게이션, 현재 단계 상태, 화면 전환을 관리하는 클라이언트 셸 |
| `components/analysis/analysis-frame.tsx` | 분석 화면의 제목·설명·연결 상태 공통 외곽 |
| `components/analysis/data-table.tsx` | 제네릭 컬럼 정의를 받아 표를 렌더링하는 분석 공통 컴포넌트 |
| `components/workflow/step-frame.tsx` | 업무 단계 하단의 이전·다음 버튼과 안내 문구 공통 래퍼 |
| `components/workflow/dashboard-step.tsx` | 전체 현황, 준비상태, 발주계획 목록 샘플 화면 |
| `components/workflow/demand-step.tsx` | OL·SFDC·Bulk-deal·Trend·수급회의 탭과 브라우저 기반 수요 검증·확정 샘플 |
| `components/workflow/supply-step.tsx` | 재고와 Open PO 준비상태 및 납기 위험 샘플 화면 |
| `components/workflow/master-step.tsx` | 품목·BOM·장착율·MOQ·Lead Time·Flexibility Rule 검증 샘플 |
| `components/workflow/calculation-step.tsx` | 발주량, MOQ, Flexibility 예외 검토 구조 샘플 |
| `components/workflow/report-step.tsx` | 경영진 보고자료와 Excel/PDF 출력 예정 영역 샘플 |

#### `lib/`

| 파일 | 역할 |
|---|---|
| `lib/scm-model.ts` | 분석 화면 모델 타입과 다양한 DB 컬럼명을 화면 모델로 정규화 |
| `lib/scm-model.test.ts` | 리드타임 행 정규화와 한국어 컬럼 별칭 처리 테스트 |
| `lib/scm.ts` | 분석용 Supabase 조회 함수의 중앙 진입점 |
| `lib/supabase.ts` | 브라우저·서버 클라이언트와 환경변수 함수의 재-export |
| `lib/supabase/env.ts` | 공개 URL·publishable key 조회 및 필수값 검증 |
| `lib/supabase/client.ts` | 클라이언트 컴포넌트용 Supabase 클라이언트 생성 |
| `lib/supabase/server.ts` | 서버 컴포넌트·조회 함수용 Supabase 클라이언트 생성 |

#### 데이터·문서 폴더

| 파일 | 역할 |
|---|---|
| `sql/01-grants.sql` | `core`·`analytics` 스키마 사용 및 조회 권한 부여. `raw`는 의도적으로 공개하지 않음 |
| `sql/02-policies.sql` | 실습용 `core.leadtime_plan`, `core.usage_profile` 쓰기 권한과 RLS 정책 |
| `supabase/config.toml` | Supabase 로컬 프로젝트 ID, API·Studio 활성화, PostgreSQL 15 설정 |
| `supabase/migrations/20260813000100_create_procurement_demand_core.sql` | 수요확정용 계획·수요·Pipeline·Bulk-deal·실적·확정 테이블과 갱신 트리거 생성 |
| `docs/04-실습안내.md` | 수업 목표, 실행 순서, 오전·오후 산출물 안내 |
| `docs/superpowers/04-실습안내.md` | Supabase 분석 실습의 상세 안내 및 데이터 흐름 설명 |
| `docs/superpowers/specs/2026-08-13-procurement-planning-mvp-prd.md` | 제품 요구사항과 계산·데이터·검증 기준 |
| `docs/superpowers/plans/2026-08-13-procurement-planning-mvp-plan.md` | 초기 MVP 구현 계획 |

## 2. 전체 아키텍처

```text
브라우저
  └─ Next.js App Router
      ├─ /                         ── app/page.tsx
      │   └─ ProcurementApp         ── 클라이언트 상태로 6단계 화면 전환
      │       └─ workflow/*          ── 샘플 입력·검증·계산·보고 화면
      ├─ /analysis/leadtime         ── 서버 컴포넌트
      │   └─ lib/scm.ts              ── 조회 함수
      │       └─ lib/supabase/server.ts
      │           └─ Supabase analytics.v_leadtime_gap
      └─ /api/health/supabase       ── 환경변수 상태 확인

Supabase
  ├─ raw       원본 적재 데이터, 화면에서 직접 조회하지 않음
  ├─ core      정제 기준·확정값·중간 계산 뷰
  ├─ analytics 화면과 AI가 조회하는 분석 뷰
  └─ public    현재 마이그레이션이 만드는 수요확정 업무 테이블
```

핵심 경계는 다음과 같습니다.

1. 화면은 표시와 사용자 상호작용을 담당합니다.
2. Supabase 조회는 `lib/scm.ts`에 모읍니다.
3. DB 컬럼명 차이는 `lib/scm-model.ts`의 정규화 함수에서 흡수합니다.
4. 원본 `raw` 데이터는 직접 수정하거나 화면에서 직접 조회하지 않습니다.
5. 현재 업무 플로우 컴포넌트는 아직 DB 저장·실제 계산에 연결되지 않은 Phase 1 샘플입니다.

## 3. 상세 설명

### 3.1 `app/`: 라우팅과 페이지 진입점

#### `app/page.tsx`

홈 경로 `/`의 최소 진입점입니다. 비즈니스 UI를 직접 구현하지 않고 `components/procurement-app.tsx`의 `ProcurementApp`을 렌더링합니다. 따라서 홈 화면의 실제 상태와 단계 전환은 `components/`에 있습니다.

#### `app/layout.tsx`

Next.js 루트 레이아웃입니다. 페이지 전체에 `app/globals.css`를 적용하고, 문서 언어를 `ko`로 지정합니다. 브라우저 탭 제목은 `월간 발주계획 | Procurement Planning`, 설명은 기기·옵션 월간 수요확정 및 발주계획 MVP로 설정되어 있습니다.

#### `app/globals.css`

Tailwind나 CSS Module을 사용하지 않는 이 프로젝트의 단일 스타일 파일입니다. 색상 토큰, 앱 셸, 사이드바, 상단 바, 진행 단계, 카드·지표·표·버튼·폼·상태 배지·분석 화면 스타일을 모두 정의합니다. `components/`는 주로 `className`으로 이 스타일을 조합합니다.

#### `app/analysis/leadtime/page.tsx`

새 분석 화면의 기준 예제입니다. 서버 컴포넌트에서 `getLeadtimeGap()`을 호출하고, 오류가 있으면 조회 실패 메시지를 보여줍니다. 정상 조회 후 공급처 수, 실제 리드타임이 더 긴 공급처 수, 표본 부족 공급처 수를 계산해 카드로 표시하고, `DataTable`로 공급처별 마스터값·표본수·평균·P80·격차를 표시합니다. `dynamic = 'force-dynamic'`으로 페이지 캐시를 피합니다.

새 분석 화면은 다음 순서를 따르는 것이 프로젝트 규칙입니다.

```text
lib/scm-model.ts → lib/scm.ts → app/analysis/<이름>/page.tsx → components/analysis/* 재사용
```

#### `app/api/health/supabase/route.ts`

GET 요청에 대해 `getSupabaseEnv()`를 사용합니다. 두 환경변수가 없으면 HTTP 503과 `configured: false`를 반환하고, 있으면 `configured: true`를 반환합니다. 데이터베이스 연결이나 쿼리 성공 여부를 검사하는 API가 아니라 환경 설정 유무만 검사합니다.

### 3.2 `components/`: 화면 계층

#### `components/procurement-app.tsx`

`'use client'` 컴포넌트입니다. `StepId` 타입과 6단계 메타데이터를 정의하고 `active` 상태로 현재 단계를 관리합니다. 사이드바와 상단 진행 표시를 만들며, `useMemo`로 현재 단계에 맞는 하위 화면을 선택합니다. 실제 라우팅이 아니라 `setActive`를 통한 단일 페이지 내 전환입니다.

#### `components/workflow/*`

업무 플로우용 화면 묶음입니다. `StepFrame`을 공통으로 사용하지만, 대부분은 대표 샘플값을 JSX에 직접 갖고 있습니다.

- `dashboard-step.tsx`: 전체 KPI, 프로세스 체크리스트, 최근 발주계획 목록을 보여주고 카드 클릭으로 다른 단계로 이동시킵니다.
- `demand-step.tsx`: 유일하게 상태 상호작용이 많은 샘플 화면입니다. 선택 월도, 탭, OL/SFDC/Bulk 행, 회의 정보, 검증·확정 상태를 `useState`로 관리합니다. 합계와 가중 수요는 `useMemo`로 계산하지만 현재는 DB 저장과 연결되지 않습니다.
- `supply-step.tsx`: 정상 재고·출고 대기·품질 보류 재고와 Open PO의 가용·위험·후속월 상태를 보여줍니다.
- `master-step.tsx`: 계산에 필요한 마스터 종류와 검증 체크리스트를 보여줍니다. Lead Time 항목 하나는 확인 필요 상태이며 Excel 업로드 버튼은 비활성화되어 있습니다.
- `calculation-step.tsx`: 기기·옵션·부품의 발주량 계산 결과 표와 Flexibility Rule, MOQ, 납기 관련 예외를 보여줍니다. 수동 조정은 Phase 2 예정입니다.
- `report-step.tsx`: 전월 대비 발주금액과 보고서 미리보기를 보여줍니다. Excel·PDF 다운로드는 비활성화된 자리표시자입니다.

#### `components/analysis/*`

- `analysis-frame.tsx`: 분석 제목, 설명, `SUPABASE LIVE` 배지를 일관되게 표시합니다.
- `data-table.tsx`: `Column<T>` 정의로 라벨, 정렬, 셀 렌더러를 외부에서 주입받습니다. `formatNumber()`는 null을 숫자로 대체하지 않고 `—`로 표시해 계산 불가 상태를 보존합니다.

### 3.3 `lib/`: 모델·조회·접속 계층

#### `lib/scm-model.ts`

화면 모델 `LeadtimeGap`을 정의하고, `normalizeLeadtimeGap()`으로 Supabase 행을 화면에 안전한 형태로 바꿉니다. `supplier_name`, `supplier`, `법인`처럼 여러 후보 컬럼명을 순서대로 확인하며 숫자는 `Number()`와 `Number.isFinite()`로 변환합니다. 값이 없으면 마스터·평균·P80·격차는 `null`, 표본수는 0, 텍스트는 `미정`으로 처리합니다.

#### `lib/scm.ts`

Supabase 접근을 모으는 서버 조회 모듈입니다. `getLeadtimeGap()`은 반드시 `.schema('analytics').from('v_leadtime_gap')`으로 조회하고 정규화된 행을 반환합니다. `getStockoutKpi()`는 `analytics.v_stockout_kpi`에서 한 건을 읽도록 준비되어 있습니다. 오류는 예외를 화면으로 던지기보다 `{ rows/data, error }` 형태로 반환해 화면이 조회 오류와 빈 결과를 구분할 수 있게 합니다.

#### `lib/supabase/`

- `env.ts`: `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만 읽습니다. secret 키는 다루지 않습니다. `getSupabaseEnv()`는 없으면 null, `requireSupabaseEnv()`는 한국어 안내와 함께 예외를 발생시킵니다.
- `client.ts`: 브라우저용 `createClient(url, publishableKey)`를 생성합니다.
- `server.ts`: 서버용 클라이언트를 생성하고 세션 저장·자동 토큰 갱신을 끕니다. 현재 조회 중심 구조에 맞춘 설정입니다.
- `lib/supabase.ts`: 위 모듈을 외부에서 간단히 가져오도록 재-export하는 진입점입니다.

### 3.4 `sql/`와 `supabase/`: 데이터베이스 운영 계층

#### 스키마 역할

| 스키마 | 책임 |
|---|---|
| `raw` | CSV 원본 적재. 직접 수정하거나 화면에서 직접 조회하지 않음 |
| `core` | 공급처 별칭, 계획 리드타임·사용량 같은 기준값과 정제·계산 뷰 |
| `analytics` | 화면과 AI가 읽는 분석 결과 뷰 |
| `public` | 현재 마이그레이션이 만드는 수요확정 업무 테이블 |

`SCHEMA.md`에 정의된 분석 뷰에는 `v_leadtime_gap`, `v_stockout_risk`, `v_stockout_kpi`, `v_usage_profile`, `v_usage_anomaly`가 있습니다. 화면 코드가 직접 사용하는 대표 뷰는 현재 `analytics.v_leadtime_gap`이며, 소진 위험 KPI 조회 함수는 `lib/scm.ts`에 준비되어 있습니다.

#### `sql/01-grants.sql`

`anon`, `authenticated` 역할에 `core`·`analytics` 스키마 사용권과 내부 뷰·테이블 조회권을 부여합니다. 기본 권한도 설정해 이후 추가되는 뷰에 조회권이 붙도록 합니다. `raw` 권한은 부여하지 않아 원본 보호 경계를 유지합니다.

#### `sql/02-policies.sql`

오전 실습에서 확정하는 `core.leadtime_plan`과 `core.usage_profile`을 앱에서 수정할 수 있도록 권한과 RLS 정책을 추가합니다. 현재 정책은 수업용 전체 허용이며, 운영 환경에서는 `auth.uid()` 등으로 제한해야 합니다.

#### `supabase/migrations/20260813000100_create_procurement_demand_core.sql`

수요확정 업무를 위한 `public` 테이블을 생성합니다.

- `planning_runs`: 발주계획의 기준월도, 대상월도, 상태, 계산 버전, 통화
- `ol_demand`: 영업부서 OL 수요
- `sfdc_pipeline`: SFDC Pipeline과 수주확률
- `bulk_deals`: Bulk-deal, 사전재고 확보 여부, 반영률
- `historical_actuals`: 과거 실적
- `demand_confirmations`: 회의 결과와 최종 확정수요

모든 하위 테이블은 `planning_run_id`로 계획에 연결되고, 주요 외래키 인덱스가 생성됩니다. `set_updated_at()` 함수와 테이블별 BEFORE UPDATE 트리거가 `updated_at`을 자동 갱신합니다. 다만 현재 UI는 이 `public` 테이블을 읽거나 쓰지 않고 샘플 상태로 동작합니다.

### 3.5 `docs/`: 제품·실습·개발 기준

- `docs/04-실습안내.md`: 참여자가 설치·환경변수·개발 서버·Supabase 확인을 수행하는 간단한 안내입니다.
- `docs/superpowers/04-실습안내.md`: `raw → core → analytics → 화면` 데이터 흐름, 정규화 계층의 이유, 오전·오후 분석 실습을 더 자세히 설명합니다.
- `docs/superpowers/specs/2026-08-13-procurement-planning-mvp-prd.md`: 제품 목표, 화면 요구사항, 확정수요·순소요량·MOQ·Flexibility 계산 규칙, 데이터 모델, 검증 및 MVP 기준을 담은 원본 요구사항입니다.
- `docs/superpowers/plans/2026-08-13-procurement-planning-mvp-plan.md`: 초기 Phase 1 화면을 어떤 작업 단위로 구현했는지 기록한 계획 문서입니다.
- `docs/ARCHITECTURE.md`: 현재 문서입니다. 저장소를 처음 보는 개발자가 폴더와 파일의 책임을 빠르게 파악하는 용도입니다.

### 3.6 루트 설정·스크립트 파일

| 파일 | 역할 |
|---|---|
| `package.json` | Next.js 개발·빌드·테스트 명령과 런타임 의존성 정의 |
| `package-lock.json` | npm 의존성 잠금 파일 |
| `tsconfig.json` | strict TypeScript, `@/*` 경로 별칭, Next 플러그인 설정 |
| `next.config.ts` | React strict mode를 켠 Next.js 설정 |
| `vercel.json` | Vercel에서 Next.js 프레임워크로 인식하도록 설정 |
| `.env.example`, `.env.local.example` | Supabase 공개 환경변수 입력 형식 안내. 실제 값은 `.env.local`에만 둠 |
| `README.md` | 실행 방법, 현재 Phase 1 범위, 다음 구현 단계, Supabase 연결 절차 |
| `AGENTS.md` | 프로젝트 작업 규칙과 데이터·CSS·검증 원칙 |
| `SCHEMA.md` | Supabase 스키마, 뷰 컬럼, 기대 건수, 접속 규칙 |
| `적용방법.md` | 강사용 준비 커밋과 Supabase 데이터 준비 절차 |
| `2026-08-13-procurement-planning-mvp-prd.md` | 루트에 보관된 PRD 사본 |
| `build_dummy_demand_data.mjs` | 수요확정 실습용 더미 데이터를 엑셀 통합문서로 생성 |
| `build_workbook.mjs` | 프로세스·계산규칙·데이터정의 등 업무 템플릿 통합문서 생성 |
| `purchase_order.csv` | 샘플 구매주문 데이터 파일 |
| `dump.sql` | Supabase 데이터·뷰 복원용 SQL 덤프 |

## 4. 주요 데이터 흐름

### 4.1 리드타임 분석 흐름

```text
Supabase analytics.v_leadtime_gap
  → lib/scm.ts / getLeadtimeGap()
  → lib/scm-model.ts / normalizeLeadtimeGap()
  → app/analysis/leadtime/page.tsx
  → AnalysisFrame + DataTable
```

이 경로에서 SQL 뷰가 평균·P80·격차를 계산하고, 화면은 결과를 조회·표시합니다. 화면 컴포넌트가 raw 데이터를 직접 읽거나 분위수를 계산하지 않는 것이 원칙입니다.

### 4.2 현재 홈 업무 플로우 흐름

```text
/ → ProcurementApp
      ├─ active = dashboard | demand | supply | master | calculation | report
      └─ 하위 Step 컴포넌트 렌더링
             └─ 클릭·입력 → React state 변경
```

현재 이 흐름의 데이터는 컴포넌트 안의 샘플 상수와 브라우저 상태입니다. 수요 확정 버튼은 화면 상태와 안내 문구를 바꾸지만, `public.demand_confirmations` 또는 기타 테이블에 저장하지 않습니다.

## 5. 구현 상태와 향후 확장 지점

### 현재 구현된 것

- Next.js 15 App Router 기반 화면
- 6단계 발주계획 업무 플로우의 화면 구조와 단계 전환
- 수요 화면의 탭·행 편집·검증·확정 상태 샘플 상호작용
- Supabase 브라우저·서버 클라이언트와 환경변수 검증
- `analytics.v_leadtime_gap` 서버 조회 및 정규화
- 리드타임 분석 표와 정규화 함수 테스트
- 수요확정 핵심 테이블을 생성하는 Supabase 마이그레이션

### 아직 샘플 또는 연결 예정인 것

- 홈 업무 플로우의 실제 DB 조회·저장
- Excel/CSV 업로드와 파일 검증
- 재고·Open PO·마스터의 실제 데이터 연동
- 발주량 계산 서비스와 계산 결과 저장
- 수동 조정 이력
- Excel/PDF 보고서 생성
- 운영 수준의 인증·권한별 RLS

새 기능을 추가할 때는 먼저 `lib/scm-model.ts`에 타입과 정규화 함수를 만들고, `lib/scm.ts`에 조회 함수를 추가한 뒤, `app/analysis/<기능이름>/page.tsx` 또는 적절한 업무 컴포넌트에서 화면을 연결하는 것이 현재 구조와 가장 잘 맞습니다.

## 6. 실행·검증 명령

```bash
npm install
npm run dev
npm test
npm run build
```

환경변수 설정 여부만 확인하려면 개발 서버 실행 후 다음 API를 호출합니다.

```bash
curl http://localhost:3000/api/health/supabase
```

분석 화면에서 문제가 생기면 다음 순서로 확인합니다.

1. `.env.local`의 URL과 publishable key가 있는지 확인합니다.
2. Supabase API의 Exposed schemas에 `core`, `analytics`가 있는지 확인합니다.
3. `sql/01-grants.sql`의 권한을 적용했는지 확인합니다.
4. `analytics.v_leadtime_gap`가 존재하고 행을 반환하는지 확인합니다.
5. 조회 오류와 빈 결과를 구분해 화면 메시지를 확인합니다.

## 7. 유지보수 원칙

- 화면에서 `raw` 스키마를 직접 조회하지 않습니다.
- SQL에서 계산할 값은 화면 코드에서 다시 계산하지 않습니다.
- 계산 불가 값은 `null`과 사유 코드로 보존하고 임의의 큰 숫자로 대체하지 않습니다.
- 공통 표·분석 외곽은 `components/analysis/*`를 재사용합니다.
- CSS 프레임워크를 추가하지 않고 `app/globals.css`를 확장합니다.
- 화면 문구·주석·커밋 메시지는 한국어로 작성합니다.
- 변경 후 `npm run build`를 실행합니다.
