import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/blocks/Page";
import { ResearchCardX } from "@/components/blocks/ResearchCardX";
import { LangTags } from "@/components/blocks/sections";
import { RichBody } from "@/components/PortableBody";
import {
  CategoryShape,
  KpiGrid,
  OutboundLink,
  TopicChip,
} from "@/components/ds";
import {
  getPublicationsContent,
  getRelatedReports,
  getReport,
  getReportSlugs,
} from "@/lib/content";
import { reportJsonLd, reportMetadata } from "@/lib/seo";
import type { Attribution } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getReportSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) return {};
  return reportMetadata(report);
}

function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function AttributionBlock({ a, label }: { a: Attribution; label?: string }) {
  const fundedByNames = (a.fundedBy ?? []).map((f) => f.name).filter(Boolean);
  const fundedByPhrase = joinNames(fundedByNames);
  const partnerNames = (a.partners ?? []).map((p) => p.name).filter(Boolean);
  const sentence1 =
    a.projectName && fundedByPhrase
      ? `${a.projectName} — funded by ${fundedByPhrase}.`
      : a.projectName || (fundedByPhrase ? `Funded by ${fundedByPhrase}.` : "");
  const sentence2 = partnerNames.length
    ? `In cooperation with ${joinNames(partnerNames)}.`
    : "";
  const note = a.note || "";
  const orgsWithLogos = [
    ...(a.fundedBy ?? []),
    ...(a.partners ?? []),
  ].filter((o) => o?.logoUrl);
  if (!sentence1 && !sentence2 && !note && !orgsWithLogos.length) return null;
  return (
    <div className="article__section">
      <div className="attribution">
        <span className="dsa-label">{label || "Project & funding"}</span>
        {sentence1 && <p>{sentence1}</p>}
        {sentence2 && <p>{sentence2}</p>}
        {orgsWithLogos.length > 0 && (
          <ul className="attribution__logos" aria-label="Funders and partners">
            {orgsWithLogos.map((o, i) => (
              <li key={`${o.name}-${i}`}>
                {o.url ? (
                  <a href={o.url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.logoUrl} alt={o.name} loading="lazy" />
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.logoUrl} alt={o.name} loading="lazy" />
                )}
              </li>
            ))}
          </ul>
        )}
        {note && <p>{note}</p>}
      </div>
    </div>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [report, pubContent] = await Promise.all([
    getReport(slug),
    getPublicationsContent(),
  ]);
  if (!report) notFound();

  const related = await getRelatedReports(slug, report.primaryTopic.label);
  const kpis = report.kpis.slice(0, 4);

  return (
    <Page current="/publications">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportJsonLd(report)) }}
      />
      <div className="band--canvas">
        <div className="article">
          <Link className="backlink" href="/publications">
            {pubContent.reportBackLabel || "← All publications"}
          </Link>

          <header className="dsa-articlehead dsa-articlehead--split">
            <CategoryShape
              swatch={report.swatch}
              className="dsa-articlehead__shape"
            />
            <div className="dsa-articlehead__body">
              <p className="dsa-articlehead__meta dsa-label">{report.date}</p>
              <h1 className="dsa-articlehead__title">{report.title}</h1>
              {report.subtitle && (
                <p className="dsa-articlehead__summary">{report.subtitle}</p>
              )}
              <div className="dsa-articlehead__foot">
                {report.topics.map((t) => (
                  <TopicChip key={t.label} swatch={t.swatch} label={t.label} />
                ))}
                <LangTags languages={report.languages} />
              </div>
            </div>
          </header>

          {kpis.length > 0 && (
            <div className="article__section article__kpis-full">
              <div className="article__kpis">
                <KpiGrid items={kpis} />
              </div>
            </div>
          )}

          <div className="article__layout">
            <div className="article__main article__body">
              <div className="article__section">
                <h2>{pubContent.reportSummaryLabel || "Summary"}</h2>
                <RichBody value={report.body} lead />
              </div>

              {report.methodology && report.methodology.length > 0 && (
                <div className="article__section">
                  <h2>{pubContent.reportMethodologyLabel || "Methodology"}</h2>
                  <div className="methodology">
                    <RichBody value={report.methodology} />
                  </div>
                </div>
              )}

              {report.attribution && (
                <AttributionBlock a={report.attribution} label={pubContent.reportFundingLabel} />
              )}

              {report.source?.href && (
                <div className="article__section">
                  <p>
                    {pubContent.reportSourceLabel || "Source & replication"}:{" "}
                    <OutboundLink href={report.source.href}>
                      {report.source.label}
                    </OutboundLink>
                  </p>
                </div>
              )}

              {related.length > 0 && (
                <div className="article__section">
                  <h2>{pubContent.reportRelatedLabel || "Related publications"}</h2>
                  <div className="cardgrid">
                    {related.map((r) => (
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
                </div>
              )}

              <Link className="backlink backlink--foot" href="/publications">
                {pubContent.reportBackLabel || "← All publications"}
              </Link>
            </div>

            <aside className="rail">
              <section className="dlbox" aria-label="Download this report">
                <p className="dlbox__label dsa-label">{pubContent.reportDownloadLabel || "Download"}</p>
                <div className="dlbox__row">
                  {report.downloads.map((d, i) => {
                    const sub = [d.language, d.size].filter(Boolean).join(" · ");
                    const full = [d.language, d.format, d.size]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <a
                        key={i}
                        href={d.href}
                        download
                        className="dsa-download"
                        aria-label={`Download ${d.label} (${full})`}
                      >
                        <span aria-hidden="true" className="dsa-download__glyph">
                          {d.format}
                        </span>
                        <span className="dsa-download__text">
                          <span className="dsa-download__label">{d.label}</span>
                          <span className="dsa-download__sub dsa-label">
                            {sub}
                          </span>
                        </span>
                        <span aria-hidden="true" className="dsa-download__arrow">
                          ↓
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </Page>
  );
}
