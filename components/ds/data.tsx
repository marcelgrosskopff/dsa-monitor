import type { CSSProperties } from "react";
import type { Kpi } from "@/lib/types";

/**
 * KpiStat — Template A: one large highlight number + a short description.
 * The site's only data-viz (no charts). Number in extrabold Be Vietnam Pro.
 */
export function KpiStat({
  number,
  description,
}: {
  number: string;
  description?: string;
}) {
  return (
    <div className="dsa-kpi">
      <p className="dsa-kpi__num">{number}</p>
      {description && <p className="dsa-kpi__desc">{description}</p>}
    </div>
  );
}

/**
 * KpiGrid — Template B: a 1–4 item ruled grid of number + label, each with an
 * optional category top-rule. Numbers are not headings — rendered as a <dl> with
 * <dd> number + <dt> label. Capped at 4 (5th+ findings live in body prose).
 */
export function KpiGrid({ items = [] }: { items?: Kpi[] }) {
  const capped = items.slice(0, 4);
  const cols = Math.min(Math.max(capped.length, 1), 4);
  return (
    <dl className="dsa-kpi-grid" style={{ "--kpi-cols": cols } as CSSProperties}>
      {capped.map((it, i) => (
        <div
          key={i}
          className="dsa-kpi"
          style={
            it.accent
              ? ({
                  "--kpi-rule": `var(--category-${it.accent}-accent)`,
                } as CSSProperties)
              : undefined
          }
        >
          <dd className="dsa-kpi__num">{it.number}</dd>
          <dt className="dsa-kpi__label dsa-label">{it.label}</dt>
        </div>
      ))}
    </dl>
  );
}
