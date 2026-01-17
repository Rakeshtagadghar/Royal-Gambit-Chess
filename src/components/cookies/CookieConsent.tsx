"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "royalgambit_cookie_consent";

type ConsentType = "all" | "essential" | null;

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<ConsentType>(null);

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!storedConsent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setConsent(storedConsent as ConsentType);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    setConsent("all");
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "essential");
    setConsent("essential");
    setShowBanner(false);
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
                      onClick={acceptEssential}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience, analyze site traffic,
                    and improve our services. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
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
                      variant="outline"
                      onClick={acceptEssential}
                      className="flex-1 sm:flex-none"
                    >
                      Essential Only
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

// Hook to check consent status
export function useCookieConsent() {
  const getStoredConsent = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentType;
  };

  const [consent, setConsent] = useState<ConsentType>(getStoredConsent);
  const [isLoaded] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    // Listen for consent changes from other components/tabs
    const handleStorageChange = () => {
      setConsent(localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentType);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    consent,
    isLoaded,
    hasAnalyticsConsent: consent === "all" || consent === "essential",
    hasEssentialConsent: consent !== null,
  };
}

export const COOKIE_CONSENT_KEY_EXPORT = COOKIE_CONSENT_KEY;
