# pius-fe

PiUS 업무관리 시스템 v1.0 — Frontend

인력 · 거래처 · 프로젝트 정보를 하나의 시스템에서 관리하고, 서로 연결된 정보를
한 번에 확인할 수 있도록 하는 사내 업무관리 시스템의 웹 클라이언트입니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme` 토큰) |
| Component | 자체 디자인 시스템 (CVA) + Radix (Dialog / Select) |
| Data | TanStack Query |
| Catalog | Storybook |

## 환경 구분

| 환경 | 용도 | 실행 |
| --- | --- | --- |
| `docker` | 로컬 개발 — Docker 로 띄운 백엔드(`localhost:8080`) 연동 | `npm run dev:docker` |
| `dev` | 배포 (Vercel) | Vercel 이 빌드한다 |
| `prod` | 실사용 전환 시 추가 | — |

로컬에서는 `docker` 환경만 사용합니다.

> `docker` 는 **백엔드가 Docker 로 떠 있는 로컬 환경**을 뜻한다.
> 프론트엔드 자체는 컨테이너로 띄우지 않는다 — HMR 이 느려지고 코드를 고칠 때마다
> 이미지를 다시 빌드해야 해 개발이 불편해진다.

## 배포

**Vercel** 에 배포한다. `dev` 브랜치에 merge 하면 자동으로 새 배포가 올라간다.
Next.js 를 네이티브로 빌드하므로 Dockerfile 은 없다.

| | |
| --- | --- |
| 주소 | `https://admin.pius.co.kr` |
| Production Branch | `dev` |
| 함수 리전 | `icn1` (서울) — `vercel.json` 에서 지정 |
| 백엔드 | `https://api.pius.co.kr` (Cloud Run · 도쿄) |

리전을 지정하는 이유는 기본값이 `iad1`(버지니아)이기 때문이다. 그대로 두면 BFF 인증
호출이 한국 → 미국 → 도쿄를 왕복한다.

### 환경변수 (Vercel Production 스코프)

| 이름 | 반영 시점 |
| --- | --- |
| `NEXT_PUBLIC_APP_ENV` | 빌드 |
| `NEXT_PUBLIC_API_BASE_URL` | **빌드 타임에 클라이언트 번들에 박힌다** — 바뀌면 재빌드 |
| `API_INTERNAL_URL` | 런타임 |

`NEXT_PUBLIC_API_BASE_URL` 이 빌드 타임 값이라 백엔드 주소로 Cloud Run 의 `*.run.app` URL 을
쓰지 않는다. 서비스를 다시 만들 때마다 프론트를 재빌드해야 하기 때문이다.

> **프리뷰 배포는 데이터 조회가 안 된다.** 프리뷰 URL 은 백엔드 CORS 허용 목록에 없다.
> 프리뷰는 UI 확인용으로만 쓰고, 동작 확인은 `admin.pius.co.kr` 에서 한다.

전체 구성과 배포 절차는 [인프라 구조](docs/INFRA.md) 를 본다.

## 빠른 시작

```bash
npm install
npm run dev:docker      # http://localhost:3000
```

백엔드가 함께 떠 있어야 한다.

```bash
cd ../backend && docker compose -f docker/docker-compose.yml up -d
```

> 3000 번 포트가 이미 사용 중이면 `npm run dev:docker -- --port 3100` 처럼 다른 포트를 쓰면 된다.
> 백엔드의 `docker` 프로필이 `http://localhost:*` 를 허용하므로 별도 설정이 필요 없다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev:docker` | 로컬 개발 (`.env.docker`, 백엔드 `localhost:8080`) |
| `npm run dev` | 개발 서버 환경으로 실행 (`.env.development`) |
| `npm run build:prod` | 운영 빌드 (`.env.production`) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` / `format:check` | Prettier |
| `npm run check` | lint + typecheck + format:check (PR 전 실행) |
| `npm run storybook` | 디자인 시스템 카탈로그 (http://localhost:6006) |
| `npm run build-storybook` | Storybook 정적 빌드 |

환경변수는 `src/shared/config/env.ts` 한 곳에서 읽는다. 다른 파일에서 `process.env` 를 직접 참조하지 않는다.

## 문서

- [PRD](docs/PRD.md)
- [화면 정의서](docs/SCREENS.md)
- [디자인 시스템](docs/DESIGN_SYSTEM.md)
- [폴더 구조](docs/FOLDER_STRUCTURE.md)
- [개발 컨벤션](docs/CONVENTION.md)

## 브랜치 전략

- `main` — 릴리스
- `dev` — 기본 브랜치, 개발 통합
- `feat/#N-slug`, `chore/#N-slug`, `docs/#N-slug`, `fix/#N-slug` — 작업 브랜치 (base: `dev`)
