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

### 스페이싱 — 원본 스케일을 옮기지 않았다

원본 시스템은 `3.4 / 6.8 / 10.2 / 13.6 / 20.4 / 27.2px` 스케일을 정의하지만 **이식하지 않았다.**

1. 목업 마크업 자체가 이 토큰을 쓰지 않는다. `padding: 20px 24px`, `gap: 16px` 처럼
   평범한 4px 배수를 인라인으로 쓰고 있어 Tailwind 기본 스케일(`p-5` = 20px, `gap-4` = 16px)이
   오히려 더 정확히 맞는다.
2. Tailwind v4 에서 `--spacing-1: 3.4px` 를 선언하면 `p-1` 이 4px 가 아니게 된다.
   읽는 사람이 매번 실제 값을 확인해야 한다.

스케일에 없는 값(22px 등)은 `p-[22px]` 로 쓴다.

### 반경 — 전부 0

블루프린트 스타일이므로 반경 토큰을 두지 않고 `theme.css` 의 base 레이어에서
모든 요소에 `border-radius: 0` 을 적용한다. 컴포넌트마다 `rounded-none` 을 붙이지 않는다.

### 엘리베이션

```css
--shadow-sm: 0 1px 2px  color-mix(in srgb, #2b2b2d 14%, transparent);
--shadow-md: 0 3px 10px color-mix(in srgb, #2b2b2d 16%, transparent);
--shadow-lg: 0 12px 32px color-mix(in srgb, #2b2b2d 22%, transparent);
```

Dialog(`shadow-lg`)와 Toast(`shadow-md`) 외에는 쓰지 않는다.

### 추가한 토큰

원본에 없지만 목업이 반복해서 쓰는 값을 이름으로 고정했다.

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-muted` | 텍스트 55% | 보조 설명 |
| `--color-muted-strong` | 텍스트 70% | 폼 라벨 |
| `--color-muted-weak` | 텍스트 45% | No 열, placeholder |
| `--color-danger` | `#c0392b` | **계약기간 초과 표시 전용.** 시스템의 유일한 경고색 |
| `.tabular` | `font-variant-numeric: tabular-nums` | 금액 · 날짜 자릿수 정렬 |

---

## 5. 컴포넌트 목록

`src/shared/ui/` 에 구현하며, 각 컴포넌트는 `*.stories.tsx` 를 함께 둔다.

`src/shared/ui/` 에 19개가 있다. 전부 `index.ts` 에서 내보낸다.

| 파일 | 컴포넌트 | 비고 |
| --- | --- | --- |
| `button.tsx` | `Button` | `primary` · `secondary` · `ghost` · **`inverse`**(사이드바용) / `sm` `md` `lg` `icon` / `block` |
| `input.tsx` | `Input` | 배경 `surface`, 최소 높이 36px. `inputClassName` 을 다른 입력에서 재사용 |
| `textarea.tsx` | `Textarea` | 최소 90px, 세로 리사이즈만 |
| `select.tsx` | `Select` | 네이티브 select + 토큰 색 화살표 |
| `field.tsx` | `Field` | **render prop** 으로 `id` 를 넘겨 label 연결을 강제 |
| `radio.tsx` | `RadioGroup` | Radix RadioGroup + 커스텀 dot |
| `segmented.tsx` | `Segmented` | 목록 필터 칩 |
| `tag.tsx` | `Tag` | `accent` · `accent-2` · `neutral` · `outline` |
| `card.tsx` | `Card` · `CardKicker` · `Panel` | hairline 면 / 케이스레이블 / 안내 패널 |
| `detail-row.tsx` | `DetailRow` | 상세 화면의 `라벨 : 값` 행 |
| `page-header.tsx` | `PageHeader` | 케이스레이블 + 제목 + 액션 |
| `empty-state.tsx` | `EmptyState` | 목록 0건 |
| `table.tsx` | `Table` | 컬럼 정의 기반. **행 클릭이 키보드로도 동작** |
| `tabs.tsx` | `Tabs` · `TabPanel` | Radix Tabs |
| `pagination.tsx` | `Pagination` | 현재 페이지 기준 ±2칸 |
| `dialog.tsx` | `Dialog` · `DialogClose` | Radix Dialog (포커스 트랩 · Esc) |
| `toast.tsx` | `ToastProvider` · `useToast` | 우측 하단 2.2초, `aria-live` |
| `file-upload.tsx` | `FileUpload` | 파일 목록 + dashed 업로드 영역, `readOnly` 지원 |

### 목업보다 개선한 점

목업은 정적 HTML 이라 접근성이 빠져 있다. 컴포넌트로 옮기면서 채웠다.

- **테이블 행** — 목업은 `tr onClick` 만 있어 키보드로 상세에 갈 수 없다.
  `role="button"` + `tabIndex` + Enter/Space 처리를 넣었다.
- **다이얼로그** — 목업은 배경 `div` 뿐이라 Esc 로 닫히지 않고 포커스가 뒤로 샌다. Radix 로 대체.
- **폼 라벨** — `Field` 가 `id` 를 만들어 넘기므로 label 연결을 잊을 수 없다.
- **토스트** — `aria-live="polite"` 로 스크린리더에도 읽힌다.

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

- Storybook 10 + `@storybook/nextjs`. 스토리는 `src/shared/ui/__stories__/` 에 둔다.
- `preview.tsx` 가 `globals.css` 를 불러오므로 앱과 같은 토큰이 적용된다.
  배경 기본값은 **페이지 배경(`#f2f2f3`)** 이다 — 흰 바탕에서는 hairline 테두리가 실제와 다르게 보인다.
- 앱에서는 `next/font` 가 폰트 변수를 주입하지만 Storybook 은 `layout.tsx` 를 거치지 않는다.
  `storybook-fonts.css` 가 같은 서체를 웹폰트로 불러와 변수 이름을 맞춘다.
- 스토리 그룹

| 그룹 | 스토리 |
| --- | --- |
| `Foundations/토큰` | 색상 · 타이포그래피 · 엘리베이션 |
| `Components/폼` | 버튼 · 입력 · 선택 |
| `Components/표시` | 태그 · 면 · 페이지헤더 · 테이블 · 탭 · 빈상태 |
| `Components/오버레이` | 다이얼로그 · 토스트 · 파일업로드 |

- 각 스토리는 **모든 variant 를 한 화면에 나열**한다. 컴포넌트를 추가하거나 variant 를 바꾸면
  같은 PR 에서 스토리도 갱신한다.
- 스토리 이름은 한글로 쓰되 `render` 함수 이름은 영문 PascalCase 로 둔다 —
  React 의 rules-of-hooks 가 컴포넌트 이름을 대문자로 시작하는 것으로 판단하기 때문이다.

---

## 9. 원본 대비 변경점

| 항목 | 원본 (`styles.css`) | pius-fe |
| --- | --- | --- |
| 한글 | 미지정 | `Noto Sans KR` 폴백 추가 |
| 반경 | 토큰은 2/4/7px, 컴포넌트는 0 으로 덮어씀 | 토큰 유지, 컴포넌트는 0 확정 |
| `.blueprint` · `.duotone` · `.halftone` | 목업 장식 클래스 | **미이식** (제품 화면에서 사용하지 않음) |
| 인라인 스타일 | 목업 전반에 사용 | 전부 컴포넌트 · 유틸로 대체 |
