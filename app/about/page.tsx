import type { Metadata } from "next";
import { Page } from "@/components/blocks/Page";
import { SectionEyebrow } from "@/components/ds";
import { getAboutContent, getSiteSettings } from "@/lib/content";
import { RichBody } from "@/components/PortableBody";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "DSA Monitor is published by OIAT — an independent, non-commercial institute and certified DSA Trusted Flagger making platform compliance visible and actionable.",
  path: "/about",
});

export default async function AboutPage() {
  const [settings, aboutContent] = await Promise.all([
    getSiteSettings(),
    getAboutContent(),
  ]);
  const email = settings.contactEmail || "research@oiat.at";

  const facts = [
    ["Publisher", settings.publisherName || "OIAT"],
    ["Active since", settings.activeSince || "1997"],
    ["Status", settings.orgStatus || "DSA Trusted Flagger"],
    ["Licence", settings.licence || "CC BY-SA 4.0"],
    ["Location", settings.locationLabel || "Wien, AT"],
  ];

  return (
    <Page current="/about">
      <div className="band--canvas">
        <div className="wrap pagehead">
          <SectionEyebrow index="01" label={aboutContent.eyebrowLabel || "About"} />
          <h1>{aboutContent.pageHeading || "About DSA Monitor."}</h1>
        </div>
      </div>
      <section className="wrap" style={{ paddingBottom: "var(--space-section)" }}>
        <p className="about__lead">
          {aboutContent.lead || "An initiative of OIAT to make platform compliance with the Digital Services Act visible — and actionable."}
        </p>
        <div className="about__cols">
          <div>
            {aboutContent.body?.length ? (
              <RichBody value={aboutContent.body} />
            ) : (
              <>
                <h2>About OIAT</h2>
                <p>DSA Monitor is published by the Österreichisches Institut für angewandte Telekommunikation (OIAT), an independent, non-commercial institute that has tracked online consumer harm in Austria since 1997. OIAT operates the Internet Ombudsstelle and Watchlist Internet, and is a certified Trusted Flagger under the Digital Services Act.</p>
                <h2>About the monitoring project</h2>
                <p>DSA Monitor publishes empirical research on how very large online platforms moderate content, run advertising, and protect users — and maps each finding to the relevant DSA articles so the European Commission and national authorities can act on the evidence.</p>
                <p>Every report is methodology-first: it states how the study was run, describes its dataset, and names its limitations before any framing. Datasets and replication code are published wherever possible. No black-box findings.</p>
              </>
            )}
          </div>
          <div>
            <div className="about__facts">
              <dl>
                {facts.map(([dt, dd]) => (
                  <div className="row" key={dt}>
                    <dt>{dt}</dt>
                    <dd>{dd}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="about__contact">
              <span
                className="dsa-label"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Contact
              </span>
              <p className="mail">
                <a href={`mailto:${email}`}>{email}</a>
              </p>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--fs-sm)",
                  margin: "var(--space-stack-sm) 0 0",
                }}
              >
                {aboutContent.pressNote || "For press enquiries, mention your outlet and deadline. We respond in English or German."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
