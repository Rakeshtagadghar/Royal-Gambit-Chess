"use client";

import Script from "next/script";
import { useCookieConsent } from "@/components/cookies/CookieConsent";

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Google AdSense component - only loads after user gives full consent
 *
 * For strict GDPR compliance, we do NOT load AdSense scripts until
 * the user has explicitly accepted all cookies (including ads).
 *
 * See: https://support.google.com/adsense/answer/13554116
 */
export function GoogleAdSense() {
  const { hasFullConsent, isLoaded } = useCookieConsent();

  // Only load AdSense when user has given full consent (including ads)
  if (!ADSENSE_CLIENT_ID || !isLoaded || !hasFullConsent) {
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
