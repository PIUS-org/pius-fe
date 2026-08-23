import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

/*
 * 목업의 타이포그래피를 그대로 옮긴다.
 * 제목은 Barlow Condensed, 본문은 Barlow 이며 한글은 Noto Sans KR 로 떨어진다.
 * CSS 변수로 노출해 #3 의 @theme 에서 토큰으로 연결한다.
 */
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-barlow',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PiUS 업무관리 시스템',
  description: '인력 · 거래처 · 프로젝트 정보를 하나의 시스템에서 관리합니다.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${barlow.variable} ${barlowCondensed.variable} ${notoSansKr.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
