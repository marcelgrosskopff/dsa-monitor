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
import { getReports, getSiteSettings, getTopics } from "@/lib/content";
import { siteStats } from "@/lib/counts";

export default async function HomePage() {
  const [reports, topics, settings] = await Promise.all([
    getReports(),
    getTopics(),
    getSiteSettings(),
  ]);
  const stats = siteStats(reports, topics, settings);
  const latest = reports.slice(0, 6);

  return (
    <Page current="/" navInverse>
      <Hero />
      <KpiStrip items={stats} />

      <section className="band band--canvas">
        <div className="wrap">
          <div className="section-head">
            <div>
              <SectionEyebrow index="02" label="Latest publications" />
              <h2>Recent reports on platform compliance and risk.</h2>
            </div>
            <Button variant="secondary" as="a" href="/publications">
              {`View all ${reports.length}`}
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
              <h3>Publications are on their way.</h3>
              <p>
                The first reports are being prepared for release. Check back
                shortly, or read about how DSA-Monitor works.
              </p>
            </div>
          )}
        </div>
      </section>

      <HowWeWork />
      <EvidenceBoxes />
      <div className="hatch" aria-hidden="true" />
      <ConvictionCloser />
    </Page>
  );
}
