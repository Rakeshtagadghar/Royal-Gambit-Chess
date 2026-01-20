/**
 * Google Consent Mode v2 Implementation
 *
 * This module provides consent mode initialization for GDPR compliance.
 * Required for Google AdSense compliance since January 16, 2024.
 * See: https://support.google.com/adsense/answer/13554116
 */

// Cookie consent storage key - must match CookieConsent component
const COOKIE_CONSENT_KEY = "royalgambit_cookie_consent";

/**
 * Inline script for Google Consent Mode - must run before any Google tags.
 * This is exported as a string to be used in a <script> tag in the <head>.
 */
export const CONSENT_MODE_SCRIPT = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'denied',
    'wait_for_update': 500,
  });

  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', true);

  (function() {
    try {
      var storedConsent = localStorage.getItem('${COOKIE_CONSENT_KEY}');
      if (storedConsent === 'all') {
        gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted',
          'analytics_storage': 'granted',
          'functionality_storage': 'granted',
          'personalization_storage': 'granted',
          'security_storage': 'granted',
        });
      } else if (storedConsent === 'essential') {
        gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'granted',
          'functionality_storage': 'granted',
          'personalization_storage': 'denied',
          'security_storage': 'granted',
        });
      } else if (storedConsent === 'rejected') {
        gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied',
          'functionality_storage': 'granted',
          'personalization_storage': 'denied',
          'security_storage': 'granted',
        });
      }
    } catch (e) {}
  })();
`;

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

/**
 * Update Google consent mode when user changes preferences
 * Call this from the CookieConsent component when user accepts/rejects
 */
export function updateGoogleConsent(consentType: "all" | "essential" | "rejected") {
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
