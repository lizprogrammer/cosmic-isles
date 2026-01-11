/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fix Phaser + browser-only build
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false
    };
    return config;
  },

  // Allow importing TS/JS from /src/game
  experimental: {
    esmExternals: "loose"
  },

  async redirects() {
    return [
      {
        source: '/:path((?!another-page$).*)',
        has: [{ type: 'header', key: 'x-redirect-me' }],
        permanent: false,
        destination: '/another-page',
      },
      {
        source: '/:path((?!another-page$).*)',
        missing: [{ type: 'header', key: 'x-do-not-redirect' }],
        permanent: false,
        destination: '/another-page',
      },
    ];
  },
};

module.exports = nextConfig;
