export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** True only when a real Sanity project id is configured. When false, the app serves
 *  the typed seed content (lib/seed-data.ts) so it runs before the dataset exists. */
export const sanityConfigured = projectId.length > 0;

export const studioUrl = "/studio";
