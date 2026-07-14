/**
 * One-time migration: extract per-report and site-wide partner/funder data into
 * a shared `organization` document library, then rewrite the source fields to
 * references.
 *
 * Handles two disconnected sources of truth in the pre-migration dataset:
 *   1. siteSettings.partners[] / .funders[] — inline logo objects
 *      { _key, _type: "logo", name, logo: {asset: {_ref}} }
 *   2. report.attribution.fundedBy (string), .partners (string[])
 *
 * After migration:
 *   - All unique organizations exist as standalone `organization` documents
 *     with deterministic ids (`organization.<slug>`), keyed by lowercase name.
 *   - siteSettings.partners[] / .funders[] become arrays of references.
 *   - Every report's attribution.fundedBy is a reference (or null).
 *   - Every report's attribution.partners[] is an array of references.
 *
 * Safety:
 *   - Defaults to DRY-RUN. Requires --commit to actually write.
 *   - Idempotent: skips items already in reference form.
 *   - Deterministic ids so re-running produces the same graph.
 *   - Prints a full plan (what would change) before committing.
 *
 * Usage:
 *   node scripts/migrate-organizations.mjs          # dry-run
 *   node scripts/migrate-organizations.mjs --commit # actually write
 *
 * Requires: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET (default "production"),
 *           SANITY_API_WRITE_TOKEN (falls back to SANITY_API_READ_TOKEN for dry-run reads).
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const COMMIT = process.argv.includes("--commit");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

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
});

// -----------------------------------------------------------------------------

/** Consistent, URL-safe id-suffix from a display name. */
function slug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const orgId = (name) => `organization.${slug(name)}`;
const nameKey = (name) => (name || "").trim().toLowerCase();

function isReference(x) {
  return !!x && typeof x === "object" && x._type === "reference" && typeof x._ref === "string";
}

// -----------------------------------------------------------------------------

async function run() {
  console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY-RUN (read-only)"}`);
  console.log(`Project: ${projectId}  Dataset: ${dataset}`);
  console.log("");

  // 1. Fetch current siteSettings
  const settings = await client.fetch(`*[_type == "siteSettings"][0]{
    _id,
    partners[]{ _key, _type, name, "logoRef": logo.asset._ref },
    funders[]{ _key, _type, name, "logoRef": logo.asset._ref }
  }`);

  if (!settings) {
    console.error("No siteSettings document found. Aborting.");
    process.exit(1);
  }

  const settingsPartners = settings.partners ?? [];
  const settingsFunders = settings.funders ?? [];

  console.log(`siteSettings has ${settingsPartners.length} partner entries, ${settingsFunders.length} funder entries.`);

  // 2. Fetch all reports with attribution containing legacy string data
  const reports = await client.fetch(`*[_type == "report"]{
    _id,
    title,
    "attribution": attribution{
      projectName,
      fundedBy,
      partners,
      note
    }
  }`);
  console.log(`Fetched ${reports.length} reports.`);
  console.log("");

  // 3. Build the org catalog. Keyed by lowercased name for dedup.
  //    Value: { name (canonical), logoRef (Sanity asset _ref | null) }
  const catalog = new Map();

  const registerOrg = (name, logoRef) => {
    if (!name) return;
    const key = nameKey(name);
    const existing = catalog.get(key);
    if (existing) {
      // Prefer keeping a logoRef if we find one for a name that had none.
      if (!existing.logoRef && logoRef) existing.logoRef = logoRef;
      return;
    }
    catalog.set(key, { name: name.trim(), logoRef: logoRef ?? null });
  };

  for (const p of settingsPartners) {
    if (isReference(p)) continue;
    registerOrg(p.name, p.logoRef);
  }
  for (const f of settingsFunders) {
    if (isReference(f)) continue;
    registerOrg(f.name, f.logoRef);
  }
  for (const r of reports) {
    const a = r.attribution;
    if (!a) continue;
    if (typeof a.fundedBy === "string" && a.fundedBy.trim()) {
      registerOrg(a.fundedBy, null);
    }
    if (Array.isArray(a.partners)) {
      for (const p of a.partners) {
        if (typeof p === "string" && p.trim()) registerOrg(p, null);
      }
    }
  }

  console.log(`Unique organizations to create/upsert: ${catalog.size}`);
  for (const o of catalog.values()) {
    console.log(`  - ${o.name}${o.logoRef ? "  (has logo)" : ""}`);
  }
  console.log("");

  // 4. Plan the writes
  const orgDocs = Array.from(catalog.values()).map((o) => {
    const _id = orgId(o.name);
    const doc = { _id, _type: "organization", name: o.name };
    if (o.logoRef) {
      doc.logo = { _type: "image", asset: { _type: "reference", _ref: o.logoRef } };
    }
    return doc;
  });

  const refFor = (name) => ({
    _type: "reference",
    _ref: orgId(name),
    _key: randomUUID().slice(0, 12),
  });

  // Rewrite siteSettings partners/funders arrays. Preserve existing _key values.
  const newSettingsPartners = settingsPartners.map((p) => {
    if (isReference(p)) return p; // already migrated
    return {
      _type: "reference",
      _key: p._key,
      _ref: orgId(p.name),
    };
  });
  const newSettingsFunders = settingsFunders.map((f) => {
    if (isReference(f)) return f;
    return {
      _type: "reference",
      _key: f._key,
      _ref: orgId(f.name),
    };
  });

  // Plan per-report attribution rewrites
  const reportPatches = [];
  for (const r of reports) {
    const a = r.attribution;
    if (!a) continue;

    const set = {};
    let needsPatch = false;

    if (typeof a.fundedBy === "string" && a.fundedBy.trim()) {
      set["attribution.fundedBy"] = {
        _type: "reference",
        _ref: orgId(a.fundedBy),
      };
      needsPatch = true;
    }
    if (Array.isArray(a.partners) && a.partners.length && typeof a.partners[0] === "string") {
      set["attribution.partners"] = a.partners
        .filter((p) => typeof p === "string" && p.trim())
        .map((p) => refFor(p));
      needsPatch = true;
    }
    if (needsPatch) {
      reportPatches.push({ id: r._id, title: r.title, set });
    }
  }

  console.log(`Report attributions to rewrite: ${reportPatches.length}`);
  for (const p of reportPatches) {
    console.log(`  - ${p.title} (${p.id})`);
    for (const [k, v] of Object.entries(p.set)) {
      if (Array.isArray(v)) {
        console.log(`      ${k} = [${v.map((r) => r._ref).join(", ")}]`);
      } else {
        console.log(`      ${k} = ${v._ref}`);
      }
    }
  }
  console.log("");

  if (!COMMIT) {
    console.log("Dry-run complete. Re-run with --commit to apply the changes above.");
    return;
  }

  // 5. Execute
  console.log("Committing organizations...");
  const tx = client.transaction();
  for (const doc of orgDocs) tx.createOrReplace(doc);
  await tx.commit();
  console.log(`  ${orgDocs.length} organizations upserted.`);

  console.log("Patching siteSettings...");
  await client
    .patch(settings._id)
    .set({ partners: newSettingsPartners, funders: newSettingsFunders })
    .commit();
  console.log("  siteSettings partners/funders now reference organizations.");

  console.log("Patching report attributions...");
  for (const p of reportPatches) {
    await client.patch(p.id).set(p.set).commit();
    console.log(`  ${p.title} → migrated.`);
  }

  console.log("");
  console.log("Migration complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
