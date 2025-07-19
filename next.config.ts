import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    IYZICO_API_KEY: process.env.IYZICO_API_KEY,
    IYZICO_SECRET_KEY: process.env.IYZICO_SECRET_KEY,
    IYZICO_BASE_URL: process.env.IYZICO_BASE_URL,
  },
  experimental: {
    serverComponentsExternalPackages: ['iyzipay'],
  },
  images: {
    domains: ["/uploads", "localhost", "example.com"], // Add your allowed image domains here
  }
};

export default nextConfig;
