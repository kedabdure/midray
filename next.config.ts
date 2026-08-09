import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features
  experimental: {
    // Increase body size limit for Server Actions (file uploads)
    serverActions: {
      bodySizeLimit: '50mb', // Allow up to 50MB for X-ray image uploads
    },
  },

  // Allow images from ImageKit CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/dewaclinic/**',
      },
    ],
  },
};

export default nextConfig;
