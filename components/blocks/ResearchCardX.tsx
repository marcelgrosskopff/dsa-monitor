import type { Swatch, TopicRef } from "@/lib/types";
import { CategoryShape } from "@/components/ds/category";
import { TopicChip } from "@/components/ds/topic-chip";

/**
 * ResearchCardX — research card (extended). Mirrors the DS ResearchCard anatomy/classes
 * exactly, but supports MULTIPLE topic chips and puts "Read report →" on its own line.
 * `topics` is an optional [{label, swatch}] array; falls back to single topicLabel/swatch.
 */
export function ResearchCardX({
  swatch = "blue",
  meta,
  title,
  topicLabel,
  topics,
  languages = [],
  href = "#",
  readLabel,
}: {
  swatch?: Swatch;
  meta: string;
  title: string;
  topicLabel?: string;
  topics?: TopicRef[];
  languages?: string[];
  href?: string;
  readLabel?: string;
}) {
  const list: TopicRef[] =
    topics && topics.length
      ? topics
      : [{ label: topicLabel ?? "", swatch }];
  return (
    <article className="dsa-card">
      <CategoryShape swatch={swatch} className="dsa-card__shape" />
      <div className="dsa-card__body">
        <div className="dsa-card__topics">
          {list.map((t) => (
            <TopicChip key={t.label} swatch={t.swatch} label={t.label} />
          ))}
        </div>
        <h3 className="dsa-card__title">
          <a href={href}>{title}</a>
        </h3>
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
        <div className="dsa-card__foot dsa-card__foot--end">
          <span className="dsa-card__more dsa-label" aria-hidden="true">
            {readLabel || "Read report →"}
          </span>
        </div>
      </div>
    </article>
  );
}
