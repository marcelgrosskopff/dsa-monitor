import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  // ISR + on-demand revalidation drive freshness; the CDN serves cached reads.
  useCdn: true,
  perspective: "published",
});

// Used only when Next.js draft mode is active (Sanity Presentation tool).
// stega encodes field-path metadata into strings so the VisualEditing overlay
// can draw "click to edit" targets directly on the rendered page.
export const previewClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "previewDrafts",
  token: process.env.SANITY_API_READ_TOKEN,
  stega: {
    enabled: true,
    studioUrl: "/studio",
  },
});
