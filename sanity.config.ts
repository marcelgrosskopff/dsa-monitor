"use client";

import { defineConfig, type Template } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { defineLocations, presentationTool } from "sanity/presentation";
import { assist } from "@sanity/assist";
import { apiVersion, dataset, projectId, studioUrl } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import { SINGLETONS } from "./sanity/schemas/documents";

// Initial-value templates — filter out singletons so they don't appear as
// "New" options in the global create menu. Reports use Sanity's default.
const templates = (prev: Template[]): Template[] =>
  prev.filter((t) => !SINGLETONS.includes(t.id));

export default defineConfig({
  name: "dsa-monitor",
  title: "DSA-Monitor",
  basePath: studioUrl,
  projectId: projectId || "placeholder",
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons: no "create new" action; edited as single documents via the desk.
    templates,
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (item) => !SINGLETONS.includes(item.templateId)
        );
      }
      return prev;
    },
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(({ action }) =>
            ["publish", "discardChanges", "restore"].includes(action as string)
          )
        : prev,
  },
  plugins: [
    assist(),
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        origin: typeof location === "undefined" ? undefined : location.origin,
        draftMode: {
          enable: "/api/draft",
          disable: "/api/disable-draft",
        },
      },
      resolve: {
        locations: {
          // Each document type maps to the URL that previews it.
          report: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title ?? "Untitled report",
                  href: `/publications/${doc?.slug ?? ""}`,
                },
                { title: "Publications hub", href: "/publications" },
              ],
            }),
          }),
          topic: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "Publications hub", href: "/publications" }] }),
          }),
          resourceGroup: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "Resources", href: "/resources" }] }),
          }),
          siteSettings: defineLocations({
            select: {},
            resolve: () => ({
              locations: [
                { title: "Home", href: "/" },
                { title: "About", href: "/about" },
              ],
            }),
          }),
          homeContent: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "Home", href: "/" }] }),
          }),
          aboutContent: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "About", href: "/about" }] }),
          }),
          impressumContent: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "Impressum", href: "/impressum" }] }),
          }),
          privacyContent: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "Privacy", href: "/privacy" }] }),
          }),
          publicationsContent: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "Publications", href: "/publications" }] }),
          }),
          resourcesContent: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: "Resources", href: "/resources" }] }),
          }),
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
