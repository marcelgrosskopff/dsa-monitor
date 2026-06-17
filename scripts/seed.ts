/**
 * Seed the Sanity dataset from the typed seed content (lib/seed-data.ts).
 *
 * Run with a write token in the environment:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx NEXT_PUBLIC_SANITY_DATASET=production \
 *   SANITY_API_WRITE_TOKEN=sk... npm run seed
 *
 * Idempotent: uses deterministic _ids and createOrReplace, so it can be re-run.
 * Uploads clearly-marked PLACEHOLDER files for each download + the real partner/funder
 * logos from public/logos. Do not treat the placeholder report PDFs as final assets.
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  SEED_REPORTS,
  SEED_RESOURCE_GROUPS,
  SEED_SETTINGS,
  SEED_TOPICS,
} from "../lib/seed-data";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

const topicId = (slug: string) => `topic-${slug}`;
const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Convert plain paragraphs to minimal Portable Text blocks. */
function toBlocks(paragraphs: string[] | undefined) {
  return (paragraphs ?? []).map((text, i) => ({
    _type: "block",
    _key: `b${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
  }));
}

const EXT: Record<string, string> = { PDF: "pdf", CSV: "csv", XLSX: "xlsx" };

/** A tiny but valid placeholder file for a given format. */
function placeholderBuffer(format: string): Buffer {
  if (format === "PDF") {
    // Minimal valid one-page PDF.
    return Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n164\n%%EOF\n",
      "latin1"
    );
  }
  if (format === "CSV") return Buffer.from("placeholder,column\n1,2\n", "utf8");
  return Buffer.from("DSA-Monitor placeholder file", "utf8");
}

async function uploadPlaceholder(label: string, format: string) {
  const ext = EXT[format] || "pdf";
  const asset = await client.assets.upload("file", placeholderBuffer(format), {
    filename: `${slugify(label)}-placeholder.${ext}`,
  });
  return asset._id;
}

async function uploadLogo(src: string, name: string) {
  const file = readFileSync(join(process.cwd(), "public", src.replace(/^\//, "")));
  const asset = await client.assets.upload("image", file, {
    filename: `${slugify(name)}${src.slice(src.lastIndexOf("."))}`,
  });
  return asset._id;
}

async function run() {
  const tx = client.transaction();

  // Topics
  for (const t of SEED_TOPICS) {
    tx.createOrReplace({
      _id: topicId(t.slug),
      _type: "topic",
      label: t.label,
      slug: { _type: "slug", current: t.slug },
      swatch: t.swatch,
      isPrimary: t.isPrimary,
      order: t.order,
    });
  }

  // Reports
  for (const r of SEED_REPORTS) {
    const downloads = [];
    for (const d of r.downloads) {
      const assetId = await uploadPlaceholder(d.label, d.format);
      downloads.push({
        _type: "download",
        _key: `dl-${slugify(d.label)}-${d.language || "x"}`,
        label: d.label,
        language: d.language,
        file: { _type: "file", asset: { _type: "reference", _ref: assetId } },
        formatOverride: EXT[d.format] ? undefined : d.format,
      });
    }
    tx.createOrReplace({
      _id: `report-${r.slug}`,
      _type: "report",
      title: r.title,
      slug: { _type: "slug", current: r.slug },
      subtitle: r.subtitle,
      primaryTopic: {
        _type: "reference",
        _ref: topicId(slugify(r.primaryTopic.label)),
      },
      topics: r.topics.map((t) => ({
        _type: "reference",
        _key: slugify(t.label),
        _ref: topicId(slugify(t.label)),
      })),
      platforms: r.platforms,
      publishedAt: r.publishedAt,
      summary: r.summary,
      body: toBlocks(r.body as string[] | undefined),
      methodology: toBlocks(r.methodology as string[] | undefined),
      kpis: r.kpis.map((k, i) => ({ _type: "kpi", _key: `k${i}`, ...k })),
      downloads,
      attribution: r.attribution
        ? { _type: "attribution", ...r.attribution }
        : undefined,
      source: r.source ? { _type: "sourceLink", ...r.source } : undefined,
    });
  }

  // Resource groups
  for (const g of SEED_RESOURCE_GROUPS) {
    const items = [];
    for (let i = 0; i < g.items.length; i++) {
      const it = g.items[i];
      if (it.type === "dl") {
        const assetId = await uploadPlaceholder(it.label, it.format || "PDF");
        items.push({
          _type: "resourceItem",
          _key: `i${i}`,
          type: "dl",
          label: it.label,
          language: it.language,
          file: { _type: "file", asset: { _type: "reference", _ref: assetId } },
        });
      } else {
        items.push({
          _type: "resourceItem",
          _key: `i${i}`,
          type: "link",
          label: it.label,
          href: it.href,
        });
      }
    }
    tx.createOrReplace({
      _id: `resourceGroup-${slugify(g.name)}`,
      _type: "resourceGroup",
      name: g.name,
      description: g.description,
      order: g.order,
      featured: g.featured
        ? { _type: "resourceFeatured", ...g.featured }
        : undefined,
      items,
    });
  }

  // Site settings (singleton) — with real logos
  const partners = [];
  for (const p of SEED_SETTINGS.partners) {
    const logoId = p.src ? await uploadLogo(p.src, p.name) : undefined;
    partners.push({
      _type: "logo",
      _key: slugify(p.name),
      name: p.name,
      logo: logoId
        ? { _type: "image", asset: { _type: "reference", _ref: logoId } }
        : undefined,
    });
  }
  const funders = [];
  for (const f of SEED_SETTINGS.funders) {
    const logoId = f.src ? await uploadLogo(f.src, f.name) : undefined;
    funders.push({
      _type: "logo",
      _key: slugify(f.name),
      name: f.name,
      logo: logoId
        ? { _type: "image", asset: { _type: "reference", _ref: logoId } }
        : undefined,
    });
  }
  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    contactEmail: SEED_SETTINGS.contactEmail,
    linkedinUrl: SEED_SETTINGS.linkedinUrl,
    platformsMonitoredCount: SEED_SETTINGS.platformsMonitoredCount,
    partners,
    funders,
  });

  // Page-copy singletons — clearly-marked placeholder until client copy arrives.
  for (const type of [
    "homeContent",
    "aboutContent",
    "impressumContent",
    "privacyContent",
  ]) {
    tx.createOrReplace({
      _id: type,
      _type: type,
      body: toBlocks([
        "Placeholder — client copy pending. Replace in the Studio.",
      ]),
    });
  }

  const res = await tx.commit();
  console.log(
    `Seeded: ${SEED_TOPICS.length} topics, ${SEED_REPORTS.length} reports, ${SEED_RESOURCE_GROUPS.length} resource groups, settings + page copy.`
  );
  console.log(`Transaction ${res.transactionId} committed.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
