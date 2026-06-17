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

export const homeContent = pageCopy("homeContent", "Home copy");
export const aboutContent = pageCopy("aboutContent", "About copy");
export const impressumContent = pageCopy("impressumContent", "Impressum copy");
export const privacyContent = pageCopy("privacyContent", "Privacy copy");

export const documentSchemas = [
  topic,
  report,
  resourceGroup,
  siteSettings,
  homeContent,
  aboutContent,
  impressumContent,
  privacyContent,
];

export const SINGLETONS = [
  "siteSettings",
  "homeContent",
  "aboutContent",
  "impressumContent",
  "privacyContent",
];
