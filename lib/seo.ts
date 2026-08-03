import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import type { Report } from "./types";
import { toISODate } from "./format";

export const SITE_NAME = "DSA Monitor";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dsa-monitor.at";
export const SITE_DESCRIPTION =
  "Independent Digital Services Act compliance research on very large online platforms — methodology-first, no black boxes. Published by OIAT.";

/** The SEO override pair, as stored on a report or any page-copy singleton. */
export interface SeoOverrides {
  metaTitle?: string;
  metaDescription?: string;
}

/** In draft mode the preview client embeds invisible click-to-edit markers in
 *  every string. Metadata isn't clickable, so they'd be pure noise inside
 *  <title>/<meta> — strip them. Blank and whitespace-only values fall through
 *  to the hardcoded fallback. */
function cmsText(value?: string): string | undefined {
  return stegaClean(value)?.trim() || undefined;
}

/** Per-route metadata builder. `cms` takes the page's singleton straight from
 *  its content getter; an empty field falls back to the passed-in defaults. */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  cms,
}: {
  /** Hardcoded fallback. Omit to inherit the root layout's title.default. */
  title?: string;
  description?: string;
  /** Canonical + og:url path. `null` emits neither — used for the 404. */
  path?: string | null;
  cms?: SeoOverrides;
}): Metadata {
  const resolvedTitle = cmsText(cms?.metaTitle) ?? title;
  const resolvedDescription = cmsText(cms?.metaDescription) ?? description;
  const url = path === null ? undefined : `${SITE_URL}${path}`;

  // Next does not apply a layout's `%s` template to a page in that layout's own
  // route segment, so "/" can never pick up the "· DSA Monitor" suffix that way
  // (generate-metadata.md:287). Emit it verbatim via `absolute` instead, and
  // leave the og/twitter titles unsuffixed there too so all three agree.
  const isRoot = path === "/";
  const ogTitle = !resolvedTitle
    ? SITE_NAME
    : isRoot
      ? resolvedTitle
      : `${resolvedTitle} · ${SITE_NAME}`;

  return {
    // Omit the key entirely when there's no title. `title: undefined` is NOT
    // the same as absent: mergeMetadata walks the object with `for...in`, which
    // sees undefined-valued keys, and resolveTitle() then collapses the title
    // to "". That is why the homepage shipped with no <title> element at all.
    ...(resolvedTitle
      ? { title: isRoot ? { absolute: resolvedTitle } : resolvedTitle }
      : {}),
    description: resolvedDescription,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: ogTitle,
      description: resolvedDescription,
      ...(url ? { url } : {}),
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: resolvedDescription },
  };
}

export function reportMetadata(report: Report): Metadata {
  return pageMetadata({
    title: report.title,
    description: report.summary,
    path: `/publications/${report.slug}`,
    cms: { metaTitle: report.metaTitle, metaDescription: report.metaDescription },
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
    author: { "@type": "Organization", name: "OIAT" },
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
