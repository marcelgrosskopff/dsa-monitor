/**
 * One-time migration: convert report.platforms from free-text strings to
 * references into a shared `platform` document library.
 *
 * Why: the platforms field was free text, so the same platform got typed
 * several ways ("Meta", "Meta (Facebook and Instagram)", "Meta (Facebook,
 * Instagram)"), and the homepage "platforms monitored" count either mis-counted
 * those as distinct or was pinned by a manual override. A reference library
 * dedupes structurally and makes the count self-correct.
 *
 * Taxonomy (agreed with client): ONE combined Meta entry, plus SEPARATE
 * Facebook and Instagram entries. Existing Meta-variant strings fold into the
 * combined entry; "Instagram" stays its own platform.
 *
 * Safety: dry-run by default (--commit to write). Idempotent. Dash-based ids
 * only (never dotted — dotted ids are private to anonymous queries). Any report
 * platform string NOT in the map below is created as its own platform (dash-
 * slugged) and logged, so nothing is silently dropped.
 *
 * Usage:  node scripts/migrate-platforms.mjs          (dry-run)
 *         node scripts/migrate-platforms.mjs --commit  (write)
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

const client = createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });

// Canonical platform library — { id, name }. Facebook is included even though
// no report uses it yet (client wants it available). Ids are dash-based.
const CANONICAL = [
  { id: "platform-meta", name: "Meta (Facebook, Instagram)" },
  { id: "platform-facebook", name: "Facebook" },
  { id: "platform-instagram", name: "Instagram" },
  { id: "platform-tiktok", name: "TikTok" },
  { id: "platform-google", name: "Google" },
  { id: "platform-youtube", name: "YouTube" },
  { id: "platform-aliexpress", name: "AliExpress" },
  { id: "platform-app-store", name: "App Store" },
  { id: "platform-bing", name: "Bing (Microsoft)" },
  { id: "platform-booking", name: "Booking.com" },
  { id: "platform-linkedin", name: "LinkedIn" },
  { id: "platform-pinterest", name: "Pinterest" },
  { id: "platform-snapchat", name: "Snapchat" },
  { id: "platform-x", name: "X" },
  { id: "platform-zalando", name: "Zalando" },
];

// Existing free-text string → canonical platform id. Meta variants fold together.
const STRING_TO_ID = {
  "Meta": "platform-meta",
  "Meta (Facebook and Instagram)": "platform-meta",
  "Meta (Facebook, Instagram)": "platform-meta",
  "Facebook": "platform-facebook",
  "Instagram": "platform-instagram",
  "TikTok": "platform-tiktok",
  "Google": "platform-google",
  "YouTube": "platform-youtube",
  "AliExpress": "platform-aliexpress",
  "App Store": "platform-app-store",
  "Bing (Microsoft)": "platform-bing",
  "Booking.com": "platform-booking",
  "LinkedIn": "platform-linkedin",
  "Pinterest": "platform-pinterest",
  "Snapchat": "platform-snapchat",
  "X": "platform-x",
  "Zalando": "platform-zalando",
};

const slug = (s) =>
  "platform-" +
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

const isRef = (x) => x && typeof x === "object" && x._type === "reference";

async function run() {
  console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY-RUN (read-only)"}`);
  console.log(`Project: ${projectId}  Dataset: ${dataset}\n`);

  const reports = await client.fetch(`*[_type == "report"]{ _id, title, "p": platforms }`);

  // Discover any string not covered by the map → create ad-hoc, log it.
  const extraPlatforms = new Map(); // id -> name
  for (const r of reports) {
    for (const s of r.p ?? []) {
      if (typeof s === "string" && !STRING_TO_ID[s]) {
        const id = slug(s);
        extraPlatforms.set(id, s);
        STRING_TO_ID[s] = id;
        console.log(`  ⚠ unmapped string "${s}" → will create ${id}`);
      }
    }
  }

  const platformDocs = [
    ...CANONICAL,
    ...[...extraPlatforms.entries()].map(([id, name]) => ({ id, name })),
  ];
  console.log(`\nPlatform library to create/upsert: ${platformDocs.length}`);
  for (const p of platformDocs) console.log(`  ${p.id}  —  ${p.name}`);

  // Plan per-report rewrites.
  const patches = [];
  for (const r of reports) {
    if (!Array.isArray(r.p) || r.p.length === 0) continue;
    if (r.p.every(isRef)) {
      console.log(`  · SKIP ${r._id} — already references`);
      continue;
    }
    const ids = [];
    for (const s of r.p) {
      if (typeof s !== "string") continue;
      const id = STRING_TO_ID[s];
      if (id && !ids.includes(id)) ids.push(id); // dedupe (Meta variants collapse)
    }
    const refs = ids.map((id) => ({ _type: "reference", _ref: id, _key: randomUUID().slice(0, 12) }));
    patches.push({ id: r._id, title: r.title, before: r.p, refs });
  }

  console.log(`\nReports to rewrite: ${patches.length}`);
  for (const p of patches) {
    console.log(`  · ${p.id}  (${p.title})`);
    console.log(`      ${JSON.stringify(p.before)}  →  [${p.refs.map((x) => x._ref).join(", ")}]`);
  }

  if (!COMMIT) {
    console.log("\nDry-run complete. Re-run with --commit to apply.");
    return;
  }

  const tx = client.transaction();
  for (const p of platformDocs) tx.createOrReplace({ _id: p.id, _type: "platform", name: p.name });
  await tx.commit();
  console.log(`\n${platformDocs.length} platform documents upserted.`);

  for (const p of patches) {
    await client.patch(p.id).set({ platforms: p.refs }).commit();
    console.log(`  ✓ ${p.title}`);
  }
  console.log("\nMigration complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
