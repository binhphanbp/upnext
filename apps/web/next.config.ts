import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for better DX and catching issues early
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.upnext.app',
      },
    ],
  },

  // Experimental features for Next.js 15
  experimental: {
    // Enable React compiler (opt-in performance optimization)
    reactCompiler: true,
  },
}

export default nextConfig
