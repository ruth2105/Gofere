import type { NextConfig } from "next";

const apiProxyTarget = (
  process.env.API_PROXY_TARGET
  || process.env.NEXT_PUBLIC_API_URL
  || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [{
      source: "/api/v1/:path*",
      destination: `${apiProxyTarget}/:path*`,
    }];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Suppress hydration warnings caused by browser extensions
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
