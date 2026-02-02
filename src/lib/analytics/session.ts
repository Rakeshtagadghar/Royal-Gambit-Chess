/**
 * Anonymous Session ID Management
 *
 * Generates and persists anonymous session IDs for analytics.
 * Does NOT contain any PII - just a random UUID v4.
 * Stored in sessionStorage (per-tab, cleared on close).
 */

const SESSION_STORAGE_KEY = "royalgambit_session_id";

/**
 * Generate a UUID v4 for anonymous session tracking.
 */
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// In-memory fallback if sessionStorage is blocked
let inMemorySessionId: string | null = null;

/**
 * Get or create a session ID.
 * - Stored in sessionStorage (per-tab, cleared on close)
 * - Falls back to in-memory if sessionStorage unavailable
 */
export function getSessionId(): string {
  if (typeof window === "undefined") {
    return "server-render";
  }

  // Try sessionStorage first
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) return stored;

    const newId = generateSessionId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
    return newId;
  } catch {
    // Fallback to in-memory if sessionStorage blocked
    if (!inMemorySessionId) {
      inMemorySessionId = generateSessionId();
    }
    return inMemorySessionId;
  }
}

/**
 * Clear session ID (call on logout if desired)
 */
export function clearSessionId(): void {
  inMemorySessionId = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
