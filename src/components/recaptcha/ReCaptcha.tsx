"use client";

import Script from "next/script";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";

export function ReCaptcha() {
  if (!RECAPTCHA_SITE_KEY) {
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
      strategy="lazyOnload"
    />
  );
}
