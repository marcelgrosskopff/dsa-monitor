import type { CSSProperties } from "react";
import Link from "next/link";
import type { Logo } from "@/lib/types";
import { MobileNavMenu } from "./MobileNavMenu";

const DEFAULT_NAV = [
  { href: "/", label: "Home" },
  { href: "/publications", label: "Publications" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

/**
 * SiteNav — top navigation with the text wordmark placeholder (no logo exists yet).
 * Pass `inverse` when it sits on the dark hero. English-only UI, no language selector.
 * Current page is marked aria-current="page".
 */
export function SiteNav({
  inverse = false,
  current = "/",
  items = DEFAULT_NAV,
}: {
  inverse?: boolean;
  current?: string;
  items?: { href: string; label: string }[];
}) {
  return (
    <nav
      aria-label="Primary"
      className={`dsa-nav${inverse ? " dsa-nav--inverse" : ""}`}
    >
      <Link href="/" className="dsa-wordmark">
        <span aria-hidden="true" className="dsa-wordmark__mark" />
        DSA-Monitor
      </Link>
      <ul className="dsa-nav__list">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="dsa-nav__link"
              aria-current={current === it.href ? "page" : undefined}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
      <MobileNavMenu items={items} current={current} inverse={inverse} />
    </nav>
  );
}

/**
 * PartnerLogoWall — real partner/funder logos at native proportions (About + footer).
 * RULE: use the REAL supplied assets — never recreate, recolour, or distort a logo.
 * When an item has no `src`, a text placeholder stands in until the real asset arrives.
 */
function LogoItem({ name, src }: Logo) {
  return (
    <li>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} />
      ) : (
        <span
          className="dsa-label"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {name}
        </span>
      )}
    </li>
  );
}

export function PartnerLogoWall({
  partners = [],
  funders = [],
}: {
  partners?: Logo[];
  funders?: Logo[];
}) {
  return (
    <section aria-label="Partners and funders" className="dsa-partners">
      <div className="dsa-partners__inner">
        <div className="dsa-partners__group">
          <p className="dsa-partners__caption dsa-label">
            ÖIAT Research — an initiative of ÖIAT
          </p>
          <ul className="dsa-partners__list">
            {partners.map((p) => (
              <LogoItem key={p.name} {...p} />
            ))}
          </ul>
        </div>
        <div className="dsa-partners__group dsa-partners__group--funders">
          <p className="dsa-partners__caption dsa-label">Funded by</p>
          <ul className="dsa-partners__list">
            {funders.map((f) => (
              <LogoItem key={f.name} {...f} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * SiteFooter — dark footer. Descriptor, sitemap, contact (email VISIBLE, never
 * hover-only), legal line, and — above it — the partner/funder band on white.
 */
export function SiteFooter({
  partners,
  funders,
  showPartners = true,
  contactEmail = "research@oiat.at",
  linkedinUrl = "https://at.linkedin.com",
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
  navAboutLabel,
  year,
}: {
  partners?: Logo[];
  funders?: Logo[];
  showPartners?: boolean;
  contactEmail?: string;
  linkedinUrl?: string;
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
  year?: number;
}) {
  const cols = [
    {
      title: footerColSite || "Site",
      links: [
        [navHomeLabel || "Home", "/"],
        [navPublicationsLabel || "Publications", "/publications"],
        [navResourcesLabel || "Resources", "/resources"],
        [navAboutLabel || "About", "/about"],
      ],
    },
    {
      title: footerColLegal || "Legal",
      links: [
        ["Impressum", "/impressum"],
        ["Privacy", "/privacy"],
      ],
    },
  ];
  const displayYear = year ?? new Date().getFullYear();
  return (
    <>
      {showPartners && (
        <PartnerLogoWall partners={partners} funders={funders} />
      )}
      <footer className="dsa-footer">
        <div className="dsa-footer__inner">
          <div>
            <p className="dsa-footer__brand">
              <span aria-hidden="true" className="dsa-wordmark__mark" />{" "}
              DSA-Monitor
            </p>
            <p className="dsa-footer__desc">
              {footerDescriptor || "Independent Digital Services Act compliance research — methodology-first, no black boxes."}
            </p>
            <p className="dsa-footer__addr dsa-label">
              {footerAddress || "ÖIAT · Margaretenstr. 70 · 1050 Wien"}
            </p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={`${c.title} footer`}>
              <p className="dsa-footer__coltitle dsa-label">{c.title}</p>
              <ul className="dsa-footer__links">
                {c.links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h}>{l}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <p className="dsa-footer__coltitle dsa-label">{footerColContact || "Contact"}</p>
            <ul className="dsa-footer__links">
              <li>
                <a className="dsa-footer__mail" href={`mailto:${contactEmail}`}>
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="dsa-footer__legal dsa-label">
          <span>© {displayYear} {copyrightSuffix || "ÖIAT · CC BY-SA 4.0"}</span>
          <a
            href={linkedinUrl}
            className="dsa-footer__mail"
            style={{ color: "inherit" } as CSSProperties}
          >
            {linkedinLabel || "LinkedIn"}
          </a>
        </div>
      </footer>
    </>
  );
}
