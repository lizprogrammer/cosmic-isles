/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
    };
    return config;
  },

  experimental: {
    esmExternals: "loose",
  },

  async redirects() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination:
          "https://api.farcaster.xyz/miniapps/hosted-manifest/019baa46-22b9-d5c5-be37-a3f72b063671",
        permanent: false, // 307
      },
    ];
  },
};

module.exports = nextConfig;
