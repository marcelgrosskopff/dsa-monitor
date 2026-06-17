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
    defineField({ name: "publisherName", type: "string", title: "Publisher name", initialValue: "ÖIAT" }),
    defineField({ name: "activeSince", type: "string", title: "Active since", initialValue: "1997" }),
    defineField({ name: "orgStatus", type: "string", title: "Status", initialValue: "DSA Trusted Flagger" }),
    defineField({ name: "licence", type: "string", title: "Content licence", initialValue: "CC BY-SA 4.0" }),
    defineField({ name: "locationLabel", type: "string", title: "Location", initialValue: "Wien, AT" }),
    defineField({
      name: "footerDescriptor",
      type: "text",
      rows: 2,
      title: "Footer descriptor",
      description: "One-line descriptor below the wordmark in the footer.",
    }),
    defineField({
      name: "footerAddress",
      type: "string",
      title: "Footer address",
      description: "e.g. ÖIAT · Margaretenstr. 70 · 1050 Wien",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

/** Editable page-copy singletons (Portable Text). Do not invent legal/privacy copy —
 *  render client-supplied text only. */
function pageCopy(name: string, title: string) {
  return defineType({
    name,
    type: "document",
    fields: [defineField({ name: "body", type: "richBody" })],
    preview: { prepare: () => ({ title }) },
  });
}

export const homeContent = defineType({
  name: "homeContent",
  type: "document",
  fields: [
    defineField({ name: "heroEyebrow", type: "string", title: "Hero eyebrow label" }),
    defineField({ name: "heroHeadlineBefore", type: "string", title: "Hero headline — before highlighted word" }),
    defineField({ name: "heroHighlightWord", type: "string", title: "Hero headline — highlighted word" }),
    defineField({ name: "heroHeadlineAfter", type: "string", title: "Hero headline — after highlighted word" }),
    defineField({ name: "heroLead", type: "text", rows: 3, title: "Hero lead paragraph" }),
    defineField({ name: "howWeDoItHeading", type: "string", title: "What we do — heading" }),
    defineField({ name: "howWeDoItBody", type: "richBody", title: "What we do — body" }),
    defineField({ name: "whyWeDoItHeading", type: "string", title: "Why we do it — heading" }),
    defineField({ name: "whyWeDoItBody", type: "richBody", title: "Why we do it — body" }),
    defineField({ name: "evidenceHeading", type: "string", title: "Evidence section heading" }),
    defineField({
      name: "evidenceBoxes",
      type: "array",
      of: [defineArrayMember({ type: "evidenceBox" })],
      title: "Evidence boxes (cap 3)",
      validation: (r) => r.max(3),
    }),
    defineField({ name: "latestEyebrow", type: "string", title: "Latest publications — eyebrow label" }),
    defineField({ name: "latestHeading", type: "string", title: "Latest publications — heading" }),
    defineField({ name: "closerHeadline", type: "string", title: "Closing section headline" }),
    defineField({ name: "closerBody", type: "richBody", title: "Closing section body" }),
  ],
  preview: { prepare: () => ({ title: "Home copy" }) },
});

export const aboutContent = defineType({
  name: "aboutContent",
  type: "document",
  fields: [
    defineField({ name: "lead", type: "text", rows: 2, title: "Lead paragraph (below h1)" }),
    defineField({ name: "body", type: "richBody" }),
    defineField({ name: "pressNote", type: "text", rows: 2, title: "Press enquiries note" }),
  ],
  preview: { prepare: () => ({ title: "About copy" }) },
});

export const impressumContent = defineType({
  name: "impressumContent",
  type: "document",
  fields: [
    defineField({ name: "intro", type: "text", rows: 2, title: "Intro paragraph (below h1)" }),
    defineField({ name: "body", type: "richBody", title: "Full legal content (Portable Text)" }),
  ],
  preview: { prepare: () => ({ title: "Impressum copy" }) },
});

export const privacyContent = defineType({
  name: "privacyContent",
  type: "document",
  fields: [
    defineField({ name: "intro", type: "text", rows: 2, title: "Intro paragraph (below h1)" }),
    defineField({ name: "body", type: "richBody", title: "Additional privacy content" }),
  ],
  preview: { prepare: () => ({ title: "Privacy copy" }) },
});

export const publicationsContent = defineType({
  name: "publicationsContent",
  type: "document",
  fields: [
    defineField({ name: "heading", type: "string", title: "Page heading" }),
    defineField({ name: "description", type: "text", rows: 2, title: "Intro description" }),
  ],
  preview: { prepare: () => ({ title: "Publications copy" }) },
});

export const resourcesContent = defineType({
  name: "resourcesContent",
  type: "document",
  fields: [
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
