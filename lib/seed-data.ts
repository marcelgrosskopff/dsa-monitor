import type {
  Report,
  ResourceGroup,
  SiteSettings,
  Topic,
} from "./types";

// Typed seed content, ported from the approved all-pages canvas (dsa-monitor/data.js).
// Used as the live fallback until the Sanity dataset is provisioned, and as the source
// for scripts/seed.ts. The topic→swatch map here is the ILLUSTRATIVE example from the
// approved screenshot, NOT the locked taxonomy (brief §9.1) — finalise on delivery.

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Parse "Meta · TikTok · 05/2025" → { platforms: ["Meta","TikTok"], date: "05/2025" }. */
function parseMeta(meta: string): { platforms: string[]; date: string } {
  const parts = meta.split("·").map((p) => p.trim());
  const date = parts[parts.length - 1];
  const platforms = parts
    .slice(0, -1)
    .filter((p) => p && p !== "EU-wide" && p !== "GPAI");
  return { platforms, date };
}

function publishedAtFromMMYYYY(date: string): string {
  const m = date.match(/^(\d{2})\/(\d{4})$/);
  if (!m) return date;
  return `${m[2]}-${m[1]}-01`;
}

export const SEED_TOPICS: Topic[] = [
  { label: "Fraudulent advertising", swatch: "red", isPrimary: true, order: 1 },
  { label: "Algorithmic transparency", swatch: "blue", isPrimary: true, order: 2 },
  { label: "Youth & child safety", swatch: "orange", isPrimary: true, order: 3 },
  { label: "AI & platforms", swatch: "purple", isPrimary: true, order: 4 },
  { label: "Hate speech", swatch: "coral", isPrimary: true, order: 5 },
  { label: "Trusted flagger", swatch: "green", isPrimary: true, order: 6 },
  { label: "Ad libraries", swatch: "neutral", isPrimary: false, order: 7 },
  { label: "Content moderation", swatch: "neutral", isPrimary: false, order: 8 },
].map((t) => ({ ...t, slug: slugify(t.label) }) as Topic);

const swatchFor = (label: string) =>
  SEED_TOPICS.find((t) => t.label === label)?.swatch ?? "neutral";

interface RawReport {
  slug: string;
  swatch: Report["swatch"];
  topic: string;
  topics?: { label: string; swatch: Report["swatch"] }[];
  meta: string;
  languages: string[];
  title: string;
  subtitle?: string;
  summary: string;
  kpis: Report["kpis"];
  body: string[];
  methodology: string;
  attribution?: string;
  downloads: { label: string; language: string; format: string; size: string }[];
  source?: { label: string } | null;
}

