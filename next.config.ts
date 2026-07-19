import type { NextConfig } from 'next';

const API_PROXY = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Compile the shared workspace package from source.
  transpilePackages: ['@ledgr/shared'],
  async rewrites() {
    // In dev (and single-domain deploys) proxy /api to the Express server so
    // the browser sees same-origin requests — httpOnly cookies just work.
    return [
      {
        source: '/api/:path*',
        destination: `${API_PROXY}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
