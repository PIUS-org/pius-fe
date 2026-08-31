import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 상위 디렉터리의 다른 프로젝트 설정(pnpm-workspace.yaml 등)을 프로젝트 루트로
  // 오인하지 않도록 명시한다. 지정하지 않으면 기동 시마다 경고가 뜬다.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
