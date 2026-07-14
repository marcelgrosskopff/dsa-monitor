import { draftMode } from "next/headers";
import { stegaClean } from "next-sanity";
import { client, previewClient } from "@/sanity/lib/client";
import { sanityConfigured } from "@/sanity/env";
import {
  aboutContentQuery,
  homeContentQuery,
  impressumContentQuery,
  notFoundContentQuery,
  pageContentQuery,
  privacyContentQuery,
  publicationsContentQuery,
  relatedReportsQuery,
  reportBySlugQuery,
  reportCountQuery,
  reportsPagedAZQuery,
  reportsPagedNewestQuery,
  reportsPagedOldestQuery,
  reportSlugsQuery,
  reportsQuery,
  resourceGroupsQuery,
  resourcesContentQuery,
  siteSettingsQuery,
  topicsQuery,
  PAGE_SIZE,
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

const PAGE_SIZE_CONST = PAGE_SIZE;

// Returns previewClient (stega + previewDrafts) when Next.js draft mode is on,
// otherwise returns the regular CDN-backed published client.
// Falls back to regular client during static generation (where draftMode() throws).
async function getQueryClient() {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled ? previewClient : client;
  } catch {
    return client;
  }
}

// Cache options: ISR tags for published fetches; no-store for draft previews.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchOptions(tags: string[]): Promise<Record<string, any>> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled ? { cache: "no-store" } : { next: { tags } };
  } catch {
    return { next: { tags } };
  }
}

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

// Stega encodes invisible metadata into every returned string so the visual-editing
// overlay can target fields. That breaks any string used as a logic key — `swatch`
// and `accent` feed CSS variable names like `var(--category-{swatch}-accent)`, and a
// stega-polluted value produces an invalid (empty) variable. Strip stega from those
// keys only; display text keeps its stega so click-to-edit still works.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanSwatch(t: any) {
  if (!t) return t;
  return { ...t, swatch: (stegaClean(t.swatch) as Swatch) ?? "neutral" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReport(r: any): Report {
  const primaryTopic = r.primaryTopic
    ? cleanSwatch(r.primaryTopic)
    : { label: "", swatch: "neutral" as Swatch };
  const topics =
    Array.isArray(r.topics) && r.topics.length
      ? r.topics.map(cleanSwatch)
      : [primaryTopic];
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
    platforms: r.platforms ?? [],
    publishedAt: r.publishedAt,
    date,
    languages,
    meta: date,
    summary: r.summary ?? "",
    body: r.body ?? [],
    methodology: r.methodology ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kpis: (r.kpis ?? []).slice(0, 4).map((k: any) => ({
      ...k,
      accent: k.accent ? stegaClean(k.accent) : k.accent,
    })),
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
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.report])]);
  const data = await qc.fetch(reportsQuery, {}, opts);
  if (!data?.length) return SEED_REPORTS;
  return data.map(mapReport);
}

export async function getReport(slug: string): Promise<Report | null> {
  if (!sanityConfigured) return SEED_REPORTS.find((r) => r.slug === slug) ?? null;
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.report])]);
  const data = await qc.fetch(reportBySlugQuery, { slug }, opts);
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
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.report])]);
  const data = await qc.fetch(relatedReportsQuery, { slug, topicLabel }, opts);
  return (data ?? []).map(mapReport);
}

export async function getTopics(): Promise<Topic[]> {
  if (!sanityConfigured) return SEED_TOPICS;
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.topic])]);
  const data = await qc.fetch(topicsQuery, {}, opts);
  if (!data?.length) return SEED_TOPICS;
  // Clean stega from `swatch` — it builds CSS variable names (see cleanSwatch).
  return data.map(cleanSwatch);
}

export async function getResourceGroups(): Promise<ResourceGroup[]> {
  if (!sanityConfigured) return SEED_RESOURCE_GROUPS;
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.resource])]);
  const data = await qc.fetch(resourceGroupsQuery, {}, opts);
  if (!data?.length) return SEED_RESOURCE_GROUPS;
  return data.map(mapResourceGroup);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!sanityConfigured) return SEED_SETTINGS;
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(siteSettingsQuery, {}, opts);
  return data ?? SEED_SETTINGS;
}

export interface EvidenceBox {
  number: string;
  heading: string;
  description: string;
}

export interface HomeContent {
  heroEyebrow?: string;
  heroHeadlineBefore?: string;
  heroHighlightWord?: string;
  heroHeadlineAfter?: string;
  heroLead?: string;
  latestEyebrow?: string;
  latestHeading?: string;
  emptyStateHeading?: string;
  emptyStateBody?: string;
  howWeWorkEyebrow?: string;
  howWeWorkWhatLabel?: string;
  howWeDoItHeading?: string;
  howWeDoItBody?: unknown[];
  howWeWorkWhyLabel?: string;
  whyWeDoItHeading?: string;
  whyWeDoItBody?: unknown[];
  evidenceHeading?: string;
  evidenceBoxes?: EvidenceBox[];
  closerHeadline?: string;
  closerBody?: unknown[];
  heroCtaLabel?: string;
  heroSecondaryLabel?: string;
  viewAllLabel?: string;
}

