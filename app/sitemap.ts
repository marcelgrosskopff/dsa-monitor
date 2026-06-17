import type { MetadataRoute } from "next";
import { getReports } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { toISODate } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reports = await getReports();
  const staticRoutes = [
    "/",
    "/publications",
    "/resources",
    "/about",
    "/impressum",
    "/privacy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const reportRoutes = reports.map((r) => ({
    url: `${SITE_URL}/publications/${r.slug}`,
    lastModified: toISODate(r.publishedAt) || undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...reportRoutes];
}
