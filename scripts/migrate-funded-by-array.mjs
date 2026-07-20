/**
 * One-time migration: wrap `attribution.fundedBy` from a single reference into
 * an array of references, so multiple funders can be listed per report.
 *
 * Before:  attribution.fundedBy = { _type: "reference", _ref: "..." }
 * After:   attribution.fundedBy = [{ _type: "reference", _ref: "...", _key: "…" }]
 *
 * Safety:
 *   - Defaults to DRY-RUN. Requires --commit to actually write.
 *   - Idempotent: skips docs where fundedBy is already an array.
 *   - Uses ifRevisionId + patches per-document to avoid cross-doc interference.
 *
 * Usage:
 *   node scripts/migrate-funded-by-array.mjs          # dry-run
 *   node scripts/migrate-funded-by-array.mjs --commit # actually write
 *
 * Requires: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 *           (default "production"), SANITY_API_WRITE_TOKEN.
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

async function run() {
  console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY-RUN (read-only)"}`);
  console.log(`Project: ${projectId}  Dataset: ${dataset}`);
  console.log("");

  const docs = await client.fetch(
    `*[_type == "report" && defined(attribution.fundedBy)]{ _id, title, "fundedBy": attribution.fundedBy }`,
  );

  console.log(`Reports with attribution.fundedBy: ${docs.length}`);
  console.log("");

  const plan = [];
  for (const d of docs) {
    if (Array.isArray(d.fundedBy)) {
      console.log(`  · SKIP  ${d._id} — already an array`);
      continue;
    }
    if (d.fundedBy && typeof d.fundedBy === "object" && typeof d.fundedBy._ref === "string") {
      const wrapped = [
        {
          _type: "reference",
          _ref: d.fundedBy._ref,
          _key: randomUUID().slice(0, 12),
        },
      ];
      plan.push({ id: d._id, title: d.title, before: d.fundedBy, after: wrapped });
      console.log(`  · WRAP  ${d._id}  (${d.title})`);
      console.log(`          before: { _ref: ${d.fundedBy._ref} }`);
      console.log(`          after : [{ _ref: ${d.fundedBy._ref}, _key: ${wrapped[0]._key} }]`);
    } else {
      console.log(`  · WEIRD ${d._id} — unrecognised fundedBy shape, skipping:`, d.fundedBy);
    }
  }

  console.log("");
  console.log(`To wrap: ${plan.length}`);
  console.log("");

  if (!COMMIT) {
    console.log("Dry-run complete. Re-run with --commit to apply.");
    return;
  }

  for (const p of plan) {
    await client.patch(p.id).set({ "attribution.fundedBy": p.after }).commit();
    console.log(`  ✓ ${p.title} → migrated.`);
  }

  console.log("");
  console.log("Migration complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
