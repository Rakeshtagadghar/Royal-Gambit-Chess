/**
 * DataLayer Push Module
 *
 * Safe dataLayer.push() with:
 * - PII field stripping
 * - Required common field injection
 * - Type safety
 */

import { getSessionId } from "./session";

// PII fields that must NEVER be sent to dataLayer
const PII_FIELDS = [
  "email",
  "username",
  "user_id",
  "userId",
  "full_name",
  "fullName",
  "phone",
  "ip",
  "address",
  "chat_content",
  "message_content",
] as const;

// App metadata from env vars
const APP_ENV = process.env.NODE_ENV || "development";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";

export interface DataLayerEvent {
  event: string;
  [key: string]: unknown;
}

export interface CommonPayload {
  app_env: string;
  app_version: string;
  session_id: string;
  timestamp_iso: string;
  page_path?: string;
  page_title?: string;
  referrer?: string;
  is_logged_in?: boolean;
}

/**
 * Strip PII fields from payload
 */
function stripPII<T extends Record<string, unknown>>(payload: T): T {
  const cleaned = { ...payload };
  for (const field of PII_FIELDS) {
    if (field in cleaned) {
      delete cleaned[field];
      if (process.env.NODE_ENV === "development") {
        console.warn(`[DataLayer] Stripped PII field: ${field}`);
      }
    }
  }
  return cleaned;
}

/**
 * Get common payload fields required for all events
 */
function getCommonPayload(isLoggedIn?: boolean): CommonPayload {
  const common: CommonPayload = {
    app_env: APP_ENV,
    app_version: APP_VERSION,
    session_id: getSessionId(),
    timestamp_iso: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    common.page_path = window.location.pathname;
    common.page_title = document.title;
    common.referrer = document.referrer || "";
  }

  if (typeof isLoggedIn === "boolean") {
    common.is_logged_in = isLoggedIn;
  }

  return common;
}

/**
 * Safely push an event to the dataLayer.
 * - Injects required common fields
 * - Strips PII automatically
 * - Only runs client-side
 */
export function pushEvent(
  eventName: string,
  payload: Record<string, unknown> = {},
  options?: { isLoggedIn?: boolean }
): void {
  if (typeof window === "undefined") return;

  // Initialize dataLayer if needed
  window.dataLayer = window.dataLayer || [];

  // Build event with common fields
  const event: DataLayerEvent = {
    event: eventName,
    ...getCommonPayload(options?.isLoggedIn),
    ...stripPII(payload),
  };

  window.dataLayer.push(event);

  if (process.env.NODE_ENV === "development") {
    console.log("[DataLayer] Pushed:", event);
  }
}

/**
 * Push consent update event (does NOT require analytics consent)
 */
export function pushConsentUpdate(consentState: {
  consent_analytics: boolean;
  consent_ads: boolean;
  consent_functional: boolean;
  source: "banner" | "settings";
}): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "consent_update",
    ...consentState,
    region: "UK",
    timestamp_iso: new Date().toISOString(),
  });
}

// Type augmentation for window.dataLayer
declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
