import type { Kpi, Report, SiteSettings, Topic } from "./types";

// Automated counts (brief §8). Every visible count reads from one source so the Home
// stat strip, hub subhead, and chip counts can never disagree.

export function reportsPublished(reports: Report[]): number {
  return reports.length;
}

/** Topic categories = number of primary (colour-coded) topics. */
export function topicCategories(topics: Topic[]): number {
  return topics.filter((t) => t.isPrimary).length;
}

/** Platforms monitored = settings value if set, else distinct platforms across reports. */
export function platformsMonitored(
  reports: Report[],
  settings?: SiteSettings
): number {
  if (settings?.platformsMonitoredCount && settings.platformsMonitoredCount > 0) {
    return settings.platformsMonitoredCount;
  }
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

/** The three Home KPI stats — derived, never hand-typed. */
export function siteStats(
  reports: Report[],
  topics: Topic[],
  settings?: SiteSettings
): Kpi[] {
  const pad = (n: number) => (n < 10 ? String(n).padStart(2, "0") : String(n));
  return [
    {
      number: pad(reportsPublished(reports)),
      label: "Reports published",
      accent: "coral",
    },
    {
      number: pad(platformsMonitored(reports, settings)),
      label: "Platforms monitored",
      accent: "blue",
    },
    {
      number: pad(topicCategories(topics)),
      label: "Topic categories",
      accent: "orange",
    },
  ];
}
