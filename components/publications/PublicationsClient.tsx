"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Report, Topic } from "@/lib/types";
import { TopicChip } from "@/components/ds";
import { ResearchCardX } from "@/components/blocks/ResearchCardX";

const PAGE_SIZE = 6;

function matchesTopic(r: Report, label: string): boolean {
  return (
    r.primaryTopic.label === label || r.topics.some((t) => t.label === label)
  );
}

export function PublicationsClient({
  reports,
  topics,
  totalCount,
}: {
  reports: Report[];
  topics: Topic[];
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const active = params.get("topic");
  const page = Math.max(1, Number(params.get("page") || 1));

  const filtered = useMemo(
    () => (active ? reports.filter((r) => matchesTopic(r, active)) : reports),
    [active, reports]
  );

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const safePage = Math.min(page, pageCount);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setQuery = useCallback(
    (next: { topic?: string | null; page?: number | null }) => {
      const sp = new URLSearchParams(params.toString());
      if ("topic" in next) {
        if (next.topic) sp.set("topic", next.topic);
        else sp.delete("topic");
        sp.delete("page");
      }
      if ("page" in next) {
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  const toggle = (label: string | null) =>
    setQuery({ topic: label === active ? null : label });

  return (
    <>
      <div className="filterbar">
        <TopicChip
          swatch="blue"
          label="All topics"
          asFilter
          selected={active === null}
          onToggle={() => setQuery({ topic: null })}
        />
        {topics.map((t) => (
          <TopicChip
            key={t.label}
            swatch={t.swatch}
            label={t.label}
            asFilter
            selected={active === t.label}
            onToggle={() => toggle(t.label)}
          />
        ))}
      </div>

      <p className="filtercount dsa-label" role="status" aria-live="polite">
        {filtered.length} reports
      </p>

      {active && (
        <p style={{ marginBottom: "var(--space-stack-md)" }}>
          <button
            className="clearfilter"
            type="button"
            onClick={() => setQuery({ topic: null })}
          >
            {`← Clear filter — show all ${totalCount}`}
          </button>
        </p>
      )}

      {shown.length ? (
        <>
          <div className="cardgrid">
            {shown.map((r) => (
              <ResearchCardX
                key={r.slug}
                swatch={r.swatch}
                meta={r.date}
                title={r.title}
                topicLabel={r.primaryTopic.label}
                topics={r.topics}
                languages={r.languages}
                href={`/publications/${r.slug}`}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <nav className="pager" aria-label="Publications pagination">
              <button
                type="button"
                className="pager__step"
                disabled={safePage === 1}
                onClick={() => setQuery({ page: safePage - 1 })}
              >
                ← Prev
              </button>
              <ul className="pager__pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      className={`pager__page${p === safePage ? " is-current" : ""}`}
                      aria-current={p === safePage ? "page" : undefined}
                      onClick={() => setQuery({ page: p })}
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="pager__step"
                disabled={safePage === pageCount}
                onClick={() => setQuery({ page: safePage + 1 })}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="statebox">
          <h3>{`No publications under “${active}” yet.`}</h3>
          <p>
            Reports are added as studies are completed. In the meantime, browse
            everything we&apos;ve published.
          </p>
          <button
            className="clearfilter"
            type="button"
            onClick={() => setQuery({ topic: null })}
          >
            {`Clear filter — show all ${totalCount}`}
          </button>
        </div>
      )}
    </>
  );
}
