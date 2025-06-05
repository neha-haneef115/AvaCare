import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    serverComponentsExternalPackages: ['mongodb']
  }
};

export default nextConfig;