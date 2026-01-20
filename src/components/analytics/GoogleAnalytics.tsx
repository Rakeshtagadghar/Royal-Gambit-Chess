"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/analytics/gtag";
import { useCookieConsent } from "@/components/cookies/CookieConsent";

function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasAnalyticsConsent } = useCookieConsent();

  useEffect(() => {
    if (pathname && hasAnalyticsConsent) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      pageview(url);
    }
  }, [pathname, searchParams, hasAnalyticsConsent]);

  return null;
}

/**
 * Google Analytics component - only loads after user consent
 *
 * For strict GDPR compliance, we do NOT load any Google scripts until
 * the user has made a consent choice. This prevents any data collection
 * (including cookieless pings) before consent is given.
 */
export function GoogleAnalytics() {
  const { hasAnalyticsConsent, isLoaded } = useCookieConsent();

  // Don't load until we know consent status AND user has given analytics consent
  if (!GA_MEASUREMENT_ID || !isLoaded || !hasAnalyticsConsent) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker />
      </Suspense>
    </>
  );
}
