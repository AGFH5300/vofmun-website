/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: false },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        allowedDevOrigins: [
          '87b85dbf-f4c1-4ab2-8ba0-49bc5aa11340-00-ilel3wo97mdr.pike.replit.dev',
        ],
      }
    : {}),
};
export default nextConfig;
