import imageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = imageUrlBuilder({ projectId: projectId || "placeholder", dataset });

// Source is a Sanity image reference/object; kept loose to avoid a deep type import.
export function urlForImage(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
