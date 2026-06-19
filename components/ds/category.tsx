import type { CSSProperties, ReactNode } from "react";
import type { Swatch, TopicRef } from "@/lib/types";
import { TopicChip } from "./topic-chip";

/**
 * CategoryShape — the per-category geometric line motif that replaces photography on
 * research cards and article headers. Abstract accent-stroke line-art on the category
 * tint; one motif per colour-role. Purely decorative (aria-hidden) — the topic is also
 * carried by the chip + title, so colour/shape is never the only signal.
 */
function motifs(accent: string): Record<string, ReactNode> {
  const c = { fill: "none", stroke: accent, strokeWidth: 1.5 };
  return {
    // Three evenly-spaced horizontal rules — neutral, not a target (annotation #9).
    red: (
      <>
        <line x1="12" y1="24" x2="108" y2="24" {...c} />
        <line x1="12" y1="40" x2="108" y2="40" {...c} />
        <line x1="12" y1="56" x2="108" y2="56" {...c} />
      </>
    ),
    // Concentric squares — neutral geometry, not a crossed-out box (annotation #9).
    blue: (
      <>
        <rect x="16" y="10" width="88" height="60" {...c} />
        <rect x="30" y="20" width="60" height="40" {...c} />
        <rect x="44" y="30" width="32" height="20" {...c} />
      </>
    ),
    // Three evenly spaced contour waves.
    orange: (
      <>
        <path d="M8 22 C38 8, 82 36, 112 22" {...c} />
        <path d="M8 40 C38 26, 82 54, 112 40" {...c} />
        <path d="M8 58 C38 44, 82 72, 112 58" {...c} />
      </>
    ),
    // 6×4 dot grid.
    purple: (
      <>
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <circle
              key={`${r}-${col}`}
              cx={15 + col * 18}
              cy={16 + r * 16}
              r="2.4"
              fill={accent}
              stroke="none"
            />
          ))
        )}
      </>
    ),
    // Apex-up triangle + a centred rule beneath it.
    coral: (
      <>
        <polygon points="60,12 94,64 26,64" {...c} />
        <line x1="44" y1="74" x2="76" y2="74" {...c} />
      </>
    ),
    // Centred ribbon / bookmark.
    green: <path d="M42 8 H78 V72 L60 56 L42 72 Z" {...c} />,
  };
}

export function CategoryShape({
  swatch = "blue",
  className = "",
}: {
  swatch?: Swatch;
  className?: string;
}) {
  const accent = `var(--category-${swatch}-accent)`;
  const tint = `var(--category-${swatch}-tint)`;
  const motif = motifs(accent)[swatch] ?? motifs(accent).blue;
  return (
    <div
      className={`dsa-shape ${className}`}
      style={{ "--sw-tint": tint, background: tint } as CSSProperties}
    >
      <svg
        viewBox="0 0 120 80"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {motif}
      </svg>
    </div>
  );
}

/**
 * ResearchCard — the core listing + Home "featured" unit (single-topic variant).
 * Anatomy: category shape band → mono meta line → ink title (the link) →
 * TopicChip + "Read report →". Sharp corners, 1px ink frame, no shadow.
 */
export function ResearchCard({
  swatch = "blue",
  meta,
  title,
  topicLabel,
  href = "#",
  languages = [],
}: {
  swatch?: Swatch;
  meta: string;
  title: string;
  topicLabel: string;
  href?: string;
  languages?: string[];
}) {
  return (
    <article className="dsa-card">
      <CategoryShape swatch={swatch} className="dsa-card__shape" />
      <div className="dsa-card__body">
        <div className="dsa-card__metarow">
          <p className="dsa-card__meta dsa-label">{meta}</p>
          {languages && languages.length ? (
            <span
              className="dsa-card__langs"
              aria-label={`Available in ${languages.join(" and ")}`}
            >
              {languages.map((l) => (
                <span key={l} className="dsa-card__langtag">
                  {l}
                </span>
              ))}
            </span>
          ) : null}
        </div>
        <h3 className="dsa-card__title">
          <a href={href}>{title}</a>
        </h3>
        <div className="dsa-card__foot">
          <TopicChip swatch={swatch} label={topicLabel} />
          <span className="dsa-card__more dsa-label" aria-hidden="true">
            Read report →
          </span>
        </div>
      </div>
    </article>
  );
}

/**
 * ArticleHeader — the research-detail header (one CMS template for all report types).
 * Anatomy: category shape band → mono meta → H1 title → lead summary → topic chip(s) + date.
 * Exactly one <h1> per page lives here.
 */
export function ArticleHeader({
  swatch = "blue",
  meta,
  title,
  summary,
  topics = [],
  date,
}: {
  swatch?: Swatch;
  meta?: string;
  title: string;
  summary?: string;
  topics?: TopicRef[];
  date?: string;
}) {
  return (
    <header className="dsa-articlehead">
      <CategoryShape swatch={swatch} className="dsa-articlehead__shape" />
      <div className="dsa-articlehead__body">
        <p className="dsa-articlehead__meta dsa-label">{meta}</p>
        <h1 className="dsa-articlehead__title">{title}</h1>
        {summary && <p className="dsa-articlehead__summary">{summary}</p>}
        <div className="dsa-articlehead__foot">
          {topics.map((t) => (
            <TopicChip key={t.label} swatch={t.swatch} label={t.label} />
          ))}
          {date && (
            <span className="dsa-articlehead__date dsa-label">{date}</span>
          )}
        </div>
      </div>
    </header>
  );
}
