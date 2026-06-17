import { defineArrayMember, defineField, defineType } from "sanity";

const SWATCHES = ["red", "blue", "orange", "purple", "coral", "green", "neutral"];

/** topic — one topic → one swatch. Primary topics keep their colour; long-tail go neutral. */
export const topic = defineType({
  name: "topic",
  type: "document",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "label" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "swatch",
      type: "string",
      initialValue: "neutral",
      options: { list: SWATCHES },
    }),
    defineField({
      name: "isPrimary",
      type: "boolean",
      initialValue: true,
      description: "Primary topics keep their colour; long-tail go neutral.",
    }),
    defineField({ name: "order", type: "number" }),
  ],
  preview: { select: { title: "label", subtitle: "swatch" } },
});

/** report — the single CMS template for every report variant. */
export const report = defineType({
  name: "report",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "subtitle", type: "string", description: "Optional — renders only when present." }),
    defineField({
      name: "primaryTopic",
      type: "reference",
      to: [{ type: "topic" }],
      description: "Drives the swatch + colour coding.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "topics",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "topic" }] })],
    }),
    defineField({
      name: "articleType",
      type: "string",
      options: { list: ["Study", "Dossier", "Policy Paper"] },
      description: "INTERNAL ONLY — never shown on the site.",
    }),
    defineField({ name: "platforms", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "publishedAt",
      type: "date",
      options: { dateFormat: "MM/YYYY" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "body", type: "richBody" }),
    defineField({
      name: "methodology",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "kpis",
      type: "array",
      of: [defineArrayMember({ type: "kpi" })],
      validation: (r) => r.max(4),
      description: "Cap 4 — 5th+ findings go into body prose.",
    }),
    defineField({
      name: "downloads",
      type: "array",
      of: [defineArrayMember({ type: "download" })],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "attribution", type: "attribution" }),
    defineField({ name: "source", type: "sourceLink" }),
    defineField({ name: "metaTitle", type: "string" }),
    defineField({ name: "metaDescription", type: "text", rows: 2 }),
  ],
  orderings: [
    {
      title: "Published (newest first)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "primaryTopic.label", date: "publishedAt" },
    prepare: ({ title, subtitle, date }) => ({
      title,
      subtitle: [subtitle, date].filter(Boolean).join(" · "),
    }),
  },
});

/** resourceGroup — extensible groups (Tools / Templates / ACE / …). */
export const resourceGroup = defineType({
  name: "resourceGroup",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "featured", type: "resourceFeatured" }),
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "resourceItem" })],
    }),
  ],
  preview: { select: { title: "name" } },
});

