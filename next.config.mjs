/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  experimental: { turbopackUseSystemTlsCerts: true },
  images: { unoptimized: true },
  ...(process.env.NODE_ENV === 'development'
    ? {
        allowedDevOrigins: [
          '87b85dbf-f4c1-4ab2-8ba0-49bc5aa11340-00-ilel3wo97mdr.pike.replit.dev',
        ],
      }
    : {}),
};
export default nextConfig;
