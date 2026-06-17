import { client } from "@/sanity/lib/client";
import { sanityConfigured } from "@/sanity/env";
import {
  pageContentQuery,
  relatedReportsQuery,
  reportBySlugQuery,
  reportSlugsQuery,
  reportsQuery,
  resourceGroupsQuery,
  siteSettingsQuery,
  topicsQuery,
} from "@/sanity/lib/queries";
import {
  SEED_REPORTS,
  SEED_RESOURCE_GROUPS,
  SEED_SETTINGS,
  SEED_TOPICS,
  seedRelated,
} from "./seed-data";
import { formatFileSize, formatFromAsset, formatMonthYear } from "./format";
import type {
  Report,
  ResourceGroup,
  ResourceItem,
  SiteSettings,
  Swatch,
  Topic,
} from "./types";

// Tag-based revalidation: every Sanity read is tagged so the webhook route can
// invalidate precisely (see app/api/revalidate/route.ts).
const TAGS = { report: "report", topic: "topic", resource: "resource", settings: "settings" };

const LANG_CODE: Record<string, string> = {
  english: "EN",
  deutsch: "DE",
  german: "DE",
  en: "EN",
  de: "DE",
};

function langCode(language?: string): string | null {
  if (!language) return null;
  return LANG_CODE[language.trim().toLowerCase()] ?? language.trim().slice(0, 2).toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDownloads(raw: any[] | undefined) {
  return (raw ?? []).map((d) => ({
    label: d.label ?? "Download",
    language: d.language ?? "",
    format: formatFromAsset(d.extension, d.formatOverride),
    size: formatFileSize(d.sizeBytes),
    href: d.url ?? "#",
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReport(r: any): Report {
  const primaryTopic = r.primaryTopic ?? { label: "", swatch: "neutral" as Swatch };
  const topics =
    Array.isArray(r.topics) && r.topics.length ? r.topics : [primaryTopic];
  const downloads = mapDownloads(r.downloads);
  const languages = Array.from(
    new Set(downloads.map((d) => langCode(d.language)).filter(Boolean) as string[])
  );
  const date = formatMonthYear(r.publishedAt);
  return {
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle || undefined,
    swatch: (primaryTopic.swatch as Swatch) ?? "neutral",
    primaryTopic,
    topics,
    articleType: r.articleType,
    platforms: r.platforms ?? [],
    publishedAt: r.publishedAt,
    date,
    languages,
    meta: date,
    summary: r.summary ?? "",
    body: r.body ?? [],
    methodology: r.methodology ?? [],
    kpis: (r.kpis ?? []).slice(0, 4),
    downloads,
    attribution: r.attribution || undefined,
    source: r.source?.href ? r.source : undefined,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapResourceGroup(g: any): ResourceGroup {
  const items: ResourceItem[] = (g.items ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (it: any): ResourceItem =>
      it.type === "dl"
        ? {
            type: "dl",
            label: it.label,
            language: it.language,
            format: formatFromAsset(it.extension),
            size: formatFileSize(it.sizeBytes),
            href: it.url ?? "#",
          }
        : { type: "link", label: it.label, href: it.href ?? "#" }
  );
  return {
    name: g.name,
    description: g.description,
    order: g.order,
    featured: g.featured
      ? {
          title: g.featured.title,
          body: g.featured.body,
          linkLabel: g.featured.linkLabel,
          linkHref: g.featured.linkHref ?? "#",
        }
      : undefined,
    items,
  };
}

// Public data layer -------------------------------------------------------------

export async function getReports(): Promise<Report[]> {
  if (!sanityConfigured) return SEED_REPORTS;
  const data = await client.fetch(
    reportsQuery,
    {},
    { next: { tags: [TAGS.report] } }
  );
  if (!data?.length) return SEED_REPORTS;
  return data.map(mapReport);
}

export async function getReport(slug: string): Promise<Report | null> {
  if (!sanityConfigured) return SEED_REPORTS.find((r) => r.slug === slug) ?? null;
  const data = await client.fetch(
    reportBySlugQuery,
    { slug },
    { next: { tags: [TAGS.report] } }
  );
  return data ? mapReport(data) : null;
}

export async function getReportSlugs(): Promise<string[]> {
  if (!sanityConfigured) return SEED_REPORTS.map((r) => r.slug);
  const data = await client.fetch(reportSlugsQuery, {}, { next: { tags: [TAGS.report] } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((d: any) => d.slug).filter(Boolean);
}

export async function getRelatedReports(slug: string, topicLabel: string): Promise<Report[]> {
  if (!sanityConfigured) return seedRelated(slug);
  const data = await client.fetch(
    relatedReportsQuery,
    { slug, topicLabel },
    { next: { tags: [TAGS.report] } }
  );
  return (data ?? []).map(mapReport);
}

export async function getTopics(): Promise<Topic[]> {
  if (!sanityConfigured) return SEED_TOPICS;
  const data = await client.fetch(topicsQuery, {}, { next: { tags: [TAGS.topic] } });
  if (!data?.length) return SEED_TOPICS;
  return data;
}

export async function getResourceGroups(): Promise<ResourceGroup[]> {
  if (!sanityConfigured) return SEED_RESOURCE_GROUPS;
  const data = await client.fetch(
    resourceGroupsQuery,
    {},
    { next: { tags: [TAGS.resource] } }
  );
  if (!data?.length) return SEED_RESOURCE_GROUPS;
  return data.map(mapResourceGroup);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!sanityConfigured) return SEED_SETTINGS;
  const data = await client.fetch(
    siteSettingsQuery,
    {},
    { next: { tags: [TAGS.settings] } }
  );
  return data ?? SEED_SETTINGS;
}

export async function getPageContent(type: string): Promise<unknown[] | null> {
  if (!sanityConfigured) return null;
  const data = await client.fetch(pageContentQuery, { type }, { next: { tags: [TAGS.settings] } });
  return data?.body ?? null;
}
