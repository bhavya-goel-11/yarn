import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Suppress hydration warnings from VS Code dev tools
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Fix for cheerio and jsdom compatibility
  serverExternalPackages: ['cheerio', 'jsdom'],
};

export default nextConfig;
