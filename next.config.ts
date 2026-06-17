import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise confuses Turbopack.
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [
      // Sanity CDN — report/partner assets served from the dataset.
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
