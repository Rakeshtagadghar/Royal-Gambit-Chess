"use client";

import Script from "next/script";
import { useCookieConsent } from "@/components/cookies/CookieConsent";

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export function GoogleAdSense() {
  const { hasAnalyticsConsent, isLoaded } = useCookieConsent();

  if (!ADSENSE_CLIENT_ID || !isLoaded || !hasAnalyticsConsent) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
