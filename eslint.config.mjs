import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * eslint-config-next 16 은 flat config 를 그대로 내보낸다.
 * FlatCompat 으로 감싸면 스키마 검증에서 실패하므로 직접 펼친다.
 */
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'storybook-static/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      // any 는 쓰지 않는다. 불가피하면 unknown 으로 받고 좁힌다.
      '@typescript-eslint/no-explicit-any': 'error',
      // _ 로 시작하는 이름은 의도적으로 쓰지 않는 값이다.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // 디버깅 흔적을 커밋하지 않는다.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

export default eslintConfig;
