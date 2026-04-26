/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  experimental: { turbopackUseSystemTlsCerts: true },
  images: { unoptimized: true },
};
export default nextConfig;
