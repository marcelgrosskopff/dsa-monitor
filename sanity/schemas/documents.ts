import { defineArrayMember, defineField, defineType } from "sanity";
import { createCharacterCounter } from "../components/CharacterCounter";

const SWATCHES = ["red", "blue", "orange", "purple", "coral", "green", "neutral"];

/** organization — a partner, funder, or both. Referenced by siteSettings (site-wide
 *  logo wall) and per-report attribution. One entity, edited in one place. */
export const organization = defineType({
  name: "organization",
  type: "document",
  // Taxonomy docs edit LIVE — no draft state. Prevents the confusing situation
  // where a report's Draft/Published tabs disagree because a linked label has
  // an unpublished rename (bit the editors during client testing).
  liveEdit: true,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", type: "image", options: { hotspot: false } }),
    defineField({
      name: "url",
      type: "url",
      description: "Optional. Enables clickable logos.",
    }),
  ],
  preview: { select: { title: "name", media: "logo" } },
});

/** platform — a monitored platform (Meta, TikTok, …). A shared, ever-growing list:
 *  editors pick from existing entries or create a new one inline from the report's
 *  Platforms field. The homepage "platforms monitored" stat counts these. */
export const platform = defineType({
  name: "platform",
  type: "document",
  // Live edit — see note on `organization`.
  liveEdit: true,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "name" } },
});

