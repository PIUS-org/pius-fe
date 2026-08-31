# 인프라 구조 — PiUS ERP

> 이 문서는 `pius-be` · `pius-fe` 양쪽에 같은 내용으로 들어간다.

## 이 배포의 목적

**기획자와 개발자가 화면을 보고 피드백을 주기 위한 리뷰 환경이다.** 실사용 오픈이 아니다.

이 전제가 아래 설계 곳곳을 결정한다 — 콜드 스타트 15초를 그냥 받아들이고, 상시 가동
장치를 만들지 않고, 데모 데이터를 그대로 띄운다. 실사용으로 넘어갈 때 무엇이 더
필요한지는 [§6](#6-실사용-전환-시-필요한-것) 에 모아뒀다.

---

## 1. 구성

```
                      ┌──────────────── 브라우저 (한국) ────────────────┐
                      │                                                │
        ① /api/auth/* │                                  ② /api/v1/*   │
                      ▼                                                ▼
        ┌─────────────────────────────┐              ┌──────────────────────────────┐
        │  admin.pius.co.kr           │              │  api.pius.co.kr              │
        │  Vercel (icn1 · 서울)       │──── BFF ────▶│  Cloud Run (도쿄)            │
        │  Next.js 16 / Node 22       │   서버간 호출 │  Spring Boot 4 / JRE 21      │
        │  Production Branch = dev    │              │  min 0 · max 2 · 512Mi       │
        └─────────────────────────────┘              └───────────┬──────────────────┘
                      ▲                                          │
                      │ git push (dev)                           ├──▶ Supabase Postgres
                      │                                          │    (Supavisor 풀러 :5432)
        ┌─────────────┴───────────────┐                          │
        │  GitHub  PIUS-org           │                          └──▶ Cloudflare R2
        │  pius-fe / pius-be  [dev]   │                               (S3 API · egress 무료)
        └─────────────┬───────────────┘
                      │ Cloud Build 트리거 (dev push)
                      ▼
        Artifact Registry (도쿄) ──▶ Cloud Run 새 리비전
```

| 구성요소 | 선택 | 이유 |
| --- | --- | --- |
| 백엔드 | Cloud Run `asia-northeast1` | 컨테이너를 그대로 올릴 수 있고 유휴 시 0 으로 줄어든다 |
| 프론트 | Vercel, 함수 리전 `icn1` | Next.js 네이티브 빌드라 Dockerfile 이 필요 없다 |
| DB | Supabase (무료) | 관리형 PostgreSQL |
| 파일 | Cloudflare R2 | egress 무료. 첨부 다운로드가 많아도 요금이 늘지 않는다 |
| 배포 | GitHub `dev` merge → Cloud Build 가 당겨서 빌드 | |

### 트래픽 경로가 둘로 갈리는 이유

브라우저는 **인증 3종**(`login` · `refresh` · `logout`)만 Vercel 의 BFF 라우트를 거치고,
나머지 데이터 API 는 Cloud Run 을 직접 호출한다.

인증만 BFF 를 타는 건 **쿠키 때문**이다. Refresh 토큰은 httpOnly 쿠키로 다뤄야 하는데,
백엔드가 다른 출처라 브라우저가 XHR 에 쿠키를 실어 보내지 않는다. 그래서 Next 서버가
백엔드 쿠키를 받아 자기 도메인의 `pius_session` 으로 다시 구워준다.

나머지를 전부 프록시로 넘기지 않은 건 홉이 하나 더 늘고(한국→서울→도쿄→서울→한국)
첨부파일 다운로드가 Vercel 대역폭을 그대로 먹기 때문이다.

`admin` 과 `api` 가 같은 `pius.co.kr` 아래에 있어도 **출처가 다르므로 CORS 는 필요하다.**
다만 주소가 고정이라 한 번 넣으면 다시 건드릴 일이 없다.

> **Vercel 프리뷰 배포 URL 은 CORS 목록에 없어 데이터 조회가 실패한다.**
> 프리뷰는 UI 확인용으로만 쓰고, 리뷰는 `admin.pius.co.kr` 에서 한다.

### 커스텀 도메인을 처음부터 쓰는 이유

`NEXT_PUBLIC_API_BASE_URL` 은 **빌드 타임에 클라이언트 번들에 문자열로 박히는** 값이다.
백엔드 주소로 `*.run.app` 을 쓰면 서비스를 다시 만들 때마다 프론트를 재빌드해야 한다.

---

## 2. 환경변수

### 백엔드 (Cloud Run)

| 이름 | 값 | 비고 |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` | **반드시 지정한다.** 이미지에 `docker` 가 박혀 있다 |
| `DB_URL` | `jdbc:postgresql://...pooler.supabase.com:5432/postgres?sslmode=require` | Supavisor **session** 풀러 |
| `DB_USERNAME` | `postgres.<project-ref>` | 그냥 `postgres` 가 아니다 |
| `DB_PASSWORD` | | |
| `JWT_SECRET` | `openssl rand -base64 48` | |
| `RRN_ENCRYPTION_KEY` | `openssl rand -base64 32` | **한 번 정하면 바꾸지 않는다** |
| `CORS_ALLOWED_ORIGINS` | `https://admin.pius.co.kr` | 와일드카드 금지 |
| `PIUS_SEED_ENABLED` | `true` | 리뷰 환경 한정 |
| `PIUS_STORAGE_TYPE` | `r2` | |
| `PIUS_STORAGE_R2_ACCOUNT_ID` | | |
| `PIUS_STORAGE_R2_BUCKET` | `pius-attachments-dev` | |
| `PIUS_STORAGE_R2_ACCESS_KEY_ID` | | |
| `PIUS_STORAGE_R2_SECRET_ACCESS_KEY` | | |

`SPRING_PROFILES_ACTIVE` 를 빠뜨리면 `docker` 프로필로 뜬다 — 하드코딩된 JWT 시크릿,
DEBUG 로그, `/actuator/env` 노출이 그대로 붙는다.

### 프론트 (Vercel · Production 스코프)

| 이름 | 값 | 반영 시점 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `dev` | 빌드 |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.pius.co.kr/api/v1` | **빌드 타임에 번들에 박힌다** |
| `API_INTERNAL_URL` | `https://api.pius.co.kr/api/v1` | 런타임 |

### Cloud Run 리소스

```
--memory 512Mi --cpu 1 --max-instances 2 --concurrency 80 --cpu-boost --port 8080
```

`min-instances` 는 **0 이다.** 1 로 올리면 무료 티어를 즉시 초과한다. 대신 유휴 후 첫
요청이 15~25 초 걸린다.

`--max-instances 2` 는 Hikari 풀 크기 5 와 짝이다. Cloud Run 은 인스턴스마다 풀을 따로
만들므로 실제 Supabase 커넥션은 `5 × 인스턴스 수`가 된다.

---

## 3. Supabase 연결 시 주의

**반드시 Supavisor 풀러를 쓴다.** 무료 플랜의 직접 연결(direct connection)은 **IPv6 전용**인데
Cloud Run 은 기본적으로 IPv6 로 나가지 못한다. 그냥 연결하면 붙지 않는다.

대시보드에서 **Session pooler (포트 5432)** 문자열을 쓴다. HikariCP 처럼 커넥션을 오래
쥐는 방식과 맞는 건 session 모드다. transaction 모드(6543)를 쓰려면 prepared statement 를
꺼야 한다(`prepareThreshold=0`).

계정 형식도 `postgres` 가 아니라 `postgres.<project-ref>` 다.

스키마는 Flyway 가 기동 시 만든다. `ddl-auto` 는 `validate` 라 Hibernate 가 테이블을
건드리지 않는다.

---

## 4. 배포 절차

### Phase 1 — 손으로 띄워서 정상 구동 확인

1. **Supabase** 프로젝트 생성 (리전 `ap-northeast-2` 서울) → Session pooler 문자열 확보
2. **R2** 버킷 `pius-attachments-dev` 생성 → API 토큰 (Object Read & Write) 발급
3. **GCP** 프로젝트 생성, 결제 계정 연결, `run` · `cloudbuild` · `artifactregistry` API 활성화
4. Artifact Registry 저장소 `pius` (도쿄) 생성 + **정리 정책**(최근 3개)
5. 키 생성 — `openssl rand -base64 48` (JWT), `openssl rand -base64 32` (RRN)
6. 백엔드 배포
   ```bash
   gcloud run deploy pius-be-dev \
     --source . --region asia-northeast1 \
     --allow-unauthenticated --port 8080 \
     --memory 512Mi --cpu 1 --max-instances 2 --cpu-boost \
     --set-env-vars SPRING_PROFILES_ACTIVE=dev,PIUS_SEED_ENABLED=true,...
   ```
7. `curl <run.app URL>/actuator/health` → `UP`. Supabase 에 테이블 8개와 시드가 들어갔는지 확인
8. **도메인 연결** (인증서 발급에 시간이 걸리므로 여기서 시작한다)
   - Google Search Console 에서 `pius.co.kr` 소유 확인 (등록업체 DNS 에 TXT)
   - `gcloud beta run domain-mappings create --service pius-be-dev --domain api.pius.co.kr --region asia-northeast1`
   - 출력된 `CNAME api → ghs.googlehosted.com` 을 등록업체 DNS 에 추가
   - 인증서 자동 발급까지 보통 15분, 최대 24시간
9. **Vercel** — 프로젝트 연결 → Production Branch `dev` → 환경변수 → 커스텀 도메인
   `admin.pius.co.kr` (`CNAME admin → cname.vercel-dns.com`)
10. 브라우저로 확인 — `siochoi` / `0000` 로그인 → 인사 목록 20명 → 첨부 업로드/다운로드

### Phase 2 — GitHub 에서 당겨오도록 전환

11. Cloud Run 콘솔 → 서비스 → **지속적 배포 설정**
    → GitHub 앱을 `PIUS-org` 에 설치 → 저장소 `pius-be`
    → 브랜치 `^dev$`, 빌드 유형 **Dockerfile**, 경로 `docker/Dockerfile`
    (빌드 컨텍스트는 저장소 루트 — compose 의 `context: ..` 와 같다)
12. 트리거 생성 후 **환경변수와 도메인 매핑이 남아 있는지 확인한다.**
    지속적 배포 설정이 서비스를 다시 구성하면서 값이 빠질 수 있다
13. Vercel 은 Git 연동만으로 이미 `dev` merge 시 자동 배포된다
14. `dev` 에 커밋 하나 푸시해 양쪽 다 새 리비전이 뜨는지 확인

### DNS 레코드 정리

| 이름 | 타입 | 값 |
| --- | --- | --- |
| `api` | CNAME | `ghs.googlehosted.com` |
| `admin` | CNAME | `cname.vercel-dns.com` |
| (소유 확인) | TXT | Search Console 이 지정한 값 |

---

## 5. 비용

리뷰 트래픽 기준 **월 1 USD 미만**이다. 완전히 0 은 아니다.

| 서비스 | 무료 한도 | 판정 |
| --- | --- | --- |
| Cloud Run | 월 200만 요청 / 180k vCPU-s / 360k GiB-s | 무료 |
| Cloud Build | 월 2,500 빌드분 | 무료 (Gradle 빌드 ~5분) |
| Artifact Registry | 0.5 GB | 무료 (아래) |
| Cloud Run egress | 도쿄→한국 무료분 없음 (~$0.12/GB) | 리뷰 트래픽이면 무시 가능 |
| 도메인 매핑 | 인증서 포함 무료 | 무료 |
| Supabase | 500MB DB, 프로젝트 2개 | 무료 |
| Cloudflare R2 | 10GB, Class A 100만, egress 무제한 | 무료 |
| Vercel Hobby | 대역폭 100GB, 커스텀 도메인 포함 | 무료 (§6 ToS 주의) |

**Artifact Registry** — 이미지 레이어가 리비전 간에 공유된다. JRE 베이스 레이어(압축 ~70MB)는
한 번만 저장되고 리비전마다 새로 쌓이는 건 앱 jar 레이어(~60MB)뿐이다. 최근 3개만 남기는
정리 정책을 걸면 ~250MB 로 0.5GB 안에 들어온다. 정책이 없으면 계속 커진다.

**도쿄 리전 무료 티어** — 구글 공식 가격 문서는 무료 티어가 Tier 1 리전에 적용된다고 하고
`asia-northeast1` 은 Tier 1 이다. 다만 "미국 3개 리전만"이라고 쓴 2차 자료도 있어 자료가
어긋난다. **첫 달 청구서에서 확인한다.**

---

## 6. 실사용 전환 시 필요한 것

리뷰 환경이라 의도적으로 뺀 것들이다.

| 항목 | 내용 |
| --- | --- |
| **Supabase 일시정지** | 무료 프로젝트는 7일간 요청이 없으면 자동 정지된다. 대시보드에서 재개 버튼 한 번이면 되므로 상시 핑 장치는 만들지 않았다. 실사용 시엔 Cloud Scheduler 잡(월 3개 무료)이 `/actuator/health` 를 주기적으로 호출하면 된다 — Actuator 의 DB 인디케이터가 `SELECT 1` 을 실행한다 |
| **초기 마스터 계정** | 실사용 DB 에는 데모 데이터를 넣으면 안 되므로 부트스트랩 컴포넌트가 따로 필요하다. 리뷰 환경은 데모 시더가 그 역할을 겸한다 |
| **데모 시더 끄기** | `PIUS_SEED_ENABLED` 를 빼고 `prod` 프로필을 쓴다. `prod` 는 프로필과 프로퍼티 양쪽으로 막혀 있다 |
| **Vercel Hobby ToS** | Vercel 은 Hobby 를 비상업 용도로 한정하고 "급여를 받는 인력이 만든 프로젝트"를 상업적 사용으로 본다. 실제 운영을 시작하면 Pro(월 $20)로 올리거나 FE 도 Cloud Run 으로 옮겨야 한다 |
| **시드 비밀번호** | 데모 계정은 전부 `0000` 이고 `admin.pius.co.kr` 은 공개다. 리뷰가 끝나면 서비스를 내리거나 비밀번호를 바꾸는 편이 낫다 |
| **시크릿 관리** | 지금은 평문 환경변수라 GCP 콘솔·리비전 이력에 남는다. Viewer 권한만 있으면 읽히므로 프로젝트 IAM 을 좁게 유지한다. Secret Manager 로 옮기는 건 환경변수 참조만 바꾸면 되고 코드 변경은 없다. **`RRN_ENCRYPTION_KEY` 는 절대 바꾸지 않는다** — 바꾸는 순간 기존 암호문을 못 읽는다 |
| **콜드 스타트** | 유휴 후 첫 요청 15~25초. 실사용에선 `min-instances=1`(무료 티어 초과) 또는 CRaC/AppCDS 검토 |
| **호스트명** | 리뷰 환경이 `api` · `admin` 을 이미 쓰고 있다. 실사용 환경을 따로 띄운다면 이 환경을 승격시킬지 리뷰용을 옮길지 그때 정한다 |
