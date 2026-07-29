import type { Kpi } from "@/lib/types";
import { Button, HighlightMarker, SectionEyebrow, KpiGrid } from "@/components/ds";
import { RichBody } from "@/components/PortableBody";
import { ConcentricField } from "./ConcentricField";

/** Hero — dark navy, concentric field, highlight marker on one word.
 * Copy defaults to the approved canvas text; CMS homeContent can override via plain-string fields. */
export function Hero({
  eyebrow,
  lead,
  headlineBefore,
  highlightWord,
  headlineAfter,
  ctaLabel,
  secondaryLabel,
}: {
  eyebrow?: string;
  lead?: string;
  headlineBefore?: string;
  highlightWord?: string;
  headlineAfter?: string;
  ctaLabel?: string;
  secondaryLabel?: string;
}) {
  const displayEyebrow = eyebrow || "— The DSA only works if someone is watching";
  const displayLead = lead || "DSA Monitor publishes independent compliance research on Meta, TikTok, YouTube, and X — analysing how Europe's largest platforms moderate content, run advertising, and protect users in practice.";
  const hasCustomHeadline = headlineBefore || highlightWord || headlineAfter;
  return (
    <section className="hero">
      <ConcentricField className="hero__field" />
      <div className="wrap hero__inner">
        <p className="hero__eyebrow dsa-label">{displayEyebrow}</p>
        <h1>
          {hasCustomHeadline ? (
            <>
              {headlineBefore}{headlineBefore ? " " : ""}
              {highlightWord ? <HighlightMarker>{highlightWord}</HighlightMarker> : null}
              {headlineAfter ? ` ${headlineAfter}` : ""}
            </>
          ) : (
            <>
              Holding very large platforms{" "}
              <HighlightMarker>accountable</HighlightMarker> to the Digital
              Services Act.
            </>
          )}
        </h1>
        <p className="hero__lead">{displayLead}</p>
        <div className="hero__actions">
          <Button variant="primary" as="a" href="/publications">
            {ctaLabel || "Browse publications"}
          </Button>
          <Button variant="secondary" onInverse as="a" href="/about">
            {secondaryLabel || "About DSA Monitor"}
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

const EVIDENCE_FALLBACK = [
  {
    number: "01",
    heading: "Investigate",
    description: "Systematic studies of advertising, recommender systems, content moderation, and risk on very large online platforms.",
  },
  {
    number: "02",
    heading: "Document",
    description: "Every report ships with full methodology, dataset description, and limitations — no black-box findings.",
  },
  {
    number: "03",
    heading: "Translate",
    description: "Findings mapped explicitly to DSA articles so regulators and journalists can act on the evidence.",
  },
];

/** "Evidence regulators can act on." — three numbered boxes. */
export function EvidenceBoxes({
  heading,
  boxes,
}: {
  heading?: string;
  boxes?: Array<{ number: string; heading: string; description: string }>;
}) {
  const displayHeading = heading || "Evidence regulators can act on.";
  const displayBoxes = boxes?.length ? boxes : EVIDENCE_FALLBACK;
  return (
    <section className="band band--canvas band--toppad">
      <div className="wrap">
        <div className="section-head">
          <h2>{displayHeading}</h2>
        </div>
        <div className="trio">
          {displayBoxes.map((b) => (
            <div className="trio__cell" key={b.number}>
              <p className="trio__num dsa-label">{b.number}</p>
              <h3>{b.heading}</h3>
              <p>{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** "How we work" — What we do + Why we do it, merged into one hairline panel. */
export function HowWeWork({
  eyebrow,
  whatLabel,
  whatHeading,
  whatBody,
  whyLabel,
  whyHeading,
  whyBody,
}: {
  eyebrow?: string;
  whatLabel?: string;
  whatHeading?: string;
  whatBody?: unknown[];
  whyLabel?: string;
  whyHeading?: string;
  whyBody?: unknown[];
}) {
  return (
    <section className="band band--inverse band--toppad">
      <div className="wrap">
        <SectionEyebrow index="03" label={eyebrow || "How we work"} />
        <div className="howwork">
          <div className="howwork__cell">
            <span className="howwork__label dsa-label hl-sky">{whatLabel || "What we do"}</span>
            <h2>
              {whatHeading ?? (
                <>Empirical research on platform <span className="hl-sky">compliance</span>.</>
              )}
            </h2>
            {whatBody?.length ? (
              <RichBody value={whatBody} />
            ) : (
              <>
                <p>DSA Monitor designs and runs reproducible studies of how very large online platforms operate in practice — from ad-library scrapes and recommender audits to removal-latency and youth-safety tests.</p>
                <p>Each study targets a specific obligation under the Digital Services Act, states its method up front, and publishes its dataset so the finding can be checked and built on.</p>
              </>
            )}
          </div>
          <div className="howwork__cell">
            <span className="howwork__label dsa-label hl-sky">{whyLabel || "Why we do it"}</span>
            <h2>
              {whyHeading ?? (
                <>Enforcement needs independent <span className="hl-sky">evidence</span>.</>
              )}
            </h2>
            {whyBody?.length ? (
              <RichBody value={whyBody} />
            ) : (
              <>
                <p>The DSA gives regulators real powers, but those powers depend on a clear, public record of what platforms are actually doing. Self-reported transparency is not enough.</p>
                <p>As an independent, non-commercial institute and certified Trusted Flagger, ÖIAT supplies that record — methodology-first, citable, and free of platform framing.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Closer — statement + CTA on dark navy. */
export function ConvictionCloser({
  headline,
  body,
}: {
  headline?: string;
  body?: unknown[];
}) {
  return (
    <section className="band band--inverse cta">
      <ConcentricField className="hero__field" />
      <div className="wrap cta__grid">
        <h2>
          {headline ?? (
            <>The DSA only works if <HighlightMarker>someone is</HighlightMarker> watching.</>
          )}
        </h2>
        <div className="cta__body">
          {body?.length ? (
            <RichBody value={body} />
          ) : (
            <>
              <p>The Digital Services Act obliges very large platforms to assess and mitigate systemic risks — but enforcement depends on independent evidence.</p>
              <p>ÖIAT has tracked online consumer harm in Austria since 1997. DSA Monitor channels that work into a public, structured record the European Commission and national authorities can act on.</p>
            </>
          )}
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
