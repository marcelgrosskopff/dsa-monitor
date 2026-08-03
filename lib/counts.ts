import type { Kpi, Report, Topic } from "./types";

// Automated counts (brief §8). Every visible count reads from one source so the Home
// stat strip, hub subhead, and chip counts can never disagree.

export function reportsPublished(reports: Report[]): number {
  return reports.length;
}

/** Topic categories = number of primary (colour-coded) topics. */
export function topicCategories(topics: Topic[]): number {
  return topics.filter((t) => t.isPrimary).length;
}

/** Platforms monitored = distinct platforms referenced across all reports.
 *  Self-updating: adding a platform to a report raises the count; there is no
 *  manual override any more (it was a drift trap — it once pinned the number to
 *  "4" long after the real count had grown). */
export function platformsMonitored(reports: Report[]): number {
  const set = new Set<string>();
  for (const r of reports) for (const p of r.platforms ?? []) set.add(p);
  return set.size;
}

/** Count of published reports tagged with a given topic label (primary or secondary). */
export function topicReportCount(reports: Report[], label: string): number {
  return reports.filter(
    (r) =>
      r.primaryTopic.label === label ||
      r.topics.some((t) => t.label === label)
  ).length;
}

/** Wording for the three stat labels. The numbers stay derived — only the
 *  labels are editable, so a rename can never desync from what is counted. */
export interface SiteStatLabels {
  kpiReportsLabel?: string;
  kpiPlatformsLabel?: string;
  kpiTopicsLabel?: string;
}

/** The three Home KPI stats — derived, never hand-typed. */
export function siteStats(
  reports: Report[],
  topics: Topic[],
  labels: SiteStatLabels = {}
): Kpi[] {
  const pad = (n: number) => (n < 10 ? String(n).padStart(2, "0") : String(n));
  return [
    {
      number: pad(reportsPublished(reports)),
      label: labels.kpiReportsLabel || "Reports published",
      accent: "coral",
    },
    {
      number: pad(platformsMonitored(reports)),
      label: labels.kpiPlatformsLabel || "Platforms monitored",
      accent: "blue",
    },
    {
      number: pad(topicCategories(topics)),
      label: labels.kpiTopicsLabel || "Topic categories",
      accent: "orange",
    },
  ];
}
