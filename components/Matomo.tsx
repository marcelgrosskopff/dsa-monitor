"use client";

import Script from "next/script";

/**
 * Matomo — cookieless + IP-anonymised analytics against the existing OIAT instance.
 * Cookieless mode means no consent banner is legally required; the opt-out + disclosure
 * live on /privacy (brief §9.9). Renders nothing unless both env vars are set.
 *
 *   NEXT_PUBLIC_MATOMO_URL   e.g. https://matomo.oiat.at/
 *   NEXT_PUBLIC_MATOMO_SITE_ID  e.g. 7
 */
export function Matomo() {
  const url = process.env.NEXT_PUBLIC_MATOMO_URL;
  const siteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
  if (!url || !siteId) return null;
  const base = url.endsWith("/") ? url : `${url}/`;
  return (
    <Script id="matomo" strategy="afterInteractive">
      {`
        var _paq = window._paq = window._paq || [];
        _paq.push(['disableCookies']);
        _paq.push(['setDoNotTrack', true]);
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="${base}";
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '${siteId}']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `}
    </Script>
  );
}
