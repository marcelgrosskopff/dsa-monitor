"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Report, Topic } from "@/lib/types";
import { TopicChip } from "@/components/ds";
import { ResearchCardX } from "@/components/blocks/ResearchCardX";

export function PublicationsClient({
  reports,
  topics,
  totalCount,
  currentPage,
  pageCount,
  activeTopic,
  filterAllLabel = "All topics",
  filterEmptyHeading = "No publications under",
  filterEmptyBody = "Reports are added as studies are completed. In the meantime, browse everything we've published.",
}: {
  reports: Report[];
  topics: Topic[];
  totalCount: number;
  currentPage: number;
  pageCount: number;
  activeTopic: string | null;
  filterAllLabel?: string;
  filterEmptyHeading?: string;
  filterEmptyBody?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

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
    setQuery({ topic: label === activeTopic ? null : label });

  return (
    <>
      <div className="filterbar">
        <TopicChip
          swatch="blue"
          label={filterAllLabel}
          asFilter
          selected={activeTopic === null}
          onToggle={() => setQuery({ topic: null })}
        />
        {topics.map((t) => (
          <TopicChip
            key={t.label}
            swatch={t.swatch}
            label={t.label}
            asFilter
            selected={activeTopic === t.label}
            onToggle={() => toggle(t.label)}
          />
        ))}
      </div>

      <div className="listingbar">
        <p className="filtercount dsa-label" role="status" aria-live="polite">
          {totalCount} reports
        </p>
      </div>

      {activeTopic && (
        <p style={{ marginBottom: "var(--space-stack-md)" }}>
          <button
            className="clearfilter"
            type="button"
            onClick={() => setQuery({ topic: null })}
          >
            {`Clear filter — show all`}
          </button>
        </p>
      )}

      {reports.length ? (
        <>
          <div className="cardgrid">
            {reports.map((r) => (
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
                disabled={currentPage === 1}
                onClick={() => setQuery({ page: currentPage - 1 })}
              >
                ← Prev
              </button>
              <ul className="pager__pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      className={`pager__page${p === currentPage ? " is-current" : ""}`}
                      aria-current={p === currentPage ? "page" : undefined}
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
                disabled={currentPage === pageCount}
                onClick={() => setQuery({ page: currentPage + 1 })}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="statebox">
          <h3>
            {filterEmptyHeading} &ldquo;{activeTopic}&rdquo; yet.
          </h3>
          <p>{filterEmptyBody}</p>
          <button
            className="clearfilter"
            type="button"
            onClick={() => setQuery({ topic: null })}
          >
            Clear filter
          </button>
        </div>
      )}
    </>
  );
}
