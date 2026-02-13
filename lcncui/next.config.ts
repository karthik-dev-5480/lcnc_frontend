import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // When you call /api/pages on the frontend...
        source: '/api/:path*',
        // ...it actually fetches from Spring Boot
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;