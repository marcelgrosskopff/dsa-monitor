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
    // Next 16: the second argument sets how long STALE content may still be
    // served while fresh content regenerates in the background. "max" gave a
    // ~5-minute stale window — editors thought publishing was broken because
    // the old page kept being served. { expire: 0 } = zero stale window: the
    // next request blocks briefly and returns fresh content immediately.
    revalidateTag(tag, { expire: 0 });
    console.log(`[revalidate] revalidateTag(${tag}, {expire: 0}) called for type=${type}`);
    // Also purge Netlify's edge cache — revalidateTag only touches Next's
    // internal cache, so without this the edge keeps serving stale HTML.
    let edgePurged = false;
    let edgePurgeError: string | undefined;
    try {
      await purgeCache({ tags: [tag] });
      edgePurged = true;
      console.log(`[revalidate] Netlify purgeCache({ tags: [${tag}] }) succeeded`);
    } catch (purgeErr) {
      edgePurgeError = purgeErr instanceof Error ? purgeErr.message : String(purgeErr);
      console.error(`[revalidate] Netlify purgeCache failed for tag=${tag}:`, edgePurgeError);
    }
    return Response.json({ revalidated: true, tag, type, edgePurged, edgePurgeError });
  } catch (err) {
    return new Response(
      err instanceof Error ? err.message : "Revalidation error",
      { status: 500 }
    );
  }
}
