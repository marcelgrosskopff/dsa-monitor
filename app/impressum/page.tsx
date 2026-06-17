import type { Metadata } from "next";
import { Page } from "@/components/blocks/Page";
import { RichBody } from "@/components/PortableBody";
import { SectionEyebrow } from "@/components/ds";
import { getImpressumContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Impressum",
  description: "Legal notice and disclosure for DSA-Monitor, published by ÖIAT.",
  path: "/impressum",
});

export default async function ImpressumPage() {
  const content = await getImpressumContent();
  return (
    <Page current="/about">
      <div className="band--canvas">
        <div className="wrap pagehead">
          <SectionEyebrow index="01" label="Legal notice" />
          <h1>Impressum.</h1>
          <p>
            {content.intro || "Disclosure under §§ 24, 25 Mediengesetz and § 5 E-Commerce-Gesetz."}
          </p>
        </div>
      </div>
      <section className="wrap legal">
        {content.body?.length ? (
          <RichBody value={content.body} />
        ) : (
          <div className="legal__grid">
            <div className="legal__item">
              <h2>Media owner &amp; publisher</h2>
              <address>
                Österreichisches Institut für angewandte Telekommunikation (ÖIAT)
                <br />
                Ungargasse 64–66/3/404
                <br />
                1030 Wien, Austria
                <br />
                Tel: +43 (0)1 595 21 12
              </address>
            </div>
            <div className="legal__item">
              <h2>Contact</h2>
              <p>
                General enquiries and press:{" "}
                <a href="mailto:research@oiat.at">research@oiat.at</a>
              </p>
            </div>
            <div className="legal__item">
              <h2>Registration &amp; representation</h2>
              <p>
                Legal form, register number (ZVR), supervisory authority and
                authorised representatives to be supplied by ÖIAT.
              </p>
            </div>
            <div className="legal__item">
              <h2>Purpose &amp; orientation</h2>
              <p>
                DSA-Monitor is a non-commercial public-interest research portal
                publishing independent compliance research on very large online
                platforms under the EU Digital Services Act.
              </p>
            </div>
            <div className="legal__item">
              <h2>Press</h2>
              <p>
                Press enquiries:{" "}
                <a href="mailto:research@oiat.at">research@oiat.at</a>
              </p>
            </div>
            <div className="legal__item">
              <h2>Copyright</h2>
              <p>
                Unless noted otherwise, content is published under CC BY-SA 4.0.
              </p>
            </div>
            <span className="placeholder-note">
              Placeholder · add full legal content in Studio → Impressum copy → body
            </span>
          </div>
        )}
      </section>
    </Page>
  );
}
