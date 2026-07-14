// Shared domain types for DSA-Monitor.

/** Category colour-roles. One topic → one swatch, everywhere.
 * The six primaries map to category tokens; `neutral` is the long-tail degrade. */
export type Swatch =
  | "red"
  | "blue"
  | "orange"
  | "purple"
  | "coral"
  | "green"
  | "neutral";

/** Swatches that have a CategoryShape motif (neutral has none). */
export type MotifSwatch = Exclude<Swatch, "neutral">;

export interface TopicRef {
  label: string;
  swatch: Swatch;
}

export interface Kpi {
  number: string;
  label: string;
  accent?: MotifSwatch;
}

export interface DownloadFile {
  label: string;
  language: string;
  format: string;
  size: string;
  href: string;
}

export interface Attribution {
  projectName?: string;
  fundedBy?: string;
  partners?: string[];
  note?: string;
}

export interface SourceLink {
  label: string;
  href: string;
}

/** A research report — the single CMS template for every report variant. */
export interface Report {
  slug: string;
  title: string;
  subtitle?: string;
  swatch: Swatch;
  primaryTopic: TopicRef;
  topics: TopicRef[];
  platforms: string[];
  /** ISO date used for ordering. */
  publishedAt: string;
  /** Display date, normalised to MM/YYYY. */
  date: string;
  languages: string[];
  meta: string;
  summary: string;
  /** Portable Text blocks (rich body, may contain tables). */
  body?: unknown[];
  /** Portable Text blocks. */
  methodology?: unknown[];
  kpis: Kpi[];
  downloads: DownloadFile[];
  attribution?: Attribution;
  source?: SourceLink;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Topic {
  label: string;
  slug: string;
  swatch: Swatch;
  isPrimary: boolean;
  order?: number;
  count?: number;
}

export interface ResourceItem {
  type: "link" | "dl";
  label: string;
  href?: string;
  language?: string;
  format?: string;
  size?: string;
}

export interface ResourceFeatured {
  tag?: string;
  title: string;
  body: string;
  linkLabel: string;
  linkHref: string;
}

export interface ResourceGroup {
  name: string;
  description?: string;
  order?: number;
  featured?: ResourceFeatured;
  items: ResourceItem[];
}

export interface Logo {
  name: string;
  src?: string;
}

export interface SiteSettings {
  contactEmail: string;
  linkedinUrl?: string;
  partners: Logo[];
  funders: Logo[];
  platformsMonitoredCount?: number;
  publisherName?: string;
  activeSince?: string;
  orgStatus?: string;
  licence?: string;
  locationLabel?: string;
  footerDescriptor?: string;
  footerAddress?: string;
  footerColSite?: string;
  footerColLegal?: string;
  footerColContact?: string;
  copyrightSuffix?: string;
  linkedinLabel?: string;
  navHomeLabel?: string;
  navPublicationsLabel?: string;
  navResourcesLabel?: string;
  navAboutLabel?: string;
}