const RAW_REPORTS: RawReport[] = [
  {
    slug: "ghost-stores",
    swatch: "red",
    topic: "Fraudulent advertising",
    meta: "Meta · 05/2025",
    languages: ["EN", "DE"],
    title: "Numerous fraudulent ghost stores advertise on Facebook and Instagram.",
    subtitle: "Three recurring manipulation patterns across 36,725 ads in the Meta Ad Library.",
    summary:
      "A four-month scrape of the Meta Ad Library identified 36,725 advertisements promoting short-lived ‘ghost stores’ that take payment and never ship. The ads cluster around three recurring manipulation patterns. Part of the AdGuardians / netidee project.",
    kpis: [
      { number: "36,725", label: "Ads analysed", accent: "red" },
      { number: "4", label: "Months observed", accent: "blue" },
      { number: "3", label: "Manipulation patterns", accent: "orange" },
      { number: "1,200", label: "Ads hand-coded", accent: "purple" },
    ],
    body: [
      "Across a four-month scrape of the Meta Ad Library, we identified 36,725 advertisements promoting so-called ‘ghost stores’ — short-lived shops that take payment and never ship. The ads cluster around three recurring manipulation patterns: fake countdown scarcity, recycled influencer footage, and impersonation of established Austrian retailers.",
      "We map each finding to the relevant DSA articles (Art. 26 advertising transparency; Art. 34 systemic-risk assessment) so regulators and journalists can act on the evidence directly. The full dataset and replication code are published alongside this report.",
    ],
    methodology:
      "We queried the Meta Ad Library API for EU-targeted commerce ads over a four-month window, deduplicated creatives by perceptual hash, and hand-coded a stratified sample of 1,200 ads against a fixed rubric (two annotators, κ = 0.84). Limitations: the Ad Library omits organic posts and does not expose full targeting parameters, so reach figures are lower bounds.",
    attribution:
      "AdGuardians is a project of ÖIAT Research, funded by the netidee programme of the Internet Foundation Austria, in cooperation with the Austrian Federal Economic Chamber (WKO).",
    downloads: [
      { label: "Report", language: "English", format: "PDF", size: "2.4 MB" },
      { label: "Bericht", language: "Deutsch", format: "PDF", size: "2.6 MB" },
      { label: "Dataset", language: "", format: "CSV", size: "880 KB" },
    ],
    source: { label: "AdGuardians source & replication code on GitHub" },
  },
  {
    slug: "tiktok-recommender",
    swatch: "blue",
    topic: "Algorithmic transparency",
    topics: [
      { label: "Algorithmic transparency", swatch: "blue" },
      { label: "AI & platforms", swatch: "purple" },
    ],
    meta: "TikTok · 04/2025",
    languages: ["EN"],
    title: "TikTok's recommender system and political content reach.",
    subtitle: "How quickly a fresh account is shown political content — and how fast it compounds.",
    summary:
      "A controlled sock-puppet study of how quickly TikTok's recommender surfaces political content to new accounts, and how that reach concentrates over a single session.",
    kpis: [
      { number: "240", label: "Sock-puppet accounts", accent: "blue" },
      { number: "11 min", label: "Median to first political clip", accent: "red" },
      { number: "0.81", label: "Inter-coder agreement (κ)", accent: "green" },
    ],
    body: [
      "We instrumented 240 fresh accounts with no follow graph and logged every recommended clip for 60 minutes each. The median time to the first political clip was 11 minutes; once surfaced, political content compounded quickly in the For-You feed.",
      "Findings are mapped to DSA Art. 27 (recommender-system transparency) and Art. 34 (systemic-risk assessment).",
    ],
    methodology:
      "Accounts were created from clean residential IPs across three EU regions, with watch-time held constant. We classified clips with a two-annotator scheme (κ = 0.81). Limitations: no logged-in personalisation history; results describe the cold-start case only.",
    downloads: [{ label: "Report", language: "English", format: "PDF", size: "1.9 MB" }],
    source: { label: "Analysis notebooks on GitHub" },
  },
  {
    slug: "stranger-reach",
    swatch: "orange",
    topic: "Youth & child safety",
    topics: [
      { label: "Youth & child safety", swatch: "orange" },
      { label: "Algorithmic transparency", swatch: "blue" },
      { label: "AI & platforms", swatch: "purple" },
    ],
    meta: "Meta · TikTok · 03/2025",
    languages: ["EN", "DE"],
    title: "How easily can a stranger reach a 13-year-old by direct message?",
    summary:
      "An audit of default privacy settings and DM reachability for newly created teen accounts on Meta and TikTok.",
    kpis: [{ number: "2 of 4", label: "Apps allowed adult DMs by default", accent: "orange" }],
    body: [
      "We created teen accounts (age 13) on four platforms and tested whether an unconnected adult account could initiate a direct message under default settings. Two of four platforms permitted it without friction.",
      "Findings are mapped to DSA Art. 28 (protection of minors).",
    ],
    methodology:
      "Accounts used the platforms' own age-gate flows; no setting was changed from the default. Limitations: tests reflect the signup defaults at audit time and may differ by region.",
    downloads: [
      { label: "Report", language: "English", format: "PDF", size: "1.2 MB" },
      { label: "Bericht", language: "Deutsch", format: "PDF", size: "1.3 MB" },
    ],
    source: null,
  },
  {
    slug: "ai-companions",
    swatch: "purple",
    topic: "AI & platforms",
    topics: [
      { label: "AI & platforms", swatch: "purple" },
      { label: "Youth & child safety", swatch: "orange" },
    ],
    meta: "GPAI · 02/2025",
    languages: ["EN"],
    title: "Friend.exe — AI companions and what kids actually tell them.",
    subtitle: "A qualitative look at minors' disclosures to consumer AI-companion apps.",
    summary:
      "A qualitative look at the disclosures minors make to consumer AI-companion apps, and the safety responses those apps give back.",
    kpis: [{ number: "1,400", label: "Conversation turns coded", accent: "purple" }],
    body: [
      "Across a coded sample of 1,400 conversation turns, minors disclosed self-harm ideation, location, and school details to AI-companion apps. Safety responses were inconsistent and often absent.",
    ],
    methodology:
      "A research team simulated minor personas under an ethics protocol; no real minors were involved. Limitations: simulated personas cannot capture the full range of real disclosures.",
    downloads: [{ label: "Short report", language: "English", format: "PDF", size: "640 KB" }],
    source: null,
  },
  {
    slug: "x-hate-speech",
    swatch: "coral",
    topic: "Hate speech",
    meta: "X · 02/2025",
    languages: ["EN"],
    title: "How long does flagged anti-Muslim content remain on X?",
    summary:
      "A removal-latency study of user-flagged anti-Muslim posts on X, measured against the platform's own terms.",
    kpis: [{ number: "62%", label: "Still live after 48h", accent: "coral" }],
    body: [
      "We flagged a fixed set of posts violating X's hateful-conduct policy and measured time-to-action. After 48 hours, 62% remained live and un-actioned.",
    ],
    methodology:
      "Posts were independently double-coded as violating before flagging; we used the in-product reporting flow only. Limitations: a single observation window; no appeals were filed.",
    downloads: [{ label: "Report", language: "English", format: "PDF", size: "1.0 MB" }],
    source: null,
  },
  {
    slug: "flagger-90-days",
    swatch: "green",
    topic: "Trusted flagger",
    meta: "EU-wide · 11/2024",
    languages: ["EN", "DE"],
    title: "A trusted flagger's first 90 days: lessons from the field.",
    subtitle: "What ÖIAT learned operating as a DSA Trusted Flagger.",
    summary:
      "What ÖIAT learned operating as a DSA Trusted Flagger — submission tooling, response times, and where the process breaks down for civil-society flaggers.",
    kpis: [{ number: "90", label: "Days observed", accent: "green" }],
    body: [
      "Drawing on ÖIAT's own status as a Trusted Flagger under the DSA, this brief documents the first 90 days: how notices are submitted, how platforms respond, and where the process breaks down for civil-society flaggers.",
    ],
    methodology:
      "An operational diary plus structured logs of every notice and response. Limitations: a single organisation's experience; not a cross-flagger survey.",
    downloads: [
      { label: "Policy brief", language: "English", format: "PDF", size: "780 KB" },
      { label: "Policy-Brief", language: "Deutsch", format: "PDF", size: "810 KB" },
    ],
    source: null,
  },
  {
    slug: "crypto-scam-ads",
    swatch: "red",
    topic: "Fraudulent advertising",
    meta: "Meta · Google · 01/2025",
    languages: ["EN"],
    title: "Crypto investment scams keep returning under fresh advertiser names.",
    summary:
      "A longitudinal trace of fraudulent crypto-investment ads re-appearing across advertiser accounts after takedown.",
    kpis: [{ number: "8,900", label: "Scam ads traced", accent: "red" }],
    body: [
      "We traced fraudulent crypto-investment ad creatives across advertiser accounts and found the same campaigns re-appearing under fresh names within days of takedown.",
    ],
    methodology:
      "Creatives were matched by perceptual hash across the Meta and Google ad libraries over six months. Limitations: ad libraries omit accounts that were fully removed.",
    downloads: [{ label: "Report", language: "English", format: "PDF", size: "1.6 MB" }],
    source: null,
  },
  {
    slug: "youtube-kids-ads",
    swatch: "orange",
    topic: "Youth & child safety",
    meta: "YouTube · 12/2024",
    languages: ["EN", "DE"],
    title: "Ad personalisation on content watched by minors.",
    summary:
      "An audit of whether personalised advertising reaches feeds dominated by content aimed at minors.",
    kpis: [{ number: "37%", label: "Kid-coded videos with personalised ads", accent: "orange" }],
    body: [
      "We assembled a corpus of videos coded as aimed at minors and recorded the advertising served against them. Personalised ads appeared on 37% of the corpus.",
    ],
    methodology:
      "Videos were double-coded for child-directed content; ad exposure was logged from instrumented sessions. Limitations: ad personalisation varies by account history.",
    downloads: [
      { label: "Report", language: "English", format: "PDF", size: "1.4 MB" },
      { label: "Bericht", language: "Deutsch", format: "PDF", size: "1.5 MB" },
    ],
    source: null,
  },
  {
    slug: "appeals-outcomes",
    swatch: "blue",
    topic: "Algorithmic transparency",
    meta: "Meta · 11/2024",
    languages: ["EN"],
    title: "What happens after you appeal a content decision?",
    summary:
      "A study of appeal outcomes and statement-of-reasons quality for moderated content on Meta platforms.",
    kpis: [{ number: "1,050", label: "Appeals tracked", accent: "blue" }],
    body: [
      "We submitted and tracked appeals of moderated content and assessed the statements of reasons returned, scoring each for specificity against DSA Art. 17.",
    ],
    methodology:
      "Appeals used the in-product flow; statements of reasons were scored by two annotators. Limitations: results reflect one account class.",
    downloads: [{ label: "Report", language: "English", format: "PDF", size: "1.1 MB" }],
    source: null,
  },
];

