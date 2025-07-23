import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  swcMinify: false, // disable SWC minification for better compatibility with older browsers
  experimental: {
    legacyBrowsers: true
  }
};

export default nextConfig;
