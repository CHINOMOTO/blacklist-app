import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error - NextConfig types might be incomplete
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
