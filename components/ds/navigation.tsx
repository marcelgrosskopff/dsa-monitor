import type { CSSProperties } from "react";
import Link from "next/link";
import type { Logo } from "@/lib/types";
import { MobileNavMenu } from "./MobileNavMenu";
import { FooterLink } from "./FooterLink";

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
        DSA Monitor
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
      <MobileNavMenu items={items} current={current} />
    </nav>
  );
}

/**
 * PartnerLogoWall — real partner/funder logos at native proportions (About + footer).
 * RULE: use the REAL supplied assets — never recreate, recolour, or distort a logo.
 * When an item has no `src`, a text placeholder stands in until the real asset arrives.
 */
function LogoItem({ name, src, url }: Logo) {
  const inner = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} />
  ) : (
    <span
      className="dsa-label"
      style={{ color: "var(--color-text-secondary)" }}
    >
      {name}
    </span>
  );
  return (
    <li>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
          {inner}
        </a>
      ) : (
        <>{inner}</>
      )}
    </li>
  );
}

export function PartnerLogoWall({
  partners = [],
  funders = [],
  partnersCaption,
  fundersCaption,
}: {
  partners?: Logo[];
  funders?: Logo[];
  partnersCaption?: string;
  fundersCaption?: string;
}) {
  // Empty groups render nothing — the client's launch setup shows only the
  // OIAT Research logo (funders are credited per-report in the attribution box).
  if (!partners.length && !funders.length) return null;
  return (
    <section aria-label="Partners and funders" className="dsa-partners">
      <div className="dsa-partners__inner">
        {partners.length > 0 && (
          <div className="dsa-partners__group">
            <p className="dsa-partners__caption dsa-label">
              {partnersCaption || "OIAT Research – an initiative of OIAT"}
            </p>
            <ul className="dsa-partners__list">
              {partners.map((p) => (
                <LogoItem key={p.name} {...p} />
              ))}
            </ul>
          </div>
        )}
        {funders.length > 0 && (
          <div className="dsa-partners__group dsa-partners__group--funders">
            <p className="dsa-partners__caption dsa-label">
              {fundersCaption || "Funded by"}
            </p>
            <ul className="dsa-partners__list">
              {funders.map((f) => (
                <LogoItem key={f.name} {...f} />
              ))}
            </ul>
          </div>
        )}
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
  partnersCaption,
  fundersCaption,
  showPartners = true,
  contactEmail,
  linkedinUrl,
  footerDescriptor,
  footerAddress,
  footerColSite,
  footerColLegal,
  footerLegalImprintLabel,
  footerLegalPrivacyLabel,
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
  partnersCaption?: string;
  fundersCaption?: string;
  showPartners?: boolean;
  contactEmail?: string;
  linkedinUrl?: string;
  footerDescriptor?: string;
  footerAddress?: string;
  footerColSite?: string;
  footerColLegal?: string;
  footerLegalImprintLabel?: string;
  footerLegalPrivacyLabel?: string;
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
        // Link text only — the route stays /impressum.
        [footerLegalImprintLabel || "Imprint", "/impressum"],
        [footerLegalPrivacyLabel || "Privacy", "/privacy"],
      ],
    },
  ];
  const displayYear = year ?? new Date().getFullYear();
  // Resolve with `||`, not default parameters: an emptied Studio field arrives
  // as null, which a default parameter ignores — the footer would print the
  // literal "null" and link to mailto:null.
  const email = contactEmail || "research@oiat.at";
  // No URL means no link at all. Falling back to a generic linkedin.com host
  // would give visitors a link that isn't the client's profile.
  const linkedin = linkedinUrl || null;
  return (
    <>
      {showPartners && (
        <PartnerLogoWall
          partners={partners}
          funders={funders}
          partnersCaption={partnersCaption}
          fundersCaption={fundersCaption}
        />
      )}
      <footer className="dsa-footer">
        <div className="dsa-footer__inner">
          <div>
            <p className="dsa-footer__brand">
              <span aria-hidden="true" className="dsa-wordmark__mark" />{" "}
              DSA Monitor
            </p>
            <p className="dsa-footer__desc">
              {footerDescriptor || "Independent Digital Services Act compliance research — methodology-first, no black boxes."}
            </p>
            <p className="dsa-footer__addr dsa-label">
              {footerAddress || "OIAT · Ungargasse 64–66/3/404 · 1030 Wien"}
            </p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={`${c.title} footer`}>
              <p className="dsa-footer__coltitle dsa-label">{c.title}</p>
              <ul className="dsa-footer__links">
                {c.links.map(([l, h]) => (
                  <li key={h}>
                    <FooterLink href={h}>{l}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <p className="dsa-footer__coltitle dsa-label">{footerColContact || "Contact"}</p>
            <ul className="dsa-footer__links">
              <li>
                <a className="dsa-footer__mail" href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="dsa-footer__legal dsa-label">
          <span>© {displayYear} {copyrightSuffix || "OIAT · CC BY-SA 4.0"}</span>
          {linkedin ? (
            <a
              href={linkedin}
              className="dsa-footer__mail"
              style={{ color: "inherit" } as CSSProperties}
            >
              {linkedinLabel || "LinkedIn"}
            </a>
          ) : null}
        </div>
      </footer>
    </>
  );
}
