"use client";

import type { CSSProperties } from "react";
import type { Swatch } from "@/lib/types";

/**
 * TopicChip — the category swatch as a tag / filter chip.
 * Static tag: tint background, accent square marker + 1px accent frame, ink label.
 * Filter idle: white chip with a topic-coloured outline; hover tints it to feel pressable.
 * Filter selected: solid accent fill + white label = unambiguous ON.
 * One topic → one swatch, consistent everywhere.
 */
export function TopicChip({
  swatch = "blue",
  label,
  selected = false,
  asFilter = false,
  onToggle,
}: {
  swatch?: Swatch;
  label: string;
  selected?: boolean;
  asFilter?: boolean;
  onToggle?: () => void;
}) {
  const vars = {
    "--sw-accent": `var(--category-${swatch}-accent)`,
    "--sw-tint": `var(--category-${swatch}-tint)`,
  } as CSSProperties;
  const cls = `dsa-chip${asFilter ? " dsa-chip--filter" : ""}${
    selected ? " dsa-chip--selected" : ""
  }`;

  // Filter chips carry no marker — the outline (off) vs solid fill (on) is the toggle.
  if (asFilter) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onToggle}
        className={cls}
        style={vars}
      >
        {label}
      </button>
    );
  }
  return (
    <span className={cls} style={vars}>
      <span aria-hidden="true" className="dsa-chip__mark" />
      {label}
    </span>
  );
}
