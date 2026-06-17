import type { ReactNode } from "react";
import type { Kpi } from "@/lib/types";
import { Button, HighlightMarker, SectionEyebrow, KpiGrid } from "@/components/ds";
import { ConcentricField } from "./ConcentricField";

/** Hero — dark navy, concentric field, highlight marker on one word.
 * Copy defaults to the approved canvas text; CMS homeContent can override later. */
export function Hero({
  eyebrow = "— The DSA only works if someone is watching",
  lead = "DSA-Monitor publishes independent compliance research on Meta, TikTok, YouTube, and X — analysing how Europe's largest platforms moderate content, run advertising, and protect users in practice.",
  headline,
}: {
  eyebrow?: string;
  lead?: string;
  headline?: ReactNode;
}) {
  return (
    <section className="hero">
      <ConcentricField className="hero__field" />
      <div className="wrap hero__inner">
        <p className="hero__eyebrow dsa-label">{eyebrow}</p>
        <h1>
          {headline ?? (
            <>
              Holding very large platforms{" "}
              <HighlightMarker>accountable</HighlightMarker> to the Digital
              Services Act.
            </>
          )}
        </h1>
        <p className="hero__lead">{lead}</p>
        <div className="hero__actions">
          <Button variant="primary" as="a" href="/publications">
            Browse publications
          </Button>
          <Button variant="secondary" onInverse as="a" href="/about">
            About DSA-Monitor
          </Button>
        </div>
      </div>
    </section>
  );
}

/** KpiStrip — exactly three automated site-level counts. */
export function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <section className="kpiband">
      <div className="wrap">
        <KpiGrid items={items} />
      </div>
    </section>
  );
}

/** KPI strip loading placeholder — neutral skeleton, never a literal "0". */
export function KpiStripLoading() {
  return (
    <section className="kpiband">
      <div className="wrap">
        <div
          className="kpiload"
          aria-busy="true"
          aria-label="Loading site statistics"
        >
          {[0, 1, 2].map((i) => (
            <div className="kpiload__cell" key={i}>
              <div className="kpiload__num" />
              <div className="kpiload__label" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** "Evidence regulators can act on." — three numbered boxes. */
export function EvidenceBoxes() {
  const boxes = [
    {
      n: "01",
      h: "Investigate",
      p: "Systematic studies of advertising, recommender systems, content moderation, and risk on very large online platforms.",
    },
    {
      n: "02",
      h: "Document",
      p: "Every report ships with full methodology, dataset description, and limitations — no black-box findings.",
    },
    {
      n: "03",
      h: "Translate",
      p: "Findings mapped explicitly to DSA articles so regulators and journalists can act on the evidence.",
    },
  ];
  return (
    <section className="band band--canvas band--toppad">
      <div className="wrap">
        <div className="section-head">
          <h2>Evidence regulators can act on.</h2>
        </div>
        <div className="trio">
          {boxes.map((b) => (
            <div className="trio__cell" key={b.n}>
              <p className="trio__num dsa-label">{b.n}</p>
              <h3>{b.h}</h3>
              <p>{b.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** "How we work" — What we do + Why we do it, merged into one hairline panel. */
export function HowWeWork() {
  return (
    <section className="band band--sky band--toppad">
      <div className="wrap">
        <SectionEyebrow index="03" label="How we work" />
        <div className="howwork">
          <div className="howwork__cell">
            <span className="howwork__label dsa-label hl-sky">What we do</span>
            <h2>
              Empirical research on platform{" "}
              <span className="hl-sky">compliance</span>.
            </h2>
            <span className="placeholder-note">
              Placeholder · copy pending from client
            </span>
            <p>
              DSA-Monitor designs and runs reproducible studies of how very
              large online platforms operate in practice — from ad-library
              scrapes and recommender audits to removal-latency and youth-safety
              tests.
            </p>
            <p>
              Each study targets a specific obligation under the Digital
              Services Act, states its method up front, and publishes its
              dataset so the finding can be checked and built on.
            </p>
          </div>
          <div className="howwork__cell">
            <span className="howwork__label dsa-label hl-sky">
              Why we do it
            </span>
            <h2>
              Enforcement needs independent{" "}
              <span className="hl-sky">evidence</span>.
            </h2>
            <span className="placeholder-note">
              Placeholder · copy pending from client
            </span>
            <p>
              The DSA gives regulators real powers, but those powers depend on a
              clear, public record of what platforms are actually doing.
              Self-reported transparency is not enough.
            </p>
            <p>
              As an independent, non-commercial institute and certified Trusted
              Flagger, ÖIAT supplies that record — methodology-first, citable,
              and free of platform framing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Closer — statement + CTA on dark navy. */
export function ConvictionCloser() {
  return (
    <section className="band band--inverse cta">
      <ConcentricField className="hero__field" />
      <div className="wrap cta__grid">
        <h2>
          The DSA only works if <HighlightMarker>someone is</HighlightMarker>{" "}
          watching.
        </h2>
        <div className="cta__body">
          <p>
            The Digital Services Act obliges very large platforms to assess and
            mitigate systemic risks — but enforcement depends on independent
            evidence.
          </p>
          <p>
            ÖIAT has tracked online consumer harm in Austria since 1997.
            DSA-Monitor channels that work into a public, structured record the
            European Commission and national authorities can act on.
          </p>
          <div className="cta__actions">
            <Button variant="primary" as="a" href="/publications">
              Browse publications
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Language indicator used on article meta. */
export function LangTags({ languages }: { languages?: string[] }) {
  if (!languages || !languages.length) return null;
  return (
    <span
      className="article__lang"
      aria-label={`Available in ${languages.join(" and ")}`}
    >
      {languages.map((l) => (
        <span className="langtag" key={l}>
          {l}
        </span>
      ))}
    </span>
  );
}