export const SEED_REPORTS: Report[] = RAW_REPORTS.map((r) => {
  const { platforms, date } = parseMeta(r.meta);
  const topics = r.topics ?? [{ label: r.topic, swatch: r.swatch }];
  return {
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle || undefined,
    swatch: r.swatch,
    primaryTopic: { label: r.topic, swatch: swatchFor(r.topic) },
    topics,
    platforms,
    publishedAt: publishedAtFromMMYYYY(date),
    date,
    languages: r.languages,
    meta: r.meta,
    summary: r.summary,
    body: r.body,
    methodology: r.methodology ? [r.methodology] : undefined,
    kpis: r.kpis,
    downloads: r.downloads.map((d) => ({ ...d, href: "#" })),
    attribution: r.attribution ? { note: r.attribution } : undefined,
    source: r.source ? { label: r.source.label, href: "#" } : undefined,
  } satisfies Report;
});

export const SEED_RESOURCE_GROUPS: ResourceGroup[] = [
  {
    name: "Tools",
    description:
      "Working tools ÖIAT builds and maintains for trusted flaggers and researchers.",
    order: 1,
    items: [
      { type: "link", label: "AdGuardians — fraudulent-ad scanner (source)", href: "#" },
      { type: "link", label: "EU DSA Transparency Database", href: "#" },
    ],
  },
  {
    name: "Templates",
    description: "Reusable templates for filing structured notices and annual reports.",
    order: 2,
    items: [
      { type: "dl", label: "Trusted Flagger reporting template", language: "English", format: "XLSX", size: "120 KB" },
      { type: "dl", label: "Meldevorlage", language: "Deutsch", format: "XLSX", size: "124 KB" },
      { type: "dl", label: "Annual-report guide", language: "English", format: "PDF", size: "1.1 MB" },
    ],
  },
  {
    name: "Appeals Centre Europe (ACE)",
    description: "An out-of-court dispute settlement body certified under DSA Art. 21.",
    order: 3,
    featured: {
      title: "Appeals Centre Europe",
      body: "If a platform has actioned content and the in-app appeal was unsatisfactory, the Appeals Centre Europe offers independent, out-of-court dispute settlement certified under Article 21 of the DSA. It handles disputes across major platforms and publishes its decisions. Submitting a case does not require a lawyer.",
      linkLabel: "Open a case at the Appeals Centre Europe",
      linkHref: "#",
    },
    items: [
      { type: "link", label: "Article 21 — out-of-court dispute settlement (EUR-Lex)", href: "#" },
    ],
  },
];

export const SEED_SETTINGS: SiteSettings = {
  contactEmail: "research@oiat.at",
  linkedinUrl: "https://at.linkedin.com",
  platformsMonitoredCount: 4,
  partners: [
    { name: "ÖIAT", src: "/logos/oiat.png" },
    { name: "ÖIAT Research", src: "/logos/oiat-research.png" },
    { name: "Internet Ombudsstelle (IO)", src: "/logos/internet-ombudsstelle.png" },
    { name: "Saferinternet.at", src: "/logos/saferinternet.png" },
    { name: "Watchlist Internet", src: "/logos/watchlist-internet.jpg" },
    { name: "Digitale Senior:innen", src: "/logos/digitale-seniorinnen.png" },
  ],
  funders: [{ name: "netidee", src: "/logos/netidee.jpg" }],
};

export function seedRelated(slug: string): Report[] {
  const cur = SEED_REPORTS.find((r) => r.slug === slug);
  if (!cur) return [];
  return SEED_REPORTS.filter(
    (r) => r.primaryTopic.label === cur.primaryTopic.label && r.slug !== slug
  ).slice(0, 3);
}
