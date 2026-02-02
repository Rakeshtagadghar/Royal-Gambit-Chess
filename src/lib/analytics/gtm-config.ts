/**
 * Google Tag Manager Configuration
 *
 * Centralizes GTM ID and Consent Mode v2 initialization script.
 */

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

const COOKIE_CONSENT_KEY = "royalgambit_cookie_consent";

/**
 * Consent Mode v2 initialization script.
 * MUST run before GTM loads.
 * Sets defaults to denied, then checks localStorage for prior consent.
 */
export const GTM_CONSENT_INIT_SCRIPT = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  // Set default consent to denied (UK GDPR/PECR requirement)
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

  // Check for existing consent choice
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

/**
 * GTM container script (to be injected in head)
 * Returns empty string if GTM_ID is not set
 */
export function getGTMScript(): string {
  if (!GTM_ID) return "";

  return `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
}

/**
 * GTM noscript iframe src
 */
export function getGTMNoScriptSrc(): string {
  if (!GTM_ID) return "";
  return `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
}
