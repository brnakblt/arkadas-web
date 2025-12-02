/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    // domains: ["localhost", "127.0.0.1"], // Deprecated
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^http:\/\/127\.0\.0\.1:1337\/api\/.*$/,
        handler: 'NetworkOnly',
        options: {
          backgroundSync: {
            name: 'api-queue',
            options: {
              maxRetentionTime: 24 * 60,
            },
          },
        },
      },
      {
        urlPattern: /^http:\/\/127\.0\.0\.1:1337\/uploads\/.*$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'strapi-images',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
    ],
  },
});

export default withPWA(nextConfig);

