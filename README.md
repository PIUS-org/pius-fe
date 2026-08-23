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

| 환경 | 용도 |
| --- | --- |
| `docker` | 로컬 개발 — Docker 로 띄운 백엔드(`localhost:8080`) 연동 |
| `dev` | 개발 서버 배포용 |
| `prod` | 운영 배포용 |

로컬에서는 `docker` 환경만 사용합니다.

## 빠른 시작

```bash
npm install
npm run dev:docker      # http://localhost:3000
npm run storybook       # http://localhost:6006
```

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
