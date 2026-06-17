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
