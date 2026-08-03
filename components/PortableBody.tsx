import { PortableText, type PortableTextComponents } from "@portabletext/react";

/** Row shape for the custom `table` block. */
interface TableValue {
  rows?: { cells?: string[] }[];
  hasHeaderRow?: boolean;
}

const components: PortableTextComponents = {
  block: {
    // The first paragraph reads as a lead in article context (kit .lead handles size).
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href ?? "";
      const isExternal = href.startsWith("http");
      const safehref = href.startsWith("javascript:") ? "#" : href;
      return (
        <a
          href={safehref}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
          {isExternal && (
            <span className="dsa-sr-only"> (opens in new tab)</span>
          )}
        </a>
      );
    },
  },
  types: {
    // Tables: a horizontally-scrollable wrapper is the mobile fallback (locked §9.5).
    table: ({ value }: { value: TableValue }) => {
      const rows = value?.rows ?? [];
      if (!rows.length) return null;
      const [head, ...rest] = value?.hasHeaderRow ? rows : [null, ...rows];
      return (
        <div className="tablewrap" role="region" aria-label="Table" tabIndex={0}>
          <table className="dsa-table">
            {head && (
              <thead>
                <tr>
                  {(head.cells ?? []).map((c, i) => (
                    <th key={i} scope="col">{c}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rest.map((row, ri) => (
                <tr key={ri}>
                  {(row?.cells ?? []).map((c, ci) => (
                    <td key={ci}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
};

/** Editors routinely leave a trailing empty paragraph behind after pressing
 *  Enter at the end of a field. Rendered, that becomes a stray vertical gap the
 *  client reads as a layout bug, and it can't be seen in Studio. Drop blocks
 *  whose text is only whitespace — non-block content (tables, images) is kept
 *  regardless, since it has no text of its own. */
function dropBlankBlocks(value: unknown[]): unknown[] {
  return value.filter((node) => {
    const b = node as { _type?: string; children?: { text?: string }[] };
    if (b?._type !== "block") return true;
    return (b.children ?? []).some((c) => (c?.text ?? "").trim().length > 0);
  });
}

/** Renders a rich body that may be Portable Text blocks (from Sanity) OR a plain
 *  string[] of paragraphs (from the typed seed). The first paragraph gets `.lead`. */
export function RichBody({
  value,
  lead = false,
}: {
  value: unknown[] | undefined;
  lead?: boolean;
}) {
  if (!value || !value.length) return null;
  // Seed path: array of plain strings.
  if (typeof value[0] === "string") {
    return (
      <>
        {(value as string[]).map((p, i) => (
          <p key={i} className={lead && i === 0 ? "lead" : undefined}>
            {p}
          </p>
        ))}
      </>
    );
  }
  // Sanity path: Portable Text blocks.
  const blocks = dropBlankBlocks(value);
  if (!blocks.length) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={blocks as any[]} components={components} />;
}
