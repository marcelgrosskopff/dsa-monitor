/**
 * Upload partner/funder logo files as Sanity image assets and wire them onto the
 * siteSettings.partners[] / funders[] entries by matching _key.
 *
 * Usage: node scripts/upload-logos.mjs /abs/path/to/logos/dir
 * Requires: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or write token");
  process.exit(1);
}

// Defaults to scripts/logos/ (the staged ÖIAT logo set); override with an arg.
const logosDir = process.argv[2] || resolve(__dirname, "logos");

const client = createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });

// Map siteSettings array _key -> { file, label } in the logos dir.
const PARTNER_LOGOS = {
  p1: { file: "oiat.png", label: "ÖIAT" },
  p2: { file: "oiat-research.png", label: "ÖIAT Research" },
  p3: { file: "internet-ombudsstelle.png", label: "Internet Ombudsstelle (IO)" },
  p4: { file: "saferinternet.png", label: "Saferinternet.at" },
  p5: { file: "watchlist-internet.jpg", label: "Watchlist Internet" },
  p6: { file: "digitale-seniorinnen.png", label: "Digitale Senior:innen" },
};
const FUNDER_LOGOS = {
  f1: { file: "netidee.jpg", label: "netidee" },
};

async function uploadOne(file, label) {
  const buf = readFileSync(resolve(logosDir, file));
  const asset = await client.assets.upload("image", buf, { filename: file, label });
  console.log(`  uploaded ${file} -> ${asset._id}`);
  return asset._id;
}

async function run() {
  const patches = {};

  console.log("Uploading partner logos…");
  for (const [key, { file, label }] of Object.entries(PARTNER_LOGOS)) {
    const assetId = await uploadOne(file, label);
    patches[`partners[_key=="${key}"].logo`] = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
    };
  }

  console.log("Uploading funder logos…");
  for (const [key, { file, label }] of Object.entries(FUNDER_LOGOS)) {
    const assetId = await uploadOne(file, label);
    patches[`funders[_key=="${key}"].logo`] = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
    };
  }

  // siteSettings is a published singleton; patching the bare id edits it directly.
  console.log("Patching siteSettings…");
  await client.patch("siteSettings").set(patches).commit();

  console.log("Done. All 6 partner + 1 funder logos uploaded and linked.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
