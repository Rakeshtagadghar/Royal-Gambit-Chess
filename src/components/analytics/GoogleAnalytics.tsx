"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
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

export function GoogleAnalytics() {
  const { hasAnalyticsConsent, isLoaded } = useCookieConsent();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (hasAnalyticsConsent && !initialized) {
      setInitialized(true);
    }
  }, [hasAnalyticsConsent, initialized]);

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
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
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