export interface AboutContent {
  eyebrowLabel?: string;
  pageHeading?: string;
  lead?: string;
  body?: unknown[];
  pressNote?: string;
}

export interface ImpressumContent {
  eyebrowLabel?: string;
  pageHeading?: string;
  intro?: string;
  body?: unknown[];
}

export interface PrivacyContent {
  eyebrowLabel?: string;
  pageHeading?: string;
  intro?: string;
  body?: unknown[];
  analyticsHeading?: string;
  analyticsBody?: string;
  optOutHeading?: string;
  optOutNote?: string;
}

export interface PublicationsContent {
  eyebrowLabel?: string;
  heading?: string;
  description?: string;
  countSuffix?: string;
  filterAllLabel?: string;
  filterEmptyHeading?: string;
  filterEmptyBody?: string;
  reportBackLabel?: string;
  reportSummaryLabel?: string;
  reportMethodologyLabel?: string;
  reportRelatedLabel?: string;
  reportDownloadLabel?: string;
  reportSourceLabel?: string;
  reportFundingLabel?: string;
}

export interface ResourcesContent {
  eyebrowLabel?: string;
  heading?: string;
  description?: string;
  dlTypeLabel?: string;
  linkTypeLabel?: string;
}

export interface NotFoundContent {
  errorCode?: string;
  heading?: string;
  body?: string;
  homeLabel?: string;
  publicationsLabel?: string;
}

export async function getHomeContent(): Promise<HomeContent> {
  if (!sanityConfigured) return {};
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(homeContentQuery, {}, opts);
  return data ?? {};
}

export async function getAboutContent(): Promise<AboutContent> {
  if (!sanityConfigured) return {};
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(aboutContentQuery, {}, opts);
  return data ?? {};
}

export async function getImpressumContent(): Promise<ImpressumContent> {
  if (!sanityConfigured) return {};
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(impressumContentQuery, {}, opts);
  return data ?? {};
}

export async function getPrivacyContent(): Promise<PrivacyContent> {
  if (!sanityConfigured) return {};
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(privacyContentQuery, {}, opts);
  return data ?? {};
}

export async function getPublicationsContent(): Promise<PublicationsContent> {
  if (!sanityConfigured) return {};
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(publicationsContentQuery, {}, opts);
  return data ?? {};
}

export async function getResourcesContent(): Promise<ResourcesContent> {
  if (!sanityConfigured) return {};
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(resourcesContentQuery, {}, opts);
  return data ?? {};
}

export async function getPageContent(type: string): Promise<unknown[] | null> {
  if (!sanityConfigured) return null;
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(pageContentQuery, { type }, opts);
  return data?.body ?? null;
}

function sortSeedReports(
  reports: Report[],
  sort: "newest" | "oldest" | "az"
): Report[] {
  const a = [...reports];
  if (sort === "oldest")
    a.sort((x, y) => x.date.localeCompare(y.date));
  else if (sort === "az")
    a.sort((x, y) => x.title.localeCompare(y.title));
  else
    a.sort((x, y) => y.date.localeCompare(x.date));
  return a;
}

export async function getReportsPaged({
  topic,
  page,
  sort = "newest",
}: {
  topic: string | null;
  page: number;
  sort?: "newest" | "oldest" | "az";
}): Promise<{ reports: Report[]; totalCount: number; pageCount: number }> {
  if (!sanityConfigured) {
    // Seed fallback: filter + sort + paginate in memory
    const filtered = topic
      ? SEED_REPORTS.filter(
          (r) =>
            r.primaryTopic.label === topic ||
            r.topics.some((t) => t.label === topic)
        )
      : SEED_REPORTS;
    const sorted = sortSeedReports(filtered, sort);
    const start = (page - 1) * PAGE_SIZE_CONST;
    return {
      reports: sorted.slice(start, start + PAGE_SIZE_CONST),
      totalCount: filtered.length,
      pageCount: Math.ceil(filtered.length / PAGE_SIZE_CONST) || 1,
    };
  }

  const sortedQuery =
    sort === "oldest"
      ? reportsPagedOldestQuery
      : sort === "az"
        ? reportsPagedAZQuery
        : reportsPagedNewestQuery;

  const [qc, opts] = await Promise.all([
    getQueryClient(),
    fetchOptions([TAGS.report]),
  ]);
  const start = (page - 1) * PAGE_SIZE_CONST;
  const end = start + PAGE_SIZE_CONST;
  const [rawReports, totalCount] = await Promise.all([
    qc.fetch(sortedQuery, { topic: topic ?? null, start, end }, opts),
    qc.fetch(reportCountQuery, { topic: topic ?? null }, opts),
  ]);
  const reports = (rawReports ?? []).map(mapReport);
  return {
    reports,
    totalCount: totalCount ?? 0,
    pageCount: Math.ceil((totalCount ?? 0) / PAGE_SIZE_CONST) || 1,
  };
}

export async function getNotFoundContent(): Promise<NotFoundContent> {
  if (!sanityConfigured) return {};
  const [qc, opts] = await Promise.all([getQueryClient(), fetchOptions([TAGS.settings])]);
  const data = await qc.fetch(notFoundContentQuery, {}, opts);
  return data ?? {};
}
