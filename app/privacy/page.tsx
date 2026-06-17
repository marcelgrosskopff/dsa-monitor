import type { Metadata } from "next";
import { Page } from "@/components/blocks/Page";
import { RichBody } from "@/components/PortableBody";
import { SectionEyebrow } from "@/components/ds";
import { getPrivacyContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "Privacy notice and analytics disclosure for DSA-Monitor. Matomo runs cookieless and IP-anonymised.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const [content, matomoUrl] = await Promise.all([
    getPrivacyContent(),
    Promise.resolve(process.env.NEXT_PUBLIC_MATOMO_URL),
  ]);
  const optOutSrc = matomoUrl
    ? `${matomoUrl.replace(/\/$/, "")}/index.php?module=CoreAdminHome&action=optOut&language=en`
    : null;

  return (
    <Page current="/about">
      <div className="band--canvas">
        <div className="wrap pagehead">
          <SectionEyebrow index="01" label="Privacy" />
          <h1>Privacy.</h1>
          <p>
            {content.intro || "How DSA-Monitor handles data, and how to opt out of anonymised usage statistics."}
          </p>
        </div>
      </div>
      <section className="wrap legal">
        {content.body?.length && <RichBody value={content.body} />}
        <div className="legal__grid">
          <div className="legal__item">
            <h2>Analytics (Matomo)</h2>
            <p>
              We use Matomo, a self-hosted analytics tool operated by ÖIAT, to
              understand how the site is used. Matomo runs{" "}
              <strong>without cookies</strong> and with{" "}
              <strong>IP anonymisation</strong>, so no personal data is stored
              and no consent banner is required. We do not share analytics data
              with third parties.
            </p>
          </div>
          <div className="legal__item">
            <h2>Opt out</h2>
            <p>
              You can opt out of anonymous measurement at any time using the
              control below.
            </p>
            {optOutSrc ? (
              <iframe
                title="Matomo opt-out"
                src={optOutSrc}
                style={{
                  width: "100%",
                  minHeight: "200px",
                  border: "1px solid var(--color-border-default)",
                }}
              />
            ) : (
              <span className="placeholder-note">
                Opt-out control activates once the Matomo instance URL is
                configured.
              </span>
            )}
          </div>
        </div>
      </section>
    </Page>
  );
}
