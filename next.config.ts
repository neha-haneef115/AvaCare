import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverExternalPackages: ['mongodb']
  }
};

export default nextConfig;