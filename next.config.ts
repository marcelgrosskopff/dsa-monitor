import type { NextConfig } from "next";

// Netlify-Cache-Tag headers so the edge cache indexes each page by the Sanity
// document tags that affect it. The Sanity webhook (/api/revalidate) purges by
// these tag names — without these headers, purge silently no-ops. Multiple tags
// per page are comma-separated per Netlify's cache-tag convention. Over-tagging
// is fine: any relevant publish invalidates the page.
const cacheTagHeader = (value: string) => ({
  key: "Netlify-Cache-Tag",
  value,
});

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise confuses Turbopack.
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [
      // Sanity CDN — report/partner assets served from the dataset.
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  async headers() {
    return [
      { source: "/", headers: [cacheTagHeader("settings,report,topic")] },
      { source: "/about", headers: [cacheTagHeader("settings")] },
      { source: "/impressum", headers: [cacheTagHeader("settings")] },
      { source: "/privacy", headers: [cacheTagHeader("settings")] },
      { source: "/resources", headers: [cacheTagHeader("resource,settings")] },
      { source: "/publications", headers: [cacheTagHeader("settings,report,topic")] },
      { source: "/publications/:slug", headers: [cacheTagHeader("report,settings,topic")] },
    ];
  },
};

export default nextConfig;
