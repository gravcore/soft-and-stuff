import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import fs from 'node:fs';
import path from 'node:path';

const withNextIntl = createNextIntlPlugin(); // default ./src/i18n/request.ts

// Dynamic list of languages
const locales = fs
  .readdirSync(path.join(process.cwd(), 'src', 'core', 'i18n', 'locales'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''))
  .sort();

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_LOCALES: locales.join(',') },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);