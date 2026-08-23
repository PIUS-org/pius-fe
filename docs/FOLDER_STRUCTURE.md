# 폴더 구조 — pius-fe

## 1. 최상위

```
pius-fe/
├── proxy.ts                   Next 16 의 middleware (인증 여부 판정)
├── .storybook/
│   ├── main.ts
│   └── preview.tsx            theme.css 전역 주입
├── docs/
│   ├── PRD.md
│   ├── SCREENS.md
│   ├── DESIGN_SYSTEM.md
│   ├── FOLDER_STRUCTURE.md
│   └── CONVENTION.md
├── public/
│   └── pius-logo.png
├── src/
├── .env.example
├── .env.docker                로컬 (백엔드 localhost:8080)
├── .env.development           개발 서버
├── .env.production            운영
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## 2. `src/` 구조

레이어를 4단으로 나눈다. **의존 방향은 항상 아래로만** 흐른다.

```
app  →  features  →  entities  →  shared
```

| 레이어 | 책임 | 다른 레이어 참조 |
| --- | --- | --- |
| `app` | 라우팅 · 페이지 조립 · 레이아웃 | features · entities · shared |
| `features` | 도메인 기능 (API 호출, 훅, 화면 조각) | entities · shared |
| `entities` | 도메인 타입과 순수 도메인 로직 | shared |
| `shared` | 디자인 시스템 · 유틸 · API 클라이언트 | (없음) |

같은 레이어끼리의 가로 참조도 금지한다 (`features/hr` → `features/project` ✗).
필요하면 공통 부분을 `entities` 또는 `shared` 로 내린다.

```
src/
├── app/
│   ├── layout.tsx                       루트 (폰트 · Provider)
│   ├── globals.css                      theme.css import + 리셋
│   ├── page.tsx                         권한에 따라 리다이렉트
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                   사이드바 셸 + 권한 가드
│   │   ├── hr/
│   │   │   ├── page.tsx                 인력 목록
│   │   │   ├── new/page.tsx             인사 등록
│   │   │   └── [id]/page.tsx            인사 상세
│   │   ├── clients/
│   │   │   ├── page.tsx  new/page.tsx  [id]/page.tsx
│   │   └── projects/
│   │       ├── page.tsx  new/page.tsx  [id]/page.tsx
│   ├── providers.tsx                    QueryClient · Auth · Toast
│   └── api/
│       └── auth/[action]/route.ts        BFF 프록시 (refresh 쿠키 중계)
│
├── shared/
│   ├── ui/                              디자인 시스템 primitives + 스토리
│   │   ├── button.tsx  button.stories.tsx
│   │   ├── input.tsx   textarea.tsx  select.tsx  radio.tsx  segmented.tsx
│   │   ├── field.tsx   card.tsx      panel.tsx   tag.tsx
│   │   ├── table.tsx   tabs.tsx      pagination.tsx
│   │   ├── dialog.tsx  toast.tsx     file-upload.tsx
│   │   ├── empty-state.tsx  detail-row.tsx  page-header.tsx
│   │   └── index.ts
│   ├── lib/
│   │   ├── cn.ts                        clsx + tailwind-merge
│   │   ├── format.ts                    formatPhone / formatMoney / formatDate / maskRrn
│   │   └── date.ts
│   ├── api/
│   │   ├── client.ts                    fetch 래퍼 + 401 재발급
│   │   ├── types.ts                     ApiResponse · PageResponse
│   │   ├── error.ts                     ApiError · 정규화
│   │   ├── query-client.ts              TanStack Query 설정
│   │   └── error-code.ts                화면 맥락별 문구 재정의
│   └── config/
│       └── env.ts                       환경변수 검증 및 노출
│
├── entities/
│   ├── person/  { types.ts, status.ts }         재직상태 · 라벨 매핑
│   ├── client/  { types.ts, status.ts }         진행여부 라벨 · 태그
│   ├── project/ { types.ts, status.ts }         진행상태 · overdue 표시 로직
│   └── account/ { types.ts, role.ts }           권한 판정 (canManageHr 등)
│
└── features/
    ├── auth/
    │   ├── api/       login.ts  logout.ts  me.ts
    │   ├── hooks/     use-auth.ts  use-login.ts
    │   ├── components/ login-form.tsx
    │   └── auth-provider.tsx
    ├── hr/
    │   ├── api/       person.api.ts
    │   ├── hooks/     use-person-list.ts  use-person-detail.ts  use-create-person.ts
    │   └── components/ person-table.tsx  person-filter.tsx  person-form.tsx
    │                    person-info-tab.tsx  person-project-tab.tsx
    ├── client/
    │   ├── api/  hooks/  components/
    └── project/
        ├── api/  hooks/
        └── components/ project-table.tsx  project-form.tsx
                         project-basic-tab.tsx  project-member-tab.tsx
                         project-close-dialog.tsx  add-member-dialog.tsx
```

### 파일 네이밍

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 파일 | kebab-case | `person-table.tsx` |
| 컴포넌트 이름 | PascalCase | `PersonTable` |
| 훅 | `use-` 접두 | `use-person-list.ts` |
| API 모듈 | `*.api.ts` | `person.api.ts` |
| 스토리 | `*.stories.tsx` | `button.stories.tsx` |
| 타입 | `types.ts` | |

---

## 3. 라우팅

| 라우트 | 파일 | 접근 |
| --- | --- | --- |
| `/login` | `app/(auth)/login/page.tsx` | 전체 |
| `/hr`, `/hr/new`, `/hr/[id]` | `app/(app)/hr/**` | `MASTER` · `EMPLOYEE` |
| `/clients`, `/clients/new`, `/clients/[id]` | `app/(app)/clients/**` | `MASTER` · `EMPLOYEE` |
| `/projects`, `/projects/new`, `/projects/[id]` | `app/(app)/projects/**` | 전체 |

- **`proxy.ts`** 가 인증 여부만 판정해 미인증 시 `/login` 으로 보낸다.
  Next 16 에서 `middleware.ts` 가 `proxy.ts` 로 바뀌었고, export 하는 함수 이름도 `proxy` 다.
  런타임은 `nodejs` 고정이며 `edge` 는 지원하지 않는다.
- 역할 기반 차단은 `(app)/layout.tsx` 의 가드에서 처리하고, 서버는 별도로 `403` 을 반환한다.
  **프론트엔드 가드는 UX 용이며 보안 경계가 아니다.**

---

## 4. 서버 컴포넌트 / 클라이언트 컴포넌트

- 기본은 **서버 컴포넌트**. 상호작용(폼 · 다이얼로그 · 탭 · 필터)이 있는 조각만 `'use client'`.
- 데이터 조회는 클라이언트에서 TanStack Query 로 한다 (권한별 응답이 다르고 즉시 갱신이 필요하므로).
- 페이지 파일은 얇게 유지하고 실제 화면은 `features/*/components` 에 둔다.

---

## 5. 환경변수

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 API base URL |
| `NEXT_PUBLIC_APP_ENV` | `docker` \| `dev` \| `prod` |
| `API_INTERNAL_URL` | BFF Route Handler 가 서버에서 호출할 백엔드 주소 |

| 파일 | 용도 | 실행 |
| --- | --- | --- |
| `.env.docker` | 로컬 (`http://localhost:8080`) | `npm run dev:docker` |
| `.env.development` | 개발 서버 | `npm run dev` / `npm run build:dev` |
| `.env.production` | 운영 | `npm run build:prod` |

`docker` 는 **백엔드가 Docker 로 떠 있는 로컬 환경**을 뜻한다. 프론트엔드를 컨테이너로
띄운다는 의미가 아니다 — 로컬 개발은 `next dev` 로 직접 실행한다.

`src/shared/config/env.ts` 에서 한 번 읽어 검증하고, 다른 파일에서 `process.env` 를 직접 참조하지 않는다.
로컬 개발은 `docker` 환경만 사용한다.
