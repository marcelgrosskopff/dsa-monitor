import type { Metadata } from "next";
import { Page } from "@/components/blocks/Page";
import { ConcentricField } from "@/components/blocks/ConcentricField";
import { DownloadButton, OutboundLink } from "@/components/ds";
import { getResourceGroups, getResourcesContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import type { ResourceGroup, ResourceItem } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Resources",
  description:
    "Practical tools, reporting templates, and pointers to platforms' own transparency reporting for trusted flaggers.",
  path: "/resources",
});

function ResEntry({
  item,
  dlTypeLabel,
  linkTypeLabel,
}: {
  item: ResourceItem;
  dlTypeLabel?: string;
  linkTypeLabel?: string;
}) {
  if (item.type === "dl") {
    return (
      <div className="resitem">
        <p className="resitem__type resitem__type--dl">
          ↓ {dlTypeLabel || "Download"} · {item.format}
        </p>
        <p className="resitem__title">{item.label}</p>
        <DownloadButton
          label={item.label}
          language={item.language}
          format={item.format}
          size={item.size}
          href={item.href || "#"}
        />
      </div>
    );
  }
  return (
    <div className="resitem">
      <p className="resitem__type resitem__type--link">↗ {linkTypeLabel || "External site"}</p>
      <p className="resitem__title">{item.label}</p>
      <OutboundLink href={item.href || "#"}>{item.label}</OutboundLink>
    </div>
  );
}

function Group({
  group,
  dlTypeLabel,
  linkTypeLabel,
}: {
  group: ResourceGroup;
  dlTypeLabel?: string;
  linkTypeLabel?: string;
}) {
  return (
    <div className="resgroup">
      <div className="hatch resgroup__hatch" aria-hidden="true" />
      <div className="resgroup__head">
        <h2>{group.name}</h2>
        {group.description && <p>{group.description}</p>}
      </div>

      {group.featured && (
        <div className="resfeatured">
          <p className="resfeatured__tag">{group.featured.tag || "Featured · out-of-court redress"}</p>
          <h3>{group.featured.title}</h3>
          <p>{group.featured.body}</p>
          <OutboundLink href={group.featured.linkHref || "#"}>
            {group.featured.linkLabel}
          </OutboundLink>
        </div>
      )}

      {group.items.length > 0 && (
        <div className={"reslist" + (group.featured ? " reslist--stack" : "")}>
          {group.items.map((it, i) => (
            <ResEntry key={i} item={it} dlTypeLabel={dlTypeLabel} linkTypeLabel={linkTypeLabel} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ResourcesPage() {
  const [groups, resContent] = await Promise.all([
    getResourceGroups().then((g) => g.filter((x) => x.featured || x.items.length > 0)),
    getResourcesContent(),
  ]);

  return (
    <Page current="/resources">
      <section className="band band--inverse band--toppad resources__hero">
        <ConcentricField className="hero__field" />
        <div className="wrap pagehead">
          <h1>{resContent.heading || "Resources for trusted flaggers."}</h1>
          <p>
            {resContent.description || "If you report illegal content, prepare a Trusted Flagger annual report, or check a platform's own transparency reporting — start here. Downloads carry a file glyph and size; links to other sites carry a diagonal arrow."}
          </p>
        </div>
      </section>
      <section
        className="wrap"
        style={{
          paddingTop: "var(--space-stack-lg)",
          paddingBottom: "var(--space-section)",
        }}
      >
        {groups.map((g) => (
          <Group
            key={g.name}
            group={g}
            dlTypeLabel={resContent.dlTypeLabel}
            linkTypeLabel={resContent.linkTypeLabel}
          />
        ))}
      </section>
    </Page>
  );
}
