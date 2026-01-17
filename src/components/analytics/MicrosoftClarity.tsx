"use client";

import { useEffect, useRef } from "react";
import Clarity from "@microsoft/clarity";
import { useCookieConsent } from "@/components/cookies/CookieConsent";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export function MicrosoftClarity() {
  const { hasAnalyticsConsent } = useCookieConsent();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (CLARITY_PROJECT_ID && hasAnalyticsConsent && !initializedRef.current) {
      Clarity.init(CLARITY_PROJECT_ID);
      initializedRef.current = true;
    }
  }, [hasAnalyticsConsent]);

  return null;
}
