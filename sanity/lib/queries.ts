import { groq } from "next-sanity";

// Shared projections ------------------------------------------------------------

const topicRefProjection = `{
  "label": label,
  "swatch": coalesce(swatch, "neutral")
}`;

const reportProjection = `{
  "slug": slug.current,
  title,
  subtitle,
  articleType,
  platforms,
  publishedAt,
  summary,
  body,
  methodology,
  kpis[]{ number, label, accent },
  "primaryTopic": primaryTopic->${topicRefProjection},
  "topics": topics[]->${topicRefProjection},
  "downloads": downloads[]{
    label,
    language,
    formatOverride,
    "url": file.asset->url,
    "extension": file.asset->extension,
    "sizeBytes": file.asset->size
  },
  attribution,
  source,
  metaTitle,
  metaDescription
}`;

export const reportsQuery = groq`
  *[_type == "report" && defined(slug.current)] | order(publishedAt desc) ${reportProjection}
`;

export const reportBySlugQuery = groq`
  *[_type == "report" && slug.current == $slug][0] ${reportProjection}
`;

export const reportSlugsQuery = groq`
  *[_type == "report" && defined(slug.current)]{ "slug": slug.current }
`;

export const relatedReportsQuery = groq`
  *[_type == "report" && slug.current != $slug && primaryTopic->label == $topicLabel]
    | order(publishedAt desc)[0...3] ${reportProjection}
`;

export const topicsQuery = groq`
  *[_type == "topic"] | order(order asc, label asc){
    "label": label,
    "slug": slug.current,
    "swatch": coalesce(swatch, "neutral"),
    "isPrimary": coalesce(isPrimary, true),
    order
  }
`;

export const resourceGroupsQuery = groq`
  *[_type == "resourceGroup"] | order(order asc){
    name,
    "description": description,
    order,
    "featured": featured{
      tag,
      title,
      body,
      linkLabel,
      "linkHref": linkHref
    },
    "items": items[]{
      type,
      label,
      href,
      language,
      "url": file.asset->url,
      "extension": file.asset->extension,
      "sizeBytes": file.asset->size
    }
  }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    contactEmail,
    linkedinUrl,
    platformsMonitoredCount,
    "partners": partners[]{ name, "src": logo.asset->url },
    "funders": funders[]{ name, "src": logo.asset->url },
    publisherName,
    activeSince,
    orgStatus,
    licence,
    locationLabel,
    footerDescriptor,
    footerAddress,
    footerColSite,
    footerColLegal,
    footerColContact,
    copyrightSuffix,
    linkedinLabel,
    navHomeLabel,
    navPublicationsLabel,
    navResourcesLabel,
    navAboutLabel
  }
`;

export const pageContentQuery = groq`
  *[_type == $type][0]{ body }
`;

export const homeContentQuery = groq`
  *[_type == "homeContent"][0]{
    heroEyebrow,
    heroHeadlineBefore,
    heroHighlightWord,
    heroHeadlineAfter,
    heroLead,
    latestEyebrow,
    latestHeading,
    emptyStateHeading,
    emptyStateBody,
    howWeWorkEyebrow,
    howWeWorkWhatLabel,
    howWeDoItHeading,
    howWeDoItBody,
    howWeWorkWhyLabel,
    whyWeDoItHeading,
    whyWeDoItBody,
    evidenceHeading,
    evidenceBoxes[]{ number, heading, description },
    closerHeadline,
    closerBody,
    heroCtaLabel,
    heroSecondaryLabel,
    viewAllLabel
  }
`;

export const aboutContentQuery = groq`
  *[_type == "aboutContent"][0]{
    eyebrowLabel,
    pageHeading,
    lead,
    body,
    pressNote
  }
`;

export const impressumContentQuery = groq`
  *[_type == "impressumContent"][0]{
    eyebrowLabel,
    pageHeading,
    intro,
    body
  }
`;

export const privacyContentQuery = groq`
  *[_type == "privacyContent"][0]{
    eyebrowLabel,
    pageHeading,
    intro,
    body,
    analyticsHeading,
    analyticsBody,
    optOutHeading,
    optOutNote
  }
`;

export const publicationsContentQuery = groq`
  *[_type == "publicationsContent"][0]{
    eyebrowLabel,
    heading,
    description,
    countSuffix,
    filterAllLabel,
    filterEmptyHeading,
    filterEmptyBody,
    reportBackLabel,
    reportSummaryLabel,
    reportMethodologyLabel,
    reportRelatedLabel,
    reportDownloadLabel,
    reportSourceLabel,
    reportFundingLabel
  }
`;

export const resourcesContentQuery = groq`
  *[_type == "resourcesContent"][0]{
    eyebrowLabel,
    heading,
    description,
    dlTypeLabel,
    linkTypeLabel
  }
`;

// Light projection for list pages — no body/methodology/kpis/attribution/source
const reportCardProjection = `{
  "slug": slug.current,
  title,
  publishedAt,
  "primaryTopic": primaryTopic->${topicRefProjection},
  "topics": topics[]->${topicRefProjection},
  "downloads": downloads[]{ language }
}`;

export const PAGE_SIZE = 6;

export const reportsPagedQuery = groq`
  *[_type == "report" && defined(slug.current) && ($topic == null || primaryTopic->label == $topic || $topic in topics[]->label)]
  | order(publishedAt desc) [$start...$end]
  ${reportCardProjection}
`;

export const reportCountQuery = groq`
  count(*[_type == "report" && defined(slug.current) && ($topic == null || primaryTopic->label == $topic || $topic in topics[]->label)])
`;

export const notFoundContentQuery = groq`
  *[_type == "notFoundContent"][0]{
    errorCode,
    heading,
    body,
    homeLabel,
    publicationsLabel
  }
`;
