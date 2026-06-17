import type { ReactNode } from "react";

/**
 * DownloadButton — a report download. MUST look distinct from an outbound link.
 * Ink-framed block: file-type glyph (left) → label + sublabel → ↓ icon.
 * Bilingual reports = one button per language. Accessible name includes lang+format+size.
 */
export function DownloadButton({
  href = "#",
  label,
  language,
  format = "PDF",
  size,
  primary = false,
}: {
  href?: string;
  label: string;
  language?: string;
  format?: string;
  size?: string;
  primary?: boolean;
}) {
  const sub = [language, format, size].filter(Boolean).join(" · ");
  return (
    <a
      href={href}
      download
      className={"dsa-download" + (primary ? " dsa-download--primary" : "")}
      aria-label={`Download ${label} (${sub})`}
    >
      <span aria-hidden="true" className="dsa-download__glyph">
        {format}
      </span>
      <span className="dsa-download__text">
        <span className="dsa-download__label">{label}</span>
        <span className="dsa-download__sub dsa-label">{sub}</span>
      </span>
      <span aria-hidden="true" className="dsa-download__arrow">
        ↓
      </span>
    </a>
  );
}

/**
 * OutboundLink — an external resource (GitHub, platform transparency report).
 * Text link, underline, trailing diagonal ↗ — deliberately NOT a download.
 * Essential info is never hover-only; new-tab links say so in the accessible name.
 */
export function OutboundLink({
  href = "#",
  children,
  newTab = true,
}: {
  href?: string;
  children: ReactNode;
  newTab?: boolean;
}) {
  return (
    <a
      href={href}
      className="dsa-outbound"
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <span aria-hidden="true">↗</span>
      {newTab && <span className="dsa-sr-only">(opens in new tab)</span>}
    </a>
  );
}
