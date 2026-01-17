export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const executeRecaptcha = async (action: string): Promise<string | null> => {
  if (typeof window === "undefined" || !window.grecaptcha || !RECAPTCHA_SITE_KEY) {
    console.warn("reCAPTCHA not available");
    return null;
  }

  return new Promise((resolve) => {
    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
        resolve(token);
      } catch (error) {
        console.error("reCAPTCHA execution failed:", error);
        resolve(null);
      }
    });
  });
};

// Common actions for the chess app
export const RecaptchaActions = {
  LOGIN: "login",
  SIGNUP: "signup",
  CONTACT: "contact",
} as const;
