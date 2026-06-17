import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";

export const { GET } = defineEnableDraftMode({
  // useCdn: false is required — validatePreviewUrl must hit the Sanity API
  // directly to read the preview-secret document, not a cached CDN response.
  client: client.withConfig({
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
  }),
});
