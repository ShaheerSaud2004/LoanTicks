import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['xlsx'],
  images: {
    remotePatterns: [],
  },
  // Expose NEXTAUTH_URL to the client so next-auth (SessionProvider, signIn, etc.)
  // uses the correct base URL instead of localhost. Without this, visiting the base
  // URL can trigger auth errors because the client calls the wrong origin.
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
