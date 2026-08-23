# 디자인 시스템 — pius-fe

Claude Design 프로젝트의 `_ds/industry-4d5defde-2185-4be7-9438-22d82d484223/styles.css` 를
Tailwind CSS v4 `@theme` 으로 이식한 결과를 정의한다.

---

## 1. 디자인 성격

**블루프린트(설계도) 스타일** — 컴포넌트를 도면 위의 와이어프레임 객체로 다룬다.

| 원칙 | 규칙 |
| --- | --- |
| 모서리 | `border-radius: 0`. Button · Input · Card · Tag · Dialog 전부 각지게. |
| 면 | 카드·다이얼로그 배경은 `--color-neutral-100` 또는 투명 + hairline 보더. 그림자 남용 금지. |
| 선 | 모든 구분선은 `--color-divider` (텍스트색 16% 혼합) 1px. |
| 밀도 | 관리 도구답게 조밀하게. 본문 15px / 1.55, 테이블 14px. |
| 강조 | 색이 아니라 **대비와 위치**로 강조한다. 액센트는 상태 · 링크 · 주요 액션에만. |

> 앱 최소 폭은 `1320px` 이다 (사이드바 230px + 콘텐츠). 모바일 대응은 v1.0 범위 외.

---

## 2. 색상 토큰

### 2-1. 기본 역할

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-bg` | `#f2f2f3` | 페이지 배경 |
| `--color-surface` | `#e9e9ea` | 인풋 배경 |
| `--color-text` | `#1d1f20` | 본문 |
| `--color-accent` | `#5980a6` | 주요 액션 · 링크 · 활성 상태 |
| `--color-accent-2` | `#728fab` | 보조 액센트 |
| `--color-divider` | `color-mix(in srgb, #1d1f20 16%, transparent)` | 구분선 · 보더 |

### 2-2. 톤 램프

OKLCH 단일 명도 스케일에서 생성되어, 같은 단계는 역할이 달라도 시각적 명도가 일치한다.

| 단계 | neutral | accent | accent-2 |
| --- | --- | --- | --- |
| 100 | `#f5f5f8` | `#eef6ff` | `#eef6ff` |
| 200 | `#e7e7ea` | `#d6ebff` | `#d6ebff` |
| 300 | `#d4d4d7` | `#b5d9fd` | `#bdd8f2` |
| 400 | `#b7b7ba` | `#94bce3` | `#9ebbd8` |
| 500 | `#98989b` | `#749dc4` | `#7e9cb8` |
| 600 | `#7a7a7d` | `#597ea3` | `#627d98` |
| 700 | `#5d5d60` | `#416180` | `#486077` |
| 800 | `#424244` | `#2c455d` | `#314457` |
| 900 | `#2b2b2d` | `#1d2d3d` | `#1f2d3a` |

**주요 사용처**

| 위치 | 토큰 |
| --- | --- |
| 사이드바 · 로그인 좌측 패널 배경 | `accent-900` |
| 카드 배경 | `neutral-100` |
| 안내 패널 배경 | `accent-100` |
| 섹션 케이스레이블 | `accent-700` |
| 사이드바 활성 메뉴 좌측 보더 | `accent-300` |
| 태그(진행) 배경/글자 | `accent-100` / `accent-800` |
| 태그(완료) 배경/글자 | `neutral-100` / `neutral-800` |

---

## 3. 타이포그래피

| 역할 | 폰트 | 비고 |
| --- | --- | --- |
| 제목 (`h1`~`h6`) | `Barlow Condensed` 600 | 한글 폴백 `Noto Sans KR` |
| 본문 | `Barlow` 400/500/700 | 한글 폴백 `Noto Sans KR` |

```css
--font-heading: "Barlow Condensed", "Noto Sans KR", system-ui, sans-serif;
--font-body:    "Barlow", "Noto Sans KR", system-ui, sans-serif;
```

| 요소 | 크기 | 비고 |
| --- | --- | --- |
| `h1` | 42px | 로그인 좌측 패널은 56px |
| `h2` | 32px | 페이지 제목은 30px 로 사용 |
| `h3` | 25px | |
| `h4` | 20px | |
| `h5` | 16px | |
| `h6` | 13px | `uppercase`, `letter-spacing: 0.08em` |
| body | 15px / 1.55 | |
| table | 14px | `th` 는 11px uppercase |
| caption · 보조문구 | 11.5~12.5px | |

**케이스레이블** — 섹션 상단의 대문자 라벨. `11px` / `letter-spacing: .14~.16em` / `uppercase` / `accent-700`.

**숫자 정렬** — 금액 · 날짜 셀에는 `font-variant-numeric: tabular-nums` 를 적용한다.

---

## 4. 스페이싱 · 반경 · 엘리베이션

```css
--space-1: 3.4px;   --space-2: 6.8px;   --space-3: 10.2px;
--space-4: 13.6px;  --space-6: 20.4px;  --space-8: 27.2px;

--radius-sm: 2px;   --radius-md: 4px;   --radius-lg: 7px;   /* 실제 컴포넌트는 0 을 사용 */

--shadow-sm: 0 1px 2px  color-mix(in srgb, #2b2b2d 14%, transparent);
--shadow-md: 0 3px 10px color-mix(in srgb, #2b2b2d 16%, transparent);
--shadow-lg: 0 12px 32px color-mix(in srgb, #2b2b2d 22%, transparent);
```

반경 토큰은 시스템 원본과의 대응을 위해 유지하되, **v1.0 컴포넌트는 전부 `0`** 을 사용한다.
엘리베이션은 Dialog(`shadow-lg`) 외에는 쓰지 않는다.

