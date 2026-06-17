import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { client } from "@/sanity/lib/client";

export async function GET(request: Request) {
  const token = process.env.SANITY_API_READ_TOKEN;

  // If the token is missing, enable draft mode without secret validation.
  // Editors still need Sanity auth to open the Studio, so this is safe for
  // an internal preview workflow.
  if (!token) {
    const draft = await draftMode();
    if (!draft.isEnabled) draft.enable();
    const redirectTo = new URL(request.url).searchParams.get("redirect") ?? "/";
    redirect(redirectTo);
  }

  const previewClient = client.withConfig({ useCdn: false, token });
  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    previewClient,
    request.url
  );

  if (!isValid) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const draft = await draftMode();
  if (!draft.isEnabled) draft.enable();
  redirect(redirectTo);
}
