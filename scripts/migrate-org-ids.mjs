/**
 * One-time fix: organization documents created by migrate-organizations.mjs got
 * ids like `organization.netidee`. Sanity treats any id containing a dot as a
 * PRIVATE path (like `drafts.`), invisible to unauthenticated queries — so the
 * public site could not dereference them and the partner/funder logos silently
 * vanished from the live site (draft mode uses a token, so previews looked fine).
 *
 * Fix: recreate each dotted-id organization under a dash-based id
 * (`organization.netidee` → `org-netidee`), repoint every reference
 * (siteSettings.partners/funders + report attribution.fundedBy/partners,
 * drafts included), then delete the dotted originals. Deleting last is a
 * safety net: Sanity refuses to delete a document that is still referenced.
 *
 * Dry-run by default; --commit to write. Idempotent.
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local"), quiet: true });

const COMMIT = process.argv.includes("--commit");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });

const newIdFor = (oldId) => oldId.replace(/^organization\./, "org-");

const remapRef = (ref, idMap) =>
  ref && typeof ref === "object" && idMap[ref._ref] ? { ...ref, _ref: idMap[ref._ref] } : ref;

async function run() {
  console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY-RUN (read-only)"}`);
  console.log(`Project: ${projectId}  Dataset: ${dataset}\n`);

  // 1. Dotted-id organizations
  const dotted = await client.fetch(
    `*[_type == "organization" && _id match "organization.*"]{ _id, name, logo, url }`
  );
  if (!dotted.length) {
    console.log("No dotted-id organizations found — nothing to do.");
    return;
  }
  const idMap = {};
  for (const o of dotted) idMap[o._id] = newIdFor(o._id);
  console.log(`Organizations to re-id: ${dotted.length}`);
  for (const o of dotted) console.log(`  ${o._id}  →  ${idMap[o._id]}  (${o.name})`);

  // 2. Every document (drafts included) referencing a dotted id
  const referrers = await client.fetch(
    `*[references($ids)]{ _id, _type, title, partners, funders, attribution }`,
    { ids: Object.keys(idMap) }
  );
  console.log(`\nDocuments with references to repoint: ${referrers.length}`);

  const patches = [];
  for (const doc of referrers) {
    const set = {};
    if (doc._type === "siteSettings") {
      if (Array.isArray(doc.partners)) set["partners"] = doc.partners.map((r) => remapRef(r, idMap));
      if (Array.isArray(doc.funders)) set["funders"] = doc.funders.map((r) => remapRef(r, idMap));
    }
    if (doc._type === "report" && doc.attribution) {
      if (Array.isArray(doc.attribution.fundedBy))
        set["attribution.fundedBy"] = doc.attribution.fundedBy.map((r) => remapRef(r, idMap));
      if (Array.isArray(doc.attribution.partners))
        set["attribution.partners"] = doc.attribution.partners.map((r) => remapRef(r, idMap));
    }
    if (Object.keys(set).length) {
      patches.push({ id: doc._id, title: doc.title ?? doc._type, set });
      console.log(`  · ${doc._id}  (${doc.title ?? doc._type})  fields: ${Object.keys(set).join(", ")}`);
    } else {
      console.log(`  · WEIRD ${doc._id} references a dotted id but no known field matched — inspect manually`);
    }
  }

  if (!COMMIT) {
    console.log("\nDry-run complete. Re-run with --commit to apply.");
    return;
  }

  // 3. Create the new-id org documents
  const tx = client.transaction();
  for (const o of dotted) {
    const doc = { _id: idMap[o._id], _type: "organization", name: o.name };
    if (o.logo) doc.logo = o.logo;
    if (o.url) doc.url = o.url;
    tx.createOrReplace(doc);
  }
  await tx.commit();
  console.log(`\n${dotted.length} organizations recreated with dash ids.`);

  // 4. Repoint references
  for (const p of patches) {
    await client.patch(p.id).set(p.set).commit();
    console.log(`  ✓ repointed ${p.id}`);
  }

  // 5. Delete the dotted originals (fails loudly if anything still references them)
  for (const oldId of Object.keys(idMap)) {
    try {
      await client.delete(oldId);
      console.log(`  ✓ deleted ${oldId}`);
    } catch (e) {
      console.error(`  ✗ could not delete ${oldId} — still referenced? ${e.message}`);
    }
  }

  console.log("\nMigration complete. Verify with an anonymous query + the live site.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