---

## 5. 컴포넌트 목록

`src/shared/ui/` 에 구현하며, 각 컴포넌트는 `*.stories.tsx` 를 함께 둔다.

| 컴포넌트 | variant / props | 비고 |
| --- | --- | --- |
| `Button` | `primary` · `secondary` · `ghost` / `size` / `iconOnly` · `block` | 폰트는 `font-heading` |
| `Input` | `type`, `invalid`, `readOnly` | 배경 `surface`, 높이 36px |
| `Textarea` | `rows` | 최소 90px, 세로 리사이즈만 |
| `Select` | `options` | 접근성 필요 시 Radix Select |
| `Radio` / `RadioGroup` | — | 커스텀 `dot` 마커 |
| `Segmented` | `options`, `value` | 목록 필터 칩 (전체/재직/퇴사 등) |
| `Field` | `label`, `hint`, `error`, `required` | 라벨 12px / `text 70%` |
| `Card` | `kicker`, `title`, `meta` | hairline 보더 |
| `Panel` | `tone: default \| accent` | 안내 패널 (`accent-100`) |
| `Tag` | `accent` · `accent-2` · `neutral` · `outline` | 상태 표시 |
| `Table` | `columns`, `rows`, `onRowClick` | `th` uppercase, hover 배경 |
| `Tabs` | `items`, `value` | 하단 2px accent 보더 |
| `Pagination` | `page`, `totalPages` | `‹` 숫자 `›` |
| `Dialog` | Radix Dialog 기반 | backdrop `neutral-900 50%` |
| `Toast` | `message` | 우측 하단 고정, 2.2초 |
| `FileUpload` | `accept`, `files` | 파일 목록 + dashed 드롭존 |
| `EmptyState` | `title`, `description` | 목록 0건 |
| `DetailRow` | `label`, `children` | 상세 화면의 `라벨 : 값` 행 |
| `PageHeader` | `kicker`, `title`, `actions` | 목록 화면 상단 |

### 구현 규칙

- variant 는 [CVA](https://cva.style) 로 정의하고, `className` 병합은 `cn()` (clsx + tailwind-merge) 을 쓴다.
- 모든 컴포넌트는 `React.forwardRef` 로 ref 를 전달한다.
- 네이티브 요소의 props 를 확장한다 (`ButtonHTMLAttributes` 등). 임의 prop 을 새로 만들지 않는다.
- **인라인 스타일 금지.** 목업의 인라인 스타일은 전부 토큰 기반 Tailwind 유틸로 옮긴다.
- 포커스는 `:focus-visible` 에만 표시한다 — `outline: 2px solid var(--color-accent); outline-offset: 2px`.

---

## 6. 포맷터

`src/shared/lib/format.ts` 에 두고 화면에서 직접 정규식을 쓰지 않는다.

| 함수 | 동작 |
| --- | --- |
| `formatPhone(v)` | 숫자만 남기고 11자리 `000-0000-0000`, 10자리 `000-000-0000` |
| `formatBizRegNo(v)` | 숫자 10자리 → `000-00-00000` |
| `formatMoney(v)` | 숫자만 남기고 세 자리 콤마. 빈 값은 `''` |
| `formatDate(v)` | `YYYY-MM-DD` |
| `maskRrn(v)` | `9601**-*******` — 서버가 이미 마스킹해 내려주므로 표시 보정용 |

금액은 서버에서 `number` 로 내려오고, 화면 표시 시점에만 문자열로 포맷한다.

---

## 7. 상태 → 태그 매핑

`src/entities/` 의 도메인 로직에서 계산하고, 화면은 결과만 받아 쓴다.

| 서버 값 | 표시 | 태그 |
| --- | --- | --- |
| `ACTIVE` (인력) | 재직 | `accent` |
| `RESIGNED` (인력) | 퇴사 | `neutral` |
| `PLANNED` | 예정 | `outline` |
| `IN_PROGRESS` | 진행중 | `accent` |
| `COMPLETED` | 완료 | `neutral` |
| `ONGOING` (거래처) | 진행 | `accent` |
| `POTENTIAL` (거래처) | 잠재 | `outline` |
| `DONE` (거래처) | 진행완료 | `neutral` |

`overdue: true` 인 프로젝트는 태그를 바꾸지 않고 **계약기간 텍스트만 빨간색**으로 표시한다.

---

## 8. Storybook

```bash
npm run storybook     # http://localhost:6006
```

- `@storybook/nextjs` 프레임워크, `src/styles/theme.css` 를 preview 에 전역 주입한다.
- 스토리 그룹: `Foundations/*` (Color · Typography · Spacing), `Components/*`.
- 각 컴포넌트는 최소한 **모든 variant 를 한 화면에 나열한 스토리** 하나를 갖는다.
- 컴포넌트를 추가하거나 variant 를 바꾸면 스토리도 같은 PR 에서 갱신한다.

---

## 9. 원본 대비 변경점

| 항목 | 원본 (`styles.css`) | pius-fe |
| --- | --- | --- |
| 한글 | 미지정 | `Noto Sans KR` 폴백 추가 |
| 반경 | 토큰은 2/4/7px, 컴포넌트는 0 으로 덮어씀 | 토큰 유지, 컴포넌트는 0 확정 |
| `.blueprint` · `.duotone` · `.halftone` | 목업 장식 클래스 | **미이식** (제품 화면에서 사용하지 않음) |
| 인라인 스타일 | 목업 전반에 사용 | 전부 컴포넌트 · 유틸로 대체 |
