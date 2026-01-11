/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false
    };
    return config;
  },

  experimental: {
    esmExternals: "loose"
  }
};

module.exports = nextConfig;
