import type { StructureResolver } from "sanity/structure";

// Desk: page-copy + settings as singletons, reports grouped by topic, topics, resources.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("DSA-Monitor")
    .items([
      S.listItem()
        .title("Reports")
        .child(
          S.documentTypeList("report")
            .title("Reports")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),
      S.listItem()
        .title("Reports by topic")
        .child(
          S.documentTypeList("topic")
            .title("Topics")
            .child((topicId) =>
              S.documentList()
                .title("Reports")
                .filter("_type == 'report' && $topicId in topics[]._ref")
                .params({ topicId })
            )
        ),
      S.documentTypeListItem("topic").title("Topics"),
      S.documentTypeListItem("platform").title("Platforms"),
      S.documentTypeListItem("organization").title("Organizations"),
      S.documentTypeListItem("resourceGroup").title("Resource groups"),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Home page")
        .id("homeContent")
        .child(S.document().schemaType("homeContent").documentId("homeContent")),
      S.listItem()
        .title("About page")
        .id("aboutContent")
        .child(S.document().schemaType("aboutContent").documentId("aboutContent")),
      S.listItem()
        .title("Impressum page")
        .id("impressumContent")
        .child(S.document().schemaType("impressumContent").documentId("impressumContent")),
      S.listItem()
        .title("Privacy page")
        .id("privacyContent")
        .child(S.document().schemaType("privacyContent").documentId("privacyContent")),
      S.listItem()
        .title("Publications page")
        .id("publicationsContent")
        .child(S.document().schemaType("publicationsContent").documentId("publicationsContent")),
      S.listItem()
        .title("Resources page")
        .id("resourcesContent")
        .child(S.document().schemaType("resourcesContent").documentId("resourcesContent")),
      S.listItem()
        .title("404 page")
        .id("notFoundContent")
        .child(S.document().schemaType("notFoundContent").documentId("notFoundContent")),
    ]);
