import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { purgeCache } from "@netlify/functions";
import type { NextRequest } from "next/server";

// Sanity webhook → on-demand revalidation. Configure a webhook in Sanity manage
// pointing at this route with the secret SANITY_REVALIDATE_SECRET. Edits go live
// without a manual rebuild.

const TAG_FOR_TYPE: Record<string, string> = {
  report: "report",
  topic: "topic",
  resourceGroup: "resource",
  siteSettings: "settings",
  homeContent: "settings",
  aboutContent: "settings",
  impressumContent: "settings",
  privacyContent: "settings",
  publicationsContent: "settings",
  resourcesContent: "settings",
};

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }
    const type = body?._type;
    const tag = type ? TAG_FOR_TYPE[type] : undefined;
    if (!tag) {
      return Response.json({ revalidated: false, reason: "no matching tag", type });
    }
    // Next 16: revalidateTag requires a cacheLife profile argument.
    revalidateTag(tag, "max");
    // Also purge Netlify's edge cache — revalidateTag only touches Next's
    // internal cache, so without this the edge keeps serving stale HTML.
    try {
      await purgeCache({ tags: [tag] });
    } catch (purgeErr) {
      console.error("[revalidate] Netlify purgeCache failed:", purgeErr);
    }
    return Response.json({ revalidated: true, tag, type });
  } catch (err) {
    return new Response(
      err instanceof Error ? err.message : "Revalidation error",
      { status: 500 }
    );
  }
}
