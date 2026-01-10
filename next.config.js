/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // We don’t want Next.js to try to SSR Phaser or your game code.
  // Everything in /public is served as static files.
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false
    };

    return config;
  },

  // Allow importing TS/JS from /src/game even though it runs client‑side only.
  experimental: {
    esmExternals: "loose"
  }
};

module.exports = nextConfig;
