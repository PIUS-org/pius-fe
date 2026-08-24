# pius-fe

PiUS 업무관리 시스템 v1.0 — Frontend

인력 · 거래처 · 프로젝트 정보를 하나의 시스템에서 관리하고, 서로 연결된 정보를
한 번에 확인할 수 있도록 하는 사내 업무관리 시스템의 웹 클라이언트입니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme` 토큰) |
| Component | 자체 디자인 시스템 (CVA) + Radix (Dialog / Select) |
| Data | TanStack Query |
| Catalog | Storybook |

## 환경 구분

| 환경 | 용도 | 실행 |
| --- | --- | --- |
| `docker` | 로컬 개발 — Docker 로 띄운 백엔드(`localhost:8080`) 연동 | `npm run dev:docker` |
| `dev` | 개발 서버 배포용 | `npm run build:dev` |
| `prod` | 운영 배포용 | `npm run build:prod` |

로컬에서는 `docker` 환경만 사용합니다.

> `docker` 는 **백엔드가 Docker 로 떠 있는 로컬 환경**을 뜻한다.
> 프론트엔드 자체는 컨테이너로 띄우지 않는다 — HMR 이 느려지고 코드를 고칠 때마다
> 이미지를 다시 빌드해야 해 개발이 불편해진다.

## 배포

배포 대상이 아직 정해지지 않았다. `next.config.ts` 에 `output: 'standalone'` 을 켜 두어
컨테이너 배포로 결정되면 Dockerfile 작성만 남는다.

| 대상 | 필요한 것 |
| --- | --- |
| Vercel | 추가 작업 없음. 환경변수만 주입 |
| ECS · Cloud Run · 자체 서버 | multi-stage Dockerfile + `.dockerignore` |

어느 쪽이든 `.env.development` / `.env.production` 의 API 주소를 실제 값으로 바꿔야 한다.

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
