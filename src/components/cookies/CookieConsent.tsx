"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { updateGoogleConsent } from "@/components/analytics/GoogleConsentMode";
import { pushConsentUpdate } from "@/lib/analytics/datalayer";

const COOKIE_CONSENT_KEY = "royalgambit_cookie_consent";

type ConsentType = "all" | "essential" | "rejected" | null;

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Read localStorage only after mount to avoid hydration mismatch
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentType;

    if (stored === null) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    setShowBanner(false);
    updateGoogleConsent("all");
    pushConsentUpdate({
      consent_analytics: true,
      consent_ads: true,
      consent_functional: true,
      source: "banner",
    });
  };

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "essential");
    setShowBanner(false);
    updateGoogleConsent("essential");
    pushConsentUpdate({
      consent_analytics: true,
      consent_ads: false,
      consent_functional: true,
      source: "banner",
    });
  };

  const rejectAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setShowBanner(false);
    updateGoogleConsent("rejected");
    pushConsentUpdate({
      consent_analytics: false,
      consent_ads: false,
      consent_functional: true,
      source: "banner",
    });
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border rounded-lg shadow-lg p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">We value your privacy</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 sm:hidden"
                      onClick={rejectAll}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    We use cookies for analytics, advertising, and to improve our services.
                    Read our{" "}
                    <Link href="/cookie-policy" className="text-primary hover:underline">
                      Cookie Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    to learn more.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                      Accept All
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={acceptEssential}
                      className="flex-1 sm:flex-none"
                    >
                      Accept Essential
                    </Button>
                    <Button
                      variant="outline"
                      onClick={rejectAll}
                      className="flex-1 sm:flex-none"
                    >
                      Reject All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Subscribe to localStorage changes
function subscribeToConsent(callback: () => void) {
  globalThis.addEventListener("storage", callback);
  return () => globalThis.removeEventListener("storage", callback);
}

function getConsentSnapshot(): ConsentType {
  return localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentType;
}

function getConsentServerSnapshot(): ConsentType {
  return null;
}

// Hook to check consent status
export function useCookieConsent() {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  return {
    consent,
    isLoaded: true,
    hasFullConsent: consent === "all",
    hasAnalyticsConsent: consent === "all" || consent === "essential",
    hasEssentialConsent: consent !== null,
  };
}

export const COOKIE_CONSENT_KEY_EXPORT = COOKIE_CONSENT_KEY;
