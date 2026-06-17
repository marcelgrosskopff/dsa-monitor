import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { disable } = await draftMode();
  disable();
  const { searchParams } = new URL(request.url);
  redirect(searchParams.get("redirect") ?? "/");
}
