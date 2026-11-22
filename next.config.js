
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: "/robots.txt",
        destination: "/api/robots.txt",
      },
    ];
  },
};

module.exports = nextConfig;
