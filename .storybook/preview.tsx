import type { Preview } from '@storybook/nextjs';
import '../src/app/globals.css';
import './storybook-fonts.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      options: {
        // 시스템의 기본 배경. 흰 바탕에서는 hairline 테두리가 실제와 다르게 보인다.
        bg: { name: '페이지 배경', value: '#f2f2f3' },
        dark: { name: '사이드바', value: '#1d2d3d' },
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'bg' } },
};

export default preview;
