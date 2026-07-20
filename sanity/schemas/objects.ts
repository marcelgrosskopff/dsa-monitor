import { defineArrayMember, defineField, defineType } from "sanity";

const SWATCHES = ["red", "blue", "orange", "purple", "coral", "green"];

/** KPI call-out — number + label + optional category accent. Capped at 4 on the report. */
export const kpi = defineType({
  name: "kpi",
  type: "object",
  fields: [
    defineField({ name: "number", type: "string", validation: (r) => r.required() }),
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "accent",
      type: "string",
      options: { list: SWATCHES },
    }),
  ],
  preview: {
    select: { title: "number", subtitle: "label" },
  },
});

/** A single downloadable file. Separate DE/EN files render as separate buttons. */
export const download = defineType({
  name: "download",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: '"Report" / "Bericht" / "Dataset"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "language",
      type: "string",
      description: '"English" / "Deutsch" / leave empty for language-neutral (e.g. a dataset)',
    }),
    defineField({ name: "file", type: "file", validation: (r) => r.required() }),
    defineField({
      name: "formatOverride",
      type: "string",
      description: "Only if the format can't be inferred from the file (e.g. CSV).",
    }),
  ],
  preview: { select: { title: "label", subtitle: "language" } },
});

/** Structured project attribution (locked §9.4) — all fields optional. */
export const attribution = defineType({
  name: "attribution",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "projectName", type: "string" }),
    defineField({
      name: "fundedBy",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "organization" }] })],
      description: "Pick from the Organizations library.",
    }),
    defineField({
      name: "partners",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "organization" }] })],
      description: "Pick from the Organizations library.",
    }),
    defineField({ name: "note", type: "text", rows: 3 }),
  ],
});

/** Optional outbound source link (e.g. replication code). */
export const sourceLink = defineType({
  name: "sourceLink",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({ name: "href", type: "url" }),
  ],
});

/** Lightweight table for report bodies — rows of plain-text cells. Rendered with a
 *  mobile scroll/stack fallback by PortableBody (locked §9.5). */
export const table = defineType({
  name: "table",
  type: "object",
  fields: [
    defineField({
      name: "rows",
      type: "array",
      of: [
        defineArrayMember({
          name: "row",
          type: "object",
          fields: [
            defineField({ name: "cells", type: "array", of: [{ type: "string" }] }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare: ({ cells }) => ({ title: (cells ?? []).join(" · ") }),
          },
        }),
      ],
    }),
    defineField({
      name: "hasHeaderRow",
      type: "boolean",
      initialValue: true,
      description: "Treat the first row as a header.",
    }),
  ],
  preview: {
    select: { rows: "rows" },
    prepare: ({ rows }) => ({ title: `Table · ${rows?.length ?? 0} rows` }),
  },
});

/** Rich body: Portable Text blocks + tables (locked §9.5). */
export const richBody = defineType({
  name: "richBody",
  type: "array",
  of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "table" })],
});

/** A resource entry — outbound link OR downloadable file. */
export const resourceItem = defineType({
  name: "resourceItem",
  type: "object",
  fields: [
    defineField({
      name: "type",
      type: "string",
      options: { list: ["link", "dl"], layout: "radio" },
      initialValue: "link",
      validation: (r) => r.required(),
    }),
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "href",
      type: "url",
      hidden: ({ parent }) => parent?.type !== "link",
      description: "For outbound links.",
    }),
    defineField({
      name: "file",
      type: "file",
      hidden: ({ parent }) => parent?.type !== "dl",
    }),
    defineField({
      name: "language",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "dl",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "type" },
  },
});

/** Optional featured standout entry for a resource group (e.g. ACE). */
export const resourceFeatured = defineType({
  name: "resourceFeatured",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "tag", type: "string", title: "Tag label (e.g. 'Featured · out-of-court redress')" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "body", type: "text", rows: 4 }),
    defineField({ name: "linkLabel", type: "string" }),
    defineField({ name: "linkHref", type: "url" }),
  ],
});

/** A partner/funder logo. */
export const logo = defineType({
  name: "logo",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", type: "image", options: { hotspot: false } }),
  ],
  preview: { select: { title: "name", media: "logo" } },
});

/** One evidence box for the home "Investigate / Document / Translate" trio. */
export const evidenceBox = defineType({
  name: "evidenceBox",
  type: "object",
  fields: [
    defineField({ name: "number", type: "string", initialValue: "01" }),
    defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 3, validation: (r) => r.required() }),
  ],
  preview: { select: { title: "heading", subtitle: "number" } },
});

export const objectSchemas = [
  kpi,
  download,
  attribution,
  sourceLink,
  table,
  richBody,
  resourceItem,
  resourceFeatured,
  logo,
  evidenceBox,
];
