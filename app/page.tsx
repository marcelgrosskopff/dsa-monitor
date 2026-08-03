import type { Metadata } from "next";
import { Page } from "@/components/blocks/Page";
import {
  ConvictionCloser,
  EvidenceBoxes,
  Hero,
  HowWeWork,
  KpiStrip,
} from "@/components/blocks/sections";
import { ResearchCardX } from "@/components/blocks/ResearchCardX";
import { Button, SectionEyebrow } from "@/components/ds";
import { getHomeContent, getReports, getTopics } from "@/lib/content";
import { siteStats } from "@/lib/counts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ path: "/" });

export default async function HomePage() {
  const [reports, topics, home] = await Promise.all([
    getReports(),
    getTopics(),
    getHomeContent(),
  ]);
  const stats = siteStats(reports, topics);
  const latest = reports.slice(0, 6);

  return (
    <Page current="/" navInverse>
      <Hero
        eyebrow={home.heroEyebrow}
        lead={home.heroLead}
        headlineBefore={home.heroHeadlineBefore}
        highlightWord={home.heroHighlightWord}
        headlineAfter={home.heroHeadlineAfter}
        ctaLabel={home.heroCtaLabel}
        secondaryLabel={home.heroSecondaryLabel}
      />
      <KpiStrip items={stats} />

      <section className="band band--canvas">
        <div className="wrap">
          <div className="section-head">
            <div>
              <SectionEyebrow index="01" label={home.latestEyebrow || "Latest publications"} />
              <h2>{home.latestHeading || "Recent reports on platform compliance and risk."}</h2>
            </div>
            <Button variant="secondary" as="a" href="/publications">
              {`${home.viewAllLabel || "View all"} ${reports.length}`}
            </Button>
          </div>

          {latest.length ? (
            <div className="cardgrid">
              {latest.map((r) => (
                <ResearchCardX
                  key={r.slug}
                  swatch={r.swatch}
                  meta={r.date}
                  title={r.title}
                  topicLabel={r.primaryTopic.label}
                  topics={r.topics}
                  languages={r.languages}
                  href={`/publications/${r.slug}`}
                />
              ))}
            </div>
          ) : (
            <div className="statebox">
              <h3>{home.emptyStateHeading || "Publications are on their way."}</h3>
              <p>{home.emptyStateBody || "The first reports are being prepared for release. Check back shortly, or read about how DSA Monitor works."}</p>
            </div>
          )}
        </div>
      </section>

      <HowWeWork
        eyebrow={home.howWeWorkEyebrow}
        whatLabel={home.howWeWorkWhatLabel}
        whatHeading={home.howWeDoItHeading}
        whatBody={home.howWeDoItBody}
        whyLabel={home.howWeWorkWhyLabel}
        whyHeading={home.whyWeDoItHeading}
        whyBody={home.whyWeDoItBody}
      />
      <EvidenceBoxes heading={home.evidenceHeading} boxes={home.evidenceBoxes} />
      <div className="hatch" aria-hidden="true" />
      <ConvictionCloser headline={home.closerHeadline} body={home.closerBody} />
    </Page>
  );
}
