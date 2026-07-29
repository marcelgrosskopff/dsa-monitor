import type { Metadata } from "next";
import type { Report } from "./types";
import { toISODate } from "./format";

export const SITE_NAME = "DSA Monitor";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dsa-monitor.at";
export const SITE_DESCRIPTION =
  "Independent Digital Services Act compliance research on very large online platforms — methodology-first, no black boxes. Published by ÖIAT.";

/** Per-route metadata builder. */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
}: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
}

export function reportMetadata(report: Report): Metadata {
  return pageMetadata({
    title: report.metaTitle || report.title,
    description: report.metaDescription || report.summary,
    path: `/publications/${report.slug}`,
  });
}

/** Schema.org Article + ResearchProject JSON-LD for a report. */
export function reportJsonLd(report: Report) {
  const url = `${SITE_URL}/publications/${report.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: report.title,
    description: report.summary,
    datePublished: toISODate(report.publishedAt),
    inLanguage: report.languages.map((l) => l.toLowerCase()),
    author: { "@type": "Organization", name: "ÖIAT" },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: report.topics.map((t) => ({ "@type": "Thing", name: t.label })),
    isPartOf: {
      "@type": "ResearchProject",
      name: report.attribution?.projectName || "DSA Monitor",
      funder: (() => {
        const funders = (report.attribution?.fundedBy ?? [])
          .filter((f) => f?.name)
          .map((f) => ({ "@type": "Organization", name: f.name }));
        return funders.length ? funders : undefined;
      })(),
    },
    mainEntityOfPage: url,
  };
}
