"use client";

/**
 * Route Tracker Component
 *
 * Emits page_view events on App Router navigation.
 * - Dedupes by tracking last path
 * - Only fires when analytics consent is granted
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushEvent } from "@/lib/analytics/datalayer";
import { useCookieConsent } from "@/components/cookies/CookieConsent";
import { useAuth } from "@/contexts/AuthContext";

export function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasAnalyticsConsent } = useCookieConsent();
  const { isAuthenticated, isInitialized } = useAuth();

  // Track last path to prevent duplicate fires
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Wait for auth to be initialized before tracking - prevents is_logged_in race condition
    if (!isInitialized) return;
    if (!hasAnalyticsConsent) return;
    if (!pathname) return;

    const fullPath =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Dedupe: don't fire if same path
    if (lastPathRef.current === fullPath) return;
    lastPathRef.current = fullPath;

    pushEvent(
      "page_view",
      {
        page_path: pathname,
        page_title: document.title,
        referrer: document.referrer,
      },
      { isLoggedIn: isAuthenticated }
    );
  }, [pathname, searchParams, hasAnalyticsConsent, isAuthenticated, isInitialized]);

  return null;
}
