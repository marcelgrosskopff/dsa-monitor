import type { Metadata } from "next";
import { Page } from "@/components/blocks/Page";
import { SectionEyebrow } from "@/components/ds";
import { getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "DSA-Monitor is published by ÖIAT — an independent, non-commercial institute and certified DSA Trusted Flagger making platform compliance visible and actionable.",
  path: "/about",
});

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const email = settings.contactEmail || "research@oiat.at";

  return (
    <Page current="/about">
      <div className="band--canvas">
        <div className="wrap pagehead">
          <SectionEyebrow index="01" label="About" />
          <h1>About DSA-Monitor.</h1>
        </div>
      </div>
      <section className="wrap" style={{ paddingBottom: "var(--space-section)" }}>
        <p className="about__lead">
          An initiative of ÖIAT to make platform compliance with the Digital
          Services Act visible — and actionable.
        </p>
        <div className="about__cols">
          <div>
            <h2>About ÖIAT</h2>
            <p>
              DSA-Monitor is published by the Österreichisches Institut für
              angewandte Telekommunikation (ÖIAT), an independent, non-commercial
              institute that has tracked online consumer harm in Austria since
              1997. ÖIAT operates the Internet Ombudsstelle and Watchlist
              Internet, and is a certified Trusted Flagger under the Digital
              Services Act.
            </p>
            <h2>About the monitoring project</h2>
            <p>
              DSA-Monitor publishes empirical research on how very large online
              platforms moderate content, run advertising, and protect users —
              and maps each finding to the relevant DSA articles so the European
              Commission and national authorities can act on the evidence.
            </p>
            <p>
              Every report is methodology-first: it states how the study was run,
              describes its dataset, and names its limitations before any
              framing. Datasets and replication code are published wherever
              possible. No black-box findings.
            </p>
          </div>
          <div>
            <div className="about__facts">
              <dl>
                <div className="row">
                  <dt>Publisher</dt>
                  <dd>ÖIAT</dd>
                </div>
                <div className="row">
                  <dt>Active since</dt>
                  <dd>1997</dd>
                </div>
                <div className="row">
                  <dt>Status</dt>
                  <dd>DSA Trusted Flagger</dd>
                </div>
                <div className="row">
                  <dt>Licence</dt>
                  <dd>CC BY-SA 4.0</dd>
                </div>
                <div className="row">
                  <dt>Location</dt>
                  <dd>Wien, AT</dd>
                </div>
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
                For press enquiries, mention your outlet and deadline. We respond
                in English or German.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
