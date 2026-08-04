import { Suspense } from "react";
import type { Metadata } from "next";
import { Page } from "@/components/blocks/Page";
import { SectionEyebrow } from "@/components/ds";
import { PublicationsClient } from "@/components/publications/PublicationsClient";
import { getPublicationsContent, getReportsPaged, getTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

// No args: this route already awaits searchParams, and reading them here would
// make the canonical URL vary by query string.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Publications",
    description:
      "Independent, methods-first compliance research on very large online platforms. Filter by topic; every report ships with its full methodology, limitations, and downloadable evidence.",
    path: "/publications",
    cms: await getPublicationsContent(),
  });
}

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; page?: string }>;
}) {
  const { topic, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const activeTopic = topic ?? null;

  const [{ reports, totalCount, pageCount }, topics, pubContent] =
    await Promise.all([
      getReportsPaged({ topic: activeTopic, page }),
      getTopics(),
      getPublicationsContent(),
    ]);

  return (
    <Page current="/publications">
      <div className="band--canvas">
        <div className="wrap pagehead">
          <SectionEyebrow label={pubContent.eyebrowLabel || "Publications"} />
          <h1>{pubContent.heading || "Publications."}</h1>
          <p>
            {pubContent.description ||
              "Independent, methods-first compliance research on very large online platforms. Filter by topic; every report ships with its full methodology, limitations, and downloadable evidence."}
          </p>
        </div>
      </div>

      <section className="band band--canvas band--tight">
        <div className="wrap">
          <Suspense
            fallback={
              <p className="filtercount dsa-label">
                {pubContent.loadingLabel || "Loading…"}
              </p>
            }
          >
            <PublicationsClient
              reports={reports}
              topics={topics}
              totalCount={totalCount}
              currentPage={page}
              pageCount={pageCount}
              activeTopic={activeTopic}
              filterAllLabel={pubContent.filterAllLabel}
              filterEmptyHeading={pubContent.filterEmptyHeading}
              filterEmptyBody={pubContent.filterEmptyBody}
              countLabel={pubContent.countLabel}
              clearFilterLabel={pubContent.clearFilterLabel}
              paginationPrevLabel={pubContent.paginationPrevLabel}
              paginationNextLabel={pubContent.paginationNextLabel}
              cardReadLabel={pubContent.cardReadLabel}
            />
          </Suspense>
        </div>
      </section>
    </Page>
  );
}
