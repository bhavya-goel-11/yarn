/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: false
  },
  transpilePackages: ['@yarn/shared']
};

export default nextConfig;
