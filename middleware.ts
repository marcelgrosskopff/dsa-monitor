import { NextResponse, type NextRequest } from "next/server";

// Set Netlify-Cache-Tag response headers per path so the edge-cache purge in
// /api/revalidate actually finds entries to purge. netlify.toml [[headers]] and
// next.config.ts headers() both failed to propagate for prerendered pages served
// by @netlify/plugin-nextjs — middleware is the pipeline hook that works.
//
// Tag values are comma-separated (Netlify convention). Over-tagging on hubs is
// intentional — the home page and publications hub show content from multiple
// document types, so any relevant publish should invalidate them.
const PATH_TAGS: Array<{ match: (p: string) => boolean; value: string }> = [
  { match: (p) => p === "/", value: "settings,report,topic" },
  { match: (p) => p === "/about", value: "settings" },
  { match: (p) => p === "/impressum", value: "settings" },
  { match: (p) => p === "/privacy", value: "settings" },
  { match: (p) => p === "/resources", value: "resource,settings" },
  { match: (p) => p === "/publications", value: "settings,report,topic" },
  { match: (p) => p.startsWith("/publications/"), value: "report,settings,topic" },
];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const rule = PATH_TAGS.find((r) => r.match(path));
  if (rule) {
    res.headers.set("Netlify-Cache-Tag", rule.value);
  }
  return res;
}

// Skip middleware for API routes, static assets, Studio, and Next internals.
export const config = {
  matcher: [
    "/((?!api|studio|_next|favicon|robots\\.txt|sitemap\\.xml|og-image\\.png).*)",
  ],
};
