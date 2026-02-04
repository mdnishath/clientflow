import type { NextConfig } from "next";

const nextConfig: NextConfig = {


  /* config options here */

  experimental: {
    serverActions: {
      allowedOrigins: ['client-flow.xyz', 'www.client-flow.xyz'],
    },
  },


};

export default nextConfig;
