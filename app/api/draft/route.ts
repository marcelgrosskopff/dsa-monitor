import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";

// Enables Next.js draft mode for the Sanity Presentation tool live preview.
// Uses the read token so unpublished drafts can be previewed.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
