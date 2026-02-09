import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  experimental: {
    serverActions: {
      allowedOrigins: ['client-flow.xyz', 'www.client-flow.xyz'],
      bodySizeLimit: '10mb', // Allow larger file uploads for Excel imports
    },
  },
};

export default nextConfig;
