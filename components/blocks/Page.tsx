import type { ReactNode } from "react";
import { SiteNav, SiteFooter } from "@/components/ds";
import { getSiteSettings } from "@/lib/content";

/** Full page shell: skip-link + nav + content + partner band + footer.
 * `navInverse` marks the dark home hero. Footer logos/contact come from siteSettings. */
export async function Page({
  current,
  navInverse = false,
  children,
}: {
  current: string;
  navInverse?: boolean;
  children: ReactNode;
}) {
  const settings = await getSiteSettings();

  const navItems = [
    { href: "/", label: settings.navHomeLabel || "Home" },
    { href: "/publications", label: settings.navPublicationsLabel || "Publications" },
    { href: "/resources", label: settings.navResourcesLabel || "Resources" },
    { href: "/about", label: settings.navAboutLabel || "About" },
  ];

  return (
    <div className="page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteNav inverse={navInverse} current={current} items={navItems} />
      <main id="main-content">{children}</main>
      <SiteFooter
        partners={settings.partners}
        funders={settings.funders}
        contactEmail={settings.contactEmail}
        linkedinUrl={settings.linkedinUrl}
        footerDescriptor={settings.footerDescriptor}
        footerAddress={settings.footerAddress}
        footerColSite={settings.footerColSite}
        footerColLegal={settings.footerColLegal}
        footerColContact={settings.footerColContact}
        copyrightSuffix={settings.copyrightSuffix}
        linkedinLabel={settings.linkedinLabel}
        navHomeLabel={settings.navHomeLabel}
        navPublicationsLabel={settings.navPublicationsLabel}
        navResourcesLabel={settings.navResourcesLabel}
        navAboutLabel={settings.navAboutLabel}
      />
    </div>
  );
}