/** siteSettings — singleton. */
export const siteSettings = defineType({
  name: "siteSettings",
  type: "document",
  fields: [
    defineField({ name: "contactEmail", type: "string", initialValue: "research@oiat.at" }),
    defineField({ name: "linkedinUrl", type: "url" }),
    defineField({
      name: "platformsMonitoredCount",
      type: "number",
      description: "The Home stat that isn't a pure CMS count.",
    }),
    defineField({ name: "partners", type: "array", of: [defineArrayMember({ type: "logo" })] }),
    defineField({ name: "funders", type: "array", of: [defineArrayMember({ type: "logo" })] }),
    // About page facts sidebar
    defineField({ name: "publisherName", type: "string", title: "Publisher name", initialValue: "ÖIAT" }),
    defineField({ name: "activeSince", type: "string", title: "Active since", initialValue: "1997" }),
    defineField({ name: "orgStatus", type: "string", title: "Status", initialValue: "DSA Trusted Flagger" }),
    defineField({ name: "licence", type: "string", title: "Content licence", initialValue: "CC BY-SA 4.0" }),
    defineField({ name: "locationLabel", type: "string", title: "Location", initialValue: "Wien, AT" }),
    // Footer text
    defineField({ name: "footerDescriptor", type: "text", rows: 2, title: "Footer descriptor" }),
    defineField({ name: "footerAddress", type: "string", title: "Footer address" }),
    defineField({ name: "footerColSite", type: "string", title: "Footer column — Site", initialValue: "Site" }),
    defineField({ name: "footerColLegal", type: "string", title: "Footer column — Legal", initialValue: "Legal" }),
    defineField({ name: "footerColContact", type: "string", title: "Footer column — Contact", initialValue: "Contact" }),
    defineField({ name: "copyrightSuffix", type: "string", title: "Footer copyright suffix", initialValue: "ÖIAT · CC BY-SA 4.0" }),
    defineField({ name: "linkedinLabel", type: "string", title: "LinkedIn link label", initialValue: "LinkedIn" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const homeContent = defineType({
  name: "homeContent",
  type: "document",
  fields: [
    // Hero
    defineField({ name: "heroEyebrow", type: "string", title: "Hero eyebrow label" }),
    defineField({ name: "heroHeadlineBefore", type: "string", title: "Hero headline — before highlighted word" }),
    defineField({ name: "heroHighlightWord", type: "string", title: "Hero headline — highlighted word" }),
    defineField({ name: "heroHeadlineAfter", type: "string", title: "Hero headline — after highlighted word" }),
    defineField({ name: "heroLead", type: "text", rows: 3, title: "Hero lead paragraph" }),
    // Latest publications strip
    defineField({ name: "latestEyebrow", type: "string", title: "Latest publications — eyebrow label" }),
    defineField({ name: "latestHeading", type: "string", title: "Latest publications — heading" }),
    // Empty state (no reports yet)
    defineField({ name: "emptyStateHeading", type: "string", title: "Empty state — heading (no reports yet)" }),
    defineField({ name: "emptyStateBody", type: "text", rows: 2, title: "Empty state — body" }),
    // How we work section
    defineField({ name: "howWeWorkEyebrow", type: "string", title: "How we work — eyebrow label" }),
    defineField({ name: "howWeWorkWhatLabel", type: "string", title: "How we work — 'What we do' cell label" }),
    defineField({ name: "howWeDoItHeading", type: "string", title: "What we do — heading" }),
    defineField({ name: "howWeDoItBody", type: "richBody", title: "What we do — body" }),
    defineField({ name: "howWeWorkWhyLabel", type: "string", title: "How we work — 'Why we do it' cell label" }),
    defineField({ name: "whyWeDoItHeading", type: "string", title: "Why we do it — heading" }),
    defineField({ name: "whyWeDoItBody", type: "richBody", title: "Why we do it — body" }),
    // Evidence boxes
    defineField({ name: "evidenceHeading", type: "string", title: "Evidence section heading" }),
    defineField({
      name: "evidenceBoxes",
      type: "array",
      of: [defineArrayMember({ type: "evidenceBox" })],
      title: "Evidence boxes (cap 3)",
      validation: (r) => r.max(3),
    }),
    // Closer
    defineField({ name: "closerHeadline", type: "string", title: "Closing section headline" }),
    defineField({ name: "closerBody", type: "richBody", title: "Closing section body" }),
  ],
  preview: { prepare: () => ({ title: "Home copy" }) },
});

export const aboutContent = defineType({
  name: "aboutContent",
  type: "document",
  fields: [
    defineField({ name: "eyebrowLabel", type: "string", title: "Page eyebrow label" }),
    defineField({ name: "pageHeading", type: "string", title: "Page heading (h1)" }),
    defineField({ name: "lead", type: "text", rows: 2, title: "Lead paragraph" }),
    defineField({ name: "body", type: "richBody" }),
    defineField({ name: "pressNote", type: "text", rows: 2, title: "Press enquiries note" }),
  ],
  preview: { prepare: () => ({ title: "About copy" }) },
});

export const impressumContent = defineType({
  name: "impressumContent",
  type: "document",
  fields: [
    defineField({ name: "eyebrowLabel", type: "string", title: "Page eyebrow label" }),
    defineField({ name: "pageHeading", type: "string", title: "Page heading (h1)" }),
    defineField({ name: "intro", type: "text", rows: 2, title: "Intro paragraph" }),
    defineField({ name: "body", type: "richBody", title: "Full legal content (Portable Text)" }),
  ],
  preview: { prepare: () => ({ title: "Impressum copy" }) },
});

export const privacyContent = defineType({
  name: "privacyContent",
  type: "document",
  fields: [
    defineField({ name: "eyebrowLabel", type: "string", title: "Page eyebrow label" }),
    defineField({ name: "pageHeading", type: "string", title: "Page heading (h1)" }),
    defineField({ name: "intro", type: "text", rows: 2, title: "Intro paragraph" }),
    defineField({ name: "body", type: "richBody", title: "Additional privacy content (shown above analytics)" }),
    defineField({ name: "analyticsHeading", type: "string", title: "Analytics section heading" }),
    defineField({ name: "analyticsBody", type: "text", rows: 4, title: "Analytics section body" }),
    defineField({ name: "optOutHeading", type: "string", title: "Opt-out section heading" }),
    defineField({ name: "optOutNote", type: "text", rows: 2, title: "Opt-out section note" }),
  ],
  preview: { prepare: () => ({ title: "Privacy copy" }) },
});

export const publicationsContent = defineType({
  name: "publicationsContent",
  type: "document",
  fields: [
    // Hub page
    defineField({ name: "eyebrowLabel", type: "string", title: "Page eyebrow label" }),
    defineField({ name: "heading", type: "string", title: "Page heading" }),
    defineField({ name: "description", type: "text", rows: 2, title: "Intro description" }),
    defineField({ name: "countSuffix", type: "string", title: "Count suffix (after report count)", initialValue: "newest first" }),
    defineField({ name: "filterAllLabel", type: "string", title: "Filter chip — 'All topics' label", initialValue: "All topics" }),
    defineField({ name: "filterEmptyHeading", type: "string", title: "Filter empty state — heading prefix", initialValue: "No publications under" }),
    defineField({ name: "filterEmptyBody", type: "text", rows: 2, title: "Filter empty state — body" }),
    // Report detail labels
    defineField({ name: "reportBackLabel", type: "string", title: "Report — back link label", initialValue: "← All publications" }),
    defineField({ name: "reportSummaryLabel", type: "string", title: "Report — Summary section label", initialValue: "Summary" }),
    defineField({ name: "reportMethodologyLabel", type: "string", title: "Report — Methodology section label", initialValue: "Methodology" }),
    defineField({ name: "reportRelatedLabel", type: "string", title: "Report — Related publications label", initialValue: "Related publications" }),
    defineField({ name: "reportDownloadLabel", type: "string", title: "Report — Download box label", initialValue: "Download" }),
    defineField({ name: "reportSourceLabel", type: "string", title: "Report — Source & replication label", initialValue: "Source & replication" }),
    defineField({ name: "reportFundingLabel", type: "string", title: "Report — Project & funding label", initialValue: "Project & funding" }),
  ],
  preview: { prepare: () => ({ title: "Publications copy" }) },
});

export const resourcesContent = defineType({
  name: "resourcesContent",
  type: "document",
  fields: [
    defineField({ name: "eyebrowLabel", type: "string", title: "Page eyebrow label" }),
    defineField({ name: "heading", type: "string", title: "Page heading" }),
    defineField({ name: "description", type: "text", rows: 2, title: "Intro description" }),
  ],
  preview: { prepare: () => ({ title: "Resources copy" }) },
});

export const documentSchemas = [
  topic,
  report,
  resourceGroup,
  siteSettings,
  homeContent,
  aboutContent,
  impressumContent,
  privacyContent,
  publicationsContent,
  resourcesContent,
];

export const SINGLETONS = [
  "siteSettings",
  "homeContent",
  "aboutContent",
  "impressumContent",
  "privacyContent",
  "publicationsContent",
  "resourcesContent",
];
