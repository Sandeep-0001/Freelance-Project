import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bing.com',
      },
      {
        protocol: 'https',
        hostname: 'bing.com',
      }
    ]
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backend) return [];

    const normalized = backend.endsWith("/") ? backend.slice(0, -1) : backend;

    return [
      {
        source: "/api/:path*",
        destination: `${normalized}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${normalized}/health`,
      },
    ];
  },
};

export default nextConfig;
