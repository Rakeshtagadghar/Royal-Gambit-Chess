/**
 * Google Consent Mode v2 Update Function
 *
 * The consent initialization script has been moved to:
 * src/lib/analytics/gtm-config.ts
 *
 * This module provides the runtime update function for consent changes.
 */

// Convert stored consent to Google consent mode values
function getConsentValues(storedConsent: string | null) {
  if (storedConsent === "all") {
    return {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
      functionality_storage: "granted",
      personalization_storage: "granted",
      security_storage: "granted",
    };
  }

  if (storedConsent === "essential") {
    return {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
    };
  }

  if (storedConsent === "rejected") {
    return {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
    };
  }

  return {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "denied",
  };
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Update Google consent mode when user changes preferences
 * Call this from the CookieConsent component when user accepts/rejects
 */
export function updateGoogleConsent(
  consentType: "all" | "essential" | "rejected"
) {
  if (typeof window === "undefined") return;

  // Ensure gtag exists
  if (typeof window.gtag !== "function") {
    // Initialize if not already done
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }

  const values = getConsentValues(consentType);
  window.gtag("consent", "update", values);
}
