"use client";

import { defineConfig, type Template } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { apiVersion, dataset, projectId, studioUrl } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import { SINGLETONS } from "./sanity/schemas/documents";

// Initial-value templates — the offer's "3 templates" survive as editor presets on the
// one report schema, plus a resource-entry preset.
const templates = (prev: Template[]): Template[] => [
  ...prev.filter((t) => !SINGLETONS.includes(t.id)),
  {
    id: "report-dossier",
    title: "Report — Dossier / Full Report",
    schemaType: "report",
    value: { articleType: "Dossier" },
  },
  {
    id: "report-short",
    title: "Report — Short Analysis",
    schemaType: "report",
    value: { articleType: "Study" },
  },
  {
    id: "report-policy",
    title: "Report — Policy Paper",
    schemaType: "report",
    value: { articleType: "Policy Paper" },
  },
];

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
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        origin: typeof location === "undefined" ? undefined : location.origin,
        draftMode: {
          enable: "/api/draft",
          disable: "/api/disable-draft",
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
