/**
 * One-time backfill: give the newly-added label fields their current on-site
 * wording, so editors SEE what the page says instead of an empty box.
 *
 * Why this is needed: Sanity `initialValue` only applies to documents created
 * after the field exists. These singletons already existed, so every field added
 * in the "editable content" batch reads as empty in Studio even though the site
 * renders the code fallback. Functionally fine, editorially confusing.
 *
 * Safety:
 *   - Defaults to DRY-RUN. Requires --commit to write.
 *   - Uses setIfMissing, so a value an editor has already typed is never
 *     overwritten. Re-running is a no-op.
 *   - Patches the DRAFT too when one exists. Studio shows the draft, so a
 *     published-only patch would still look empty to the editor.
 *   - Deliberately does NOT touch metaTitle / metaDescription. Those are
 *     optional SEO overrides with a documented fallback (same as the report
 *     fields the client already uses); filling them would bake today's default
 *     into content and silently freeze it.
 *
 * Usage:
 *   node scripts/backfill-label-fields.mjs           # dry-run
 *   node scripts/backfill-label-fields.mjs --commit  # write
 *
 * Requires: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 *           (default "production"), SANITY_API_WRITE_TOKEN.
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const COMMIT = process.argv.includes("--commit");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
  perspective: "raw",
});

/** Field values EXACTLY as the code fallbacks render them today.
 *  Keep in sync with the `||` fallbacks in the components listed per group. */
const BACKFILL = {
  // components/ds/navigation.tsx, components/blocks/Page.tsx
  siteSettings: {
    partnersCaption: "OIAT Research – an initiative of OIAT",
    fundersCaption: "Funded by",
    footerLegalImprintLabel: "Imprint",
    footerLegalPrivacyLabel: "Privacy",
    skipToContentLabel: "Skip to content",
  },
  // components/blocks/sections.tsx, lib/counts.ts
  homeContent: {
    closerCtaLabel: "Browse publications",
    kpiReportsLabel: "Reports published",
    kpiPlatformsLabel: "Platforms monitored",
    kpiTopicsLabel: "Topic categories",
  },
  // app/about/page.tsx
  aboutContent: {
    factPublisherLabel: "Publisher",
    factActiveSinceLabel: "Active since",
    factStatusLabel: "Status",
    factLicenceLabel: "Licence",
    factLocationLabel: "Location",
    contactHeading: "Contact",
  },
  // components/publications/PublicationsClient.tsx, app/publications/page.tsx
  publicationsContent: {
    countLabel: "reports",
    clearFilterLabel: "Clear filter — show all",
    paginationPrevLabel: "← Prev",
    paginationNextLabel: "Next →",
    loadingLabel: "Loading…",
    cardReadLabel: "Read report →",
  },
  // app/privacy/page.tsx
  privacyContent: {
    optOutUnavailableNote:
      "Opt-out control activates once the Matomo instance URL is configured.",
  },
};

/** `filterEmptyHeading` changed FORMAT: it used to be a bare prefix that the
 *  code wrapped in quotes plus " yet.", and is now a whole sentence with a
 *  {topic} token. The rendered output is identical either way, but a stored
 *  prefix now contradicts the field's own help text. Upgrading it rewrites an
 *  existing editor value, so it needs an explicit opt-in flag. */
const UPGRADE_FORMAT = process.argv.includes("--upgrade-empty-heading");
const EMPTY_HEADING_NEW = "No publications under “{topic}” yet.";

const isBlank = (v) => v === undefined || v === null || (typeof v === "string" && !v.trim());

async function run() {
  console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY-RUN (read-only)"}`);
  console.log(`Project: ${projectId}  Dataset: ${dataset}`);
  console.log("");

  const ids = Object.keys(BACKFILL);
  const allIds = ids.flatMap((id) => [id, `drafts.${id}`]);
  const docs = await client.fetch(`*[_id in $ids]{ _id }`, { ids: allIds });
  const present = new Set(docs.map((d) => d._id));

  const plan = [];
  for (const id of ids) {
    for (const docId of [id, `drafts.${id}`]) {
      if (!present.has(docId)) continue;
      const doc = await client.getDocument(docId);
      const fields = { ...BACKFILL[id] };
      const toSet = {};
      const kept = [];
      for (const [k, v] of Object.entries(fields)) {
        if (isBlank(doc?.[k])) toSet[k] = v;
        else kept.push(`${k}="${doc[k]}"`);
      }
      if (id === "publicationsContent" && UPGRADE_FORMAT) {
        const cur = doc?.filterEmptyHeading;
        if (typeof cur === "string" && cur.trim() && !cur.includes("{topic}")) {
          toSet.filterEmptyHeading = EMPTY_HEADING_NEW;
        }
      }
      const label = docId.startsWith("drafts.") ? `${id} (DRAFT)` : `${id} (published)`;
      if (!Object.keys(toSet).length) {
        console.log(`  · ${label} — nothing to fill`);
      } else {
        console.log(`  · ${label} — filling ${Object.keys(toSet).length}:`);
        for (const [k, v] of Object.entries(toSet)) console.log(`        ${k} = "${v}"`);
        plan.push({ docId, toSet });
      }
      if (kept.length) console.log(`        (leaving alone: ${kept.join(", ")})`);
    }
  }

  const draftCount = plan.filter((p) => p.docId.startsWith("drafts.")).length;
  console.log("");
  console.log(`Documents to patch: ${plan.length} (${draftCount} of them drafts)`);
  if (!UPGRADE_FORMAT) {
    console.log("Note: filterEmptyHeading left as-is. Pass --upgrade-empty-heading to");
    console.log("      rewrite it to the {topic} sentence form (same rendered output).");
  }
  console.log("");

  if (!COMMIT) {
    console.log("Dry-run complete. Re-run with --commit to apply.");
    return;
  }

  for (const p of plan) {
    await client.patch(p.docId).setIfMissing(p.toSet).commit();
    console.log(`  ✓ ${p.docId} patched.`);
  }
  console.log("");
  console.log("Backfill complete. Editors now see the current wording in Studio.");
  if (draftCount) {
    console.log("");
    console.log(`${draftCount} DRAFT document(s) were patched — those singletons had`);
    console.log("unpublished changes. Publishing them is the editor's call, not ours.");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
