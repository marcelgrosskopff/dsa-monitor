/**
 * One-time migration: merge report.primaryTopic into a single ordered
 * report.topics list (primary FIRST), and repair corrupted references.
 *
 * Why: the schema had two fields (primaryTopic reference + topics array),
 * which confused editors — and a custom Studio dropdown stored references
 * pointing at `drafts.*` topic ids, which the public site cannot resolve
 * (visitors saw wrong/grey topics). The schema now has ONE ordered topics
 * list; the first entry is the primary (drives colour, shows first).
 *
 * What it does, per report (published + drafts):
 *   1. normalize every topic ref: strip a leading "drafts." (repair)
 *   2. new topics = [primaryTopic, ...existing topics] normalized + deduped,
 *      preserving order (primary first)
 *   3. set topics, unset primaryTopic
 *
 * Idempotent: reports with no primaryTopic and no drafts.* refs are skipped.
 * Dry-run by default; --commit to write.
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

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

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
  perspective: "raw",
});

const normalize = (ref) => ref.replace(/^drafts\./, "");

async function run() {
  console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY-RUN (read-only)"}`);
  console.log(`Project: ${projectId}  Dataset: ${dataset}\n`);

  const reports = await client.fetch(
    `*[_type == "report"]{ _id, title, "primary": primaryTopic._ref, "topics": topics[]._ref }`,
  );

  const patches = [];
  for (const r of reports) {
    const hadDraftRefs =
      (r.primary && r.primary.startsWith("drafts.")) ||
      (r.topics ?? []).some((t) => t.startsWith("drafts."));
    if (!r.primary && !hadDraftRefs) {
      console.log(`  · SKIP ${r._id} — already migrated`);
      continue;
    }
    const ordered = [];
    if (r.primary) ordered.push(normalize(r.primary));
    for (const t of r.topics ?? []) {
      const n = normalize(t);
      if (!ordered.includes(n)) ordered.push(n);
    }
    const refs = ordered.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: randomUUID().slice(0, 12),
    }));
    patches.push({ id: r._id, title: r.title, before: { primary: r.primary, topics: r.topics }, refs });
  }

  console.log(`\nReports to rewrite: ${patches.length}`);
  for (const p of patches) {
    console.log(`  · ${p.id}  (${p.title})`);
    console.log(`      primary: ${p.before.primary ?? "—"}  topics: ${JSON.stringify(p.before.topics)}`);
    console.log(`      →  topics: [${p.refs.map((x) => x._ref).join(", ")}]  (primaryTopic removed)`);
  }

  if (!COMMIT) {
    console.log("\nDry-run complete. Re-run with --commit to apply.");
    return;
  }

  for (const p of patches) {
    await client
      .patch(p.id)
      .set({ topics: p.refs })
      .unset(["primaryTopic"])
      .commit();
    console.log(`  ✓ ${p.title}`);
  }
  console.log("\nMigration complete.");
  console.log(
    "\nREMINDER: three topic documents have UNPUBLISHED draft renames (Ad libraries→Advertising, AI & platforms→Online Fraud, Algorithmic transparency→Protection of Minors). Publishing them re-labels every report using those topics — editorial review needed before publishing.",
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
