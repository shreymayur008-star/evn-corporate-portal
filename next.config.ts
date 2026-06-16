import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Prevent Next.js from bundling these Node.js-only packages.
   * They are required at runtime from node_modules instead, which
   * keeps them out of the Edge runtime bundle entirely.
   */
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "@auth/prisma-adapter", "pg", "@prisma/adapter-pg", "mpesa-node-api"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
