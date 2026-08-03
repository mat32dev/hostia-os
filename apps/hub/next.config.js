/** @type {import('next').NextConfig} */

// Server-side proxy targets. The browser always talks to same-origin
// /api/{pos,guard,chat}/* routes and Next.js forwards them to the backing
// services. This avoids CORS issues and keeps service URLs out of the client.
const POS_API =
  process.env.POS_API_URL || process.env.NEXT_PUBLIC_POS_API || 'http://localhost:8001';
const GUARD_API =
  process.env.GUARD_API_URL || process.env.NEXT_PUBLIC_GUARD_API || 'http://localhost:8002';
const CHAT_API =
  process.env.CHAT_API_URL || process.env.NEXT_PUBLIC_CHAT_API || 'http://localhost:3001';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/api/pos/:path*', destination: `${POS_API}/:path*` },
      { source: '/api/guard/:path*', destination: `${GUARD_API}/:path*` },
      { source: '/api/chat/:path*', destination: `${CHAT_API}/:path*` },
    ];
  },
};

module.exports = nextConfig;
