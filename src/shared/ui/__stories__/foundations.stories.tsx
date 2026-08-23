import type { Meta, StoryObj } from '@storybook/nextjs';

/**
 * 토큰 카탈로그.
 *
 * 색·서체를 눈으로 확인하는 용도다. 값이 바뀌면 이 화면이 먼저 달라진다.
 */
const meta = {
  title: 'Foundations/토큰',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const RAMPS = [
  { name: 'neutral', prefix: 'bg-neutral' },
  { name: 'accent', prefix: 'bg-accent' },
  { name: 'accent-2', prefix: 'bg-accent-2' },
] as const;

const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export const 색상: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-8">
      <section>
        <h3 className="font-heading mb-3 text-xl">기본 역할</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'bg', className: 'bg-bg' },
            { label: 'surface', className: 'bg-surface' },
            { label: 'text', className: 'bg-text' },
            { label: 'accent', className: 'bg-accent' },
            { label: 'accent-2', className: 'bg-accent-2' },
            { label: 'danger', className: 'bg-danger' },
          ].map((token) => (
            <div key={token.label} className="w-28">
              <div className={`border-divider h-16 border ${token.className}`} />
              <div className="mt-1 text-xs">{token.label}</div>
            </div>
          ))}
        </div>
      </section>

      {RAMPS.map((ramp) => (
        <section key={ramp.name}>
          <h3 className="font-heading mb-3 text-xl">{ramp.name}</h3>
          <div className="flex">
            {STEPS.map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-14 ${ramp.prefix}-${step}`} />
                <div className="mt-1 text-center text-[11px]">{step}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h3 className="font-heading mb-3 text-xl">구분선 · 흐린 글자</h3>
        <div className="border-divider border p-4">
          <p className="border-divider border-b pb-2">border-divider 로 나눈 행</p>
          <p className="text-muted pt-2 text-sm">text-muted — 보조 설명에 쓴다</p>
          <p className="text-muted-weak text-sm">text-muted-weak — No 열, placeholder</p>
          <p className="text-muted-strong text-sm">text-muted-strong — 폼 라벨</p>
        </div>
      </section>
    </div>
  ),
};

export const 타이포그래피: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <div className="text-muted mb-2 text-xs">
          font-heading — Barlow Condensed + Noto Sans KR
        </div>
        <h1 className="font-heading text-[42px] leading-tight">업무관리 시스템 h1 42px</h1>
        <h2 className="font-heading text-[30px] leading-tight">인력 목록 h2 30px</h2>
        <h3 className="font-heading text-[25px] leading-tight">프로젝트 상세 h3 25px</h3>
        <h4 className="font-heading text-xl leading-tight">참여인력 h4 20px</h4>
      </div>
      <div>
        <div className="text-muted mb-2 text-xs">font-heading + uppercase — 케이스레이블</div>
        <div className="font-heading text-accent-700 text-[11px] tracking-[0.16em] uppercase">
          인사관리
        </div>
      </div>
      <div>
        <div className="text-muted mb-2 text-xs">font-body — Barlow + Noto Sans KR</div>
        <p className="max-w-lg">
          인력 · 거래처 · 프로젝트 정보를 하나의 시스템에서 관리하고, 서로 연결된 정보를 한 번에
          확인합니다. 본문 15px / line-height 1.55.
        </p>
        <p className="text-sm">테이블 본문 14px</p>
        <p className="text-[12.5px]">보조 문구 12.5px</p>
      </div>
      <div>
        <div className="text-muted mb-2 text-xs">tabular — 금액·날짜 자릿수 정렬</div>
        <div className="tabular">
          <div>212,000,000</div>
          <div>104,500,000</div>
          <div>2026-03-02</div>
        </div>
      </div>
    </div>
  ),
};

export const 엘리베이션: Story = {
  render: () => (
    <div className="flex gap-6 p-8">
      {(['sm', 'md', 'lg'] as const).map((level) => (
        <div key={level} className={`bg-neutral-100 p-6 shadow-${level}`}>
          shadow-{level}
        </div>
      ))}
      <p className="text-muted max-w-xs self-center text-[12.5px]">
        블루프린트 스타일이라 그림자는 Dialog(shadow-lg)와 Toast(shadow-md) 에만 쓴다.
      </p>
    </div>
  ),
};