/** topic — one topic → one swatch. Primary topics keep their colour; long-tail go neutral. */
export const topic = defineType({
  name: "topic",
  type: "document",
  // Live edit — see note on `organization`.
  liveEdit: true,
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
      name: "topics",
      type: "array",
      title: "Topics",
      description:
        "Drag to reorder — the FIRST topic is the primary one: it sets the report's colour and shows first on the site.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "topic" }] })],
      validation: (r) => r.required().min(1).unique(),
    }),
    defineField({
      name: "platforms",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "platform" }] })],
      description:
        "Platforms this report covers. Pick from the list, or type a new name and choose “Create” to add it. Drives the homepage “platforms monitored” count.",
    }),
    defineField({
      name: "publishedAt",
      type: "date",
      options: { dateFormat: "MM/YYYY" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      description:
        "Optional. Used as the SEO/search-result description when Meta Description is empty — not shown on the page itself. Tip: use the AI assist on Meta Description instead.",
    }),
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
    defineField({
      name: "metaTitle",
      type: "string",
      description: "SEO title override. Google shows around 60 characters.",
      components: { input: createCharacterCounter(60) },
    }),
    defineField({
      name: "metaDescription",
      type: "text",
      rows: 2,
      description: "SEO description override. Google shows around 160 characters.",
      components: { input: createCharacterCounter(160) },
    }),
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
    // Featured box removed from the site (client feedback r3). Field hidden but
    // data preserved — restore by removing `hidden` and re-adding the render.
    defineField({ name: "featured", type: "resourceFeatured", hidden: true }),
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
      name: "partners",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "organization" }] })],
    }),
    defineField({
      name: "funders",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "organization" }] })],
    }),
    // Logo band captions — the small line above each logo group.
    // Displayed in CAPITALS by the design system; type them in normal case.
    defineField({
      name: "partnersCaption",
      type: "string",
      title: "Logo band — partners caption",
      description: "Line above the partner logos. Shown in capitals — type it in normal case.",
      initialValue: "OIAT Research – an initiative of OIAT",
    }),
    defineField({
      name: "fundersCaption",
      type: "string",
      title: "Logo band — funders caption",
      description: "Line above the funder logos. Shown in capitals — type it in normal case.",
      initialValue: "Funded by",
    }),
    // About page facts sidebar
    defineField({ name: "publisherName", type: "string", title: "Publisher name", initialValue: "OIAT" }),
    defineField({ name: "activeSince", type: "string", title: "Active since", initialValue: "1997" }),
    defineField({ name: "orgStatus", type: "string", title: "Status", initialValue: "DSA Trusted Flagger" }),
    defineField({ name: "licence", type: "string", title: "Content licence", initialValue: "CC BY-SA 4.0" }),
    defineField({ name: "locationLabel", type: "string", title: "Location", initialValue: "Wien, AT" }),
    // Footer text
    defineField({ name: "footerDescriptor", type: "text", rows: 2, title: "Footer descriptor" }),
    defineField({ name: "footerAddress", type: "string", title: "Footer address" }),
    defineField({ name: "footerColSite", type: "string", title: "Footer column — Site", initialValue: "Site" }),
    defineField({ name: "footerColLegal", type: "string", title: "Footer column — Legal", initialValue: "Legal" }),
    defineField({
      name: "footerLegalImprintLabel",
      type: "string",
      title: "Footer legal link — Imprint",
      description: "Link text only. The page address stays /impressum.",
      initialValue: "Imprint",
    }),
    defineField({
      name: "footerLegalPrivacyLabel",
      type: "string",
      title: "Footer legal link — Privacy",
      initialValue: "Privacy",
    }),
    defineField({ name: "footerColContact", type: "string", title: "Footer column — Contact", initialValue: "Contact" }),
    defineField({ name: "copyrightSuffix", type: "string", title: "Footer copyright suffix", initialValue: "OIAT · CC BY-SA 4.0" }),
    defineField({ name: "linkedinLabel", type: "string", title: "LinkedIn link label", initialValue: "LinkedIn" }),
    defineField({ name: "navHomeLabel", type: "string", title: "Nav — Home label", initialValue: "Home" }),
    defineField({ name: "navPublicationsLabel", type: "string", title: "Nav — Publications label", initialValue: "Publications" }),
    defineField({ name: "navResourcesLabel", type: "string", title: "Nav — Resources label", initialValue: "Resources" }),
    defineField({ name: "navAboutLabel", type: "string", title: "Nav — About label", initialValue: "About" }),
    defineField({
      name: "skipToContentLabel",
      type: "string",
      title: "Skip-to-content link label",
      description: "Accessibility link, visible only when reached by keyboard.",
      initialValue: "Skip to content",
    }),
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
    // Hero CTA buttons
    defineField({ name: "heroCtaLabel", type: "string", title: "Hero CTA label (primary button)", initialValue: "Browse publications" }),
    defineField({ name: "heroSecondaryLabel", type: "string", title: "Hero secondary button label", initialValue: "About DSA Monitor" }),
    defineField({ name: "viewAllLabel", type: "string", title: "Latest publications — 'View all' button prefix", initialValue: "View all" }),
    defineField({ name: "closerCtaLabel", type: "string", title: "Closing section — button label", initialValue: "Browse publications" }),
    // Stat strip labels. The NUMBERS are counted automatically from published
    // content and are deliberately not editable — only their wording is.
    defineField({ name: "kpiReportsLabel", type: "string", title: "Stat strip — reports label", initialValue: "Reports published" }),
    defineField({ name: "kpiPlatformsLabel", type: "string", title: "Stat strip — platforms label", initialValue: "Platforms monitored" }),
    defineField({ name: "kpiTopicsLabel", type: "string", title: "Stat strip — topics label", initialValue: "Topic categories" }),
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
    // Facts sidebar. The VALUES live on Site settings (publisher, active since,
    // status, licence, location) — these are just the row labels beside them.
    defineField({ name: "factPublisherLabel", type: "string", title: "Facts — Publisher row label", initialValue: "Publisher" }),
    defineField({ name: "factActiveSinceLabel", type: "string", title: "Facts — Active since row label", initialValue: "Active since" }),
    defineField({ name: "factStatusLabel", type: "string", title: "Facts — Status row label", initialValue: "Status" }),
    defineField({ name: "factLicenceLabel", type: "string", title: "Facts — Licence row label", initialValue: "Licence" }),
    defineField({ name: "factLocationLabel", type: "string", title: "Facts — Location row label", initialValue: "Location" }),
    defineField({ name: "contactHeading", type: "string", title: "Contact box heading", initialValue: "Contact" }),
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
    defineField({
      name: "optOutUnavailableNote",
      type: "text",
      rows: 2,
      title: "Opt-out unavailable note",
      description: "Shown in place of the opt-out control when no Matomo URL is configured.",
      initialValue: "Opt-out control activates once the Matomo instance URL is configured.",
    }),
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
    // Replaced the old `countSuffix` field, which was never rendered anywhere and
    // still held "newest first" from before the sort control was removed.
    defineField({ name: "countLabel", type: "string", title: "Word after the report count", description: 'Renders as e.g. "12 reports".', initialValue: "reports" }),
    defineField({ name: "filterAllLabel", type: "string", title: "Filter chip — 'All topics' label", initialValue: "All topics" }),
    defineField({
      name: "filterEmptyHeading",
      type: "string",
      title: "Filter empty state — heading",
      description: 'Write the whole sentence. Use {topic} where the topic name should appear.',
      initialValue: "No publications under “{topic}” yet.",
    }),
    defineField({ name: "filterEmptyBody", type: "text", rows: 2, title: "Filter empty state — body" }),
    defineField({ name: "clearFilterLabel", type: "string", title: "Clear filter button label", initialValue: "Clear filter — show all" }),
    defineField({ name: "paginationPrevLabel", type: "string", title: "Pagination — previous label", initialValue: "← Prev" }),
    defineField({ name: "paginationNextLabel", type: "string", title: "Pagination — next label", initialValue: "Next →" }),
    defineField({ name: "loadingLabel", type: "string", title: "Loading placeholder text", initialValue: "Loading…" }),
    defineField({ name: "cardReadLabel", type: "string", title: "Report card — read link label", description: "Appears on every report card, site-wide.", initialValue: "Read report →" }),
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
    defineField({ name: "dlTypeLabel", type: "string", title: "Download item type label", initialValue: "Download" }),
    defineField({ name: "linkTypeLabel", type: "string", title: "External link type label", initialValue: "External site" }),
  ],
  preview: { prepare: () => ({ title: "Resources copy" }) },
});

export const notFoundContent = defineType({
  name: "notFoundContent",
  type: "document",
  fields: [
    defineField({ name: "errorCode", type: "string", title: "Error code line", initialValue: "Error 404 · Page not found" }),
    defineField({ name: "heading", type: "string", title: "Heading (h1)", initialValue: "We couldn't find that page." }),
    defineField({ name: "body", type: "text", rows: 3, title: "Body text" }),
    defineField({ name: "homeLabel", type: "string", title: "Home button label", initialValue: "Back to home" }),
    defineField({ name: "publicationsLabel", type: "string", title: "Publications button label", initialValue: "Browse publications" }),
  ],
  preview: { prepare: () => ({ title: "404 copy" }) },
});

export const documentSchemas = [
  organization,
  platform,
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
  notFoundContent,
];

export const SINGLETONS = [
  "siteSettings",
  "homeContent",
  "aboutContent",
  "impressumContent",
  "privacyContent",
  "publicationsContent",
  "resourcesContent",
  "notFoundContent",
];
