import type { ElementType, ReactNode } from "react";

/**
 * Button — the primary action across the site.
 * Variants: primary (solid red), secondary (ink outline), ghost (text + arrow).
 * Trailing → arrow is a brand signature. Renders a real <button> or, with as="a", an <a>.
 */
type ButtonProps = {
  as?: ElementType;
  variant?: "primary" | "secondary" | "ghost";
  arrow?: boolean;
  onInverse?: boolean;
  className?: string;
  children: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export function Button({
  as: Tag = "button",
  variant = "primary",
  arrow = true,
  onInverse = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = [
    "dsa-btn",
    `dsa-btn--${variant}`,
    onInverse ? "dsa-btn--on-inverse" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} {...props}>
      <span>{children}</span>
      {arrow && <span aria-hidden="true">→</span>}
    </Tag>
  );
}

/**
 * HighlightMarker — the inline solid-red box around one key word in a large headline.
 * Signature device. At most once per headline, on the load-bearing word. Never on body text.
 */
export function HighlightMarker({ children }: { children: ReactNode }) {
  return <mark className="dsa-mark">{children}</mark>;
}

/**
 * SectionEyebrow — numbered mono eyebrow with a short red rule ("02 · LATEST RESEARCH").
 * A decorative kicker that orders the page narrative — NOT the section heading; render
 * the real <h2> separately below it.
 */
export function SectionEyebrow({
  index,
  label,
}: {
  index?: string;
  label: string;
}) {
  return (
    <p className="dsa-eyebrow dsa-label">
      <span aria-hidden="true" className="dsa-eyebrow__rule" />
      <span>
        {index ? `${index} · ` : ""}
        {label}
      </span>
    </p>
  );
}
