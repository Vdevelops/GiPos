import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1';
    
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}${apiBasePath}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);