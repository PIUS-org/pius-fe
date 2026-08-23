/**
 * 표시용 포맷터.
 *
 * 화면에서 정규식을 직접 쓰지 않는다. 같은 규칙이 여러 곳에 흩어지면
 * 한쪽만 고쳐져 표기가 어긋난다.
 *
 * 서버는 금액을 `number`, 날짜를 `YYYY-MM-DD` 로 내려준다.
 * 문자열 변환은 화면에 그릴 때만 한다.
 */

const digitsOf = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * 전화번호에 하이픈을 넣는다.
 *
 * 서버가 이미 정규화해서 내려주지만, 입력 중인 값을 그릴 때도 쓴다.
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const d = digitsOf(value);

  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) {
    return d.startsWith('02')
      ? `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`
      : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return d;
}

/** 사업자등록번호 — `000-00-00000`. */
export function formatBizRegNo(value: string | null | undefined): string {
  if (!value) return '';
  const d = digitsOf(value);
  if (d.length !== 10) return d;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

/**
 * 금액에 세 자리 콤마를 넣는다.
 *
 * `null` 은 값이 없는 경우와 가려진 경우 모두에 쓰이므로, 무엇을 보여줄지는
 * 호출하는 쪽이 `placeholder` 로 정한다.
 */
export function formatMoney(value: number | string | null | undefined, placeholder = ''): string {
  if (value === null || value === undefined || value === '') return placeholder;
  const d = digitsOf(String(value));
  if (!d) return placeholder;
  return Number(d).toLocaleString('en-US');
}

/** 입력 중인 금액 문자열을 콤마 붙은 형태로. 빈 값은 빈 문자열. */
export function formatMoneyInput(value: string): string {
  const d = digitsOf(value);
  return d ? Number(d).toLocaleString('en-US') : '';
}

/** 콤마가 붙은 문자열에서 숫자만 뽑는다. 서버로 보낼 때 쓴다. */
export function parseMoney(value: string): number | null {
  const d = digitsOf(value);
  return d ? Number(d) : null;
}

/** 서버가 주는 `YYYY-MM-DD` 를 그대로 쓴다. 값이 없으면 대체 문자열. */
export function formatDate(value: string | null | undefined, placeholder = '-'): string {
  return value ? value : placeholder;
}

/** 계약기간 등 `시작 ~ 종료` 표기. */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!start && !end) return '-';
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

/**
 * 주민등록번호 마스킹.
 *
 * 서버가 이미 마스킹해서 내려주므로 보정용이다. 원본이 화면에 올 일은 없다.
 */
export function maskRrn(value: string | null | undefined): string {
  if (!value) return '';
  if (value.includes('*')) return value;
  const d = digitsOf(value);
  if (d.length !== 13) return '******-*******';
  return `${d.slice(0, 4)}**-*******`;
}
