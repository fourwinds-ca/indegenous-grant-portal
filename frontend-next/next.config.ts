import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  outputFileTracingIncludes: {
    '/api/training/[file]': ['./data/training/**/*'],
  },
};

export default nextConfig;
