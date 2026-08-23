# 개발 컨벤션 — pius-fe

## 1. 브랜치 전략

| 브랜치 | 용도 |
| --- | --- |
| `main` | 릴리스. `dev` 에서만 병합한다. |
| `dev` | **기본 브랜치.** 모든 작업 브랜치의 base. |
| `feat/#N-slug` | 기능 개발 |
| `fix/#N-slug` | 버그 수정 |
| `chore/#N-slug` | 설정 · 빌드 · 의존성 |
| `docs/#N-slug` | 문서 |

`N` 은 GitHub 이슈 번호, `slug` 는 영문 소문자 케밥케이스.

```bash
git switch dev && git pull
git switch -c feat/#7-hr-screens
```

**작업은 반드시 이슈 등록 → 브랜치 생성 → 구현 → PR 순서로 진행한다.**

---

## 2. 커밋 메시지

```
<type>: <제목> (#이슈번호)
```

| type | 사용 시점 |
| --- | --- |
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `chore` | 빌드 · 설정 · 의존성 |
| `docs` | 문서 |
| `style` | 스타일만 변경 (로직 무관) |
| `refactor` | 동작 변경 없는 구조 개선 |
| `test` | 테스트 |

제목은 한글, 명사형으로 끝내고 마침표를 붙이지 않는다.

```
feat: 인력 목록 검색 및 페이지네이션 구현 (#7)
style: 프로젝트 목록 계약기간 초과 표시 색상 조정 (#9)
```

---

## 3. Pull Request

- **base 는 항상 `dev`.**
- 본문에 `Closes #N` 을 넣어 이슈를 연결한다.
- UI 변경 PR 에는 **스크린샷 또는 Storybook 캡처**를 첨부한다.
- 병합은 **Squash and merge**. 병합 후 작업 브랜치는 삭제한다.

---

## 4. TypeScript

- `strict: true`. `any` 금지 — 불가피하면 `unknown` 으로 받고 좁힌다.
- 서버 응답 타입은 `entities/*/types.ts` 에 한 번만 정의하고 재사용한다.
- Props 는 `type` 으로 선언하고 컴포넌트 파일 상단에 둔다.
- `enum` 대신 union literal 을 쓴다.

```ts
export type EmploymentType = 'EMPLOYEE' | 'CONTRACTOR';
```

- 상수 객체는 `as const` 를 붙인다.

---

## 5. 컴포넌트

- 함수 선언형 `export function Xxx()` 를 쓴다. `React.FC` 는 쓰지 않는다.
- 한 파일에 컴포넌트 하나. 100줄을 넘기면 분리를 검토한다.
- 페이지(`app/**/page.tsx`)는 조립만 하고 로직은 `features` 로 내린다.
- 조건부 클래스는 `cn()` 으로 합친다. 템플릿 문자열 연결 금지.
- `key` 로 배열 인덱스를 쓰지 않는다. 서버 ID 를 쓴다.

```tsx
type Props = {
  status: ProjectStatus;
  overdue: boolean;
};

export function ProjectStatusTag({ status, overdue }: Props) {
  return <Tag tone={toneOf(status)}>{labelOf(status)}</Tag>;
}
```

---

## 6. 스타일

- **Tailwind 유틸만 사용한다.** 인라인 `style` 과 CSS Modules 는 쓰지 않는다.
  (예외: 서버에서 내려온 동적 수치를 그대로 반영해야 하는 경우)
- 색상 · 간격 · 폰트는 **반드시 토큰**을 거친다. `#5980a6` 같은 리터럴 금지.
- 재사용되는 조합은 유틸을 나열하지 말고 `shared/ui` 컴포넌트로 만든다.
- 클래스 순서는 Prettier 플러그인(`prettier-plugin-tailwindcss`)이 정렬한다.

---

## 7. 데이터 페칭

- 조회는 `useQuery`, 변경은 `useMutation`. 컴포넌트에서 `axios` 를 직접 호출하지 않는다.
- queryKey 는 배열 리터럴을 흩뿌리지 말고 `features/*/api` 에 팩토리로 모은다.

```ts
export const personKeys = {
  all: ['persons'] as const,
  list: (params: PersonListParams) => [...personKeys.all, 'list', params] as const,
  detail: (id: number) => [...personKeys.all, 'detail', id] as const,
};
```

- 변경 성공 시 관련 queryKey 를 무효화하고, 사용자에게 Toast 로 알린다.
- 로딩 · 에러 · 빈 상태를 항상 함께 처리한다. 빈 목록은 `EmptyState` 를 쓴다.

---

## 8. 폼

- 제어 컴포넌트로 다루고, 검증은 제출 시점 + blur 시점에 표시한다.
- 자동 포맷(전화번호 하이픈 · 금액 콤마)은 **입력 중에는 하지 않고 blur 또는 제출 시** 적용한다.
  입력 중 캐럿이 튀는 문제를 피하기 위함이다.
- 서버 검증 실패(`fields`)는 해당 인풋 아래에 그대로 매핑해 표시한다.

---

## 9. 권한 처리

- 권한 판정 로직은 `entities/account/role.ts` 한 곳에만 둔다.

```ts
export const canManageHr = (role: Role) => role !== 'CONTRACTOR';
export const canCreateProject = (role: Role) => role !== 'CONTRACTOR';
```

- 화면에서는 `if (role === 'CONTRACTOR')` 같은 비교를 직접 쓰지 않는다.
- **프론트엔드 가드는 UX 용이다.** 실제 차단은 서버가 하며, `403` 응답을 항상 처리한다.
- 금액 마스킹은 서버가 `null` + `*Masked: true` 로 내려주므로, 화면은 그 플래그만 보고 `비공개` 를 그린다.
  프론트엔드에서 값을 받아 가리는 방식은 금지.

---

## 10. 접근성

- 인터랙티브 요소는 `button` / `a` 로 만든다. `div onClick` 금지.
  (테이블 행 클릭은 `role="button"` + `tabIndex` + 키보드 핸들러를 함께 둔다)
- 모든 인풋에 `label` 을 연결한다.
- 다이얼로그는 Radix 를 써서 포커스 트랩 · `Esc` 닫기를 보장한다.
- 포커스 링을 제거하지 않는다. `:focus-visible` 스타일을 유지한다.

---

## 11. 코드 품질

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run build         # 프로덕션 빌드
```

PR 전에 위 3개를 통과시킨다.
`console.log` 는 커밋하지 않는다.
