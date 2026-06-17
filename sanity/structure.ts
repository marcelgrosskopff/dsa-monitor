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
                .filter("_type == 'report' && $topicId in topics[]._ref || primaryTopic._ref == $topicId")
                .params({ topicId })
            )
        ),
      S.documentTypeListItem("topic").title("Topics"),
      S.documentTypeListItem("resourceGroup").title("Resource groups"),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Home copy")
        .id("homeContent")
        .child(S.document().schemaType("homeContent").documentId("homeContent")),
      S.listItem()
        .title("About copy")
        .id("aboutContent")
        .child(S.document().schemaType("aboutContent").documentId("aboutContent")),
      S.listItem()
        .title("Impressum copy")
        .id("impressumContent")
        .child(S.document().schemaType("impressumContent").documentId("impressumContent")),
      S.listItem()
        .title("Privacy copy")
        .id("privacyContent")
        .child(S.document().schemaType("privacyContent").documentId("privacyContent")),
      S.listItem()
        .title("Publications copy")
        .id("publicationsContent")
        .child(S.document().schemaType("publicationsContent").documentId("publicationsContent")),
      S.listItem()
        .title("Resources copy")
        .id("resourcesContent")
        .child(S.document().schemaType("resourcesContent").documentId("resourcesContent")),
    ]);
