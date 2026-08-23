import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 조건부 클래스를 합치고 Tailwind 충돌을 정리한다.
 *
 * 나중에 오는 값이 이긴다 — `cn('px-4', 'px-6')` 은 `px-6` 이다.
 * 템플릿 문자열로 클래스를 이어붙이면 이 정리가 되지 않으므로 항상 이 함수를 쓴다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
