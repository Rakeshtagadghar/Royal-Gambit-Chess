/**
 * Image caching utility to prevent 429 rate limiting from external image providers
 * Caches images in localStorage as base64 and creates blob URLs for rendering
 */

const CACHE_PREFIX = 'img_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 50; // Maximum number of cached images

interface CachedImage {
  data: string; // base64 encoded image
  timestamp: number;
  contentType: string;
}

// In-memory blob URL cache to avoid recreating blobs
const blobUrlCache = new Map<string, string>();

/**
 * Generate a cache key from URL
 */
function getCacheKey(url: string): string {
  // Create a simple hash of the URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return CACHE_PREFIX + Math.abs(hash).toString(36);
}

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Get cached image data from localStorage
 */
function getCachedData(url: string): CachedImage | null {
  if (!isBrowser()) return null;

  try {
    const key = getCacheKey(url);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data: CachedImage = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Store image data in localStorage
 */
function setCachedData(url: string, data: string, contentType: string): void {
  if (!isBrowser()) return;

  try {
    const key = getCacheKey(url);
    const cacheData: CachedImage = {
      data,
      timestamp: Date.now(),
      contentType,
    };

    // Clean up old cache entries if we're at the limit
    cleanupOldEntries();

    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (e) {
    // localStorage might be full, try to clean up
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      cleanupOldEntries(true);
      try {
        const key = getCacheKey(url);
        const cacheData: CachedImage = {
          data,
          timestamp: Date.now(),
          contentType,
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
      } catch {
        // Give up if still failing
      }
    }
  }
}

/**
 * Clean up old cache entries
 */
function cleanupOldEntries(aggressive = false): void {
  if (!isBrowser()) return;

  const entries: { key: string; timestamp: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const data: CachedImage = JSON.parse(localStorage.getItem(key) || '');
        entries.push({ key, timestamp: data.timestamp });
      } catch {
        // Remove corrupted entries
        if (key) localStorage.removeItem(key);
      }
    }
  }

  // Sort by timestamp (oldest first)
  entries.sort((a, b) => a.timestamp - b.timestamp);

  // Remove old entries
  const removeCount = aggressive ? Math.ceil(entries.length / 2) : Math.max(0, entries.length - MAX_CACHE_SIZE);
  for (let i = 0; i < removeCount; i++) {
    localStorage.removeItem(entries[i].key);
  }
}

/**
 * Convert base64 to blob URL
 */
function base64ToBlobUrl(base64: string, contentType: string): string {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });
  return URL.createObjectURL(blob);
}

/**
 * Fetch and cache an image, returning a blob URL
 */
export async function getCachedImageUrl(url: string): Promise<string> {
  if (!url) return url;

  // Only cache googleusercontent images
  if (!url.includes('googleusercontent.com')) {
    return url;
  }

  // Check in-memory blob cache first
  if (blobUrlCache.has(url)) {
    return blobUrlCache.get(url)!;
  }

  // Check localStorage cache
  const cached = getCachedData(url);
  if (cached) {
    const blobUrl = base64ToBlobUrl(cached.data, cached.contentType);
    blobUrlCache.set(url, blobUrl);
    return blobUrl;
  }

  // Fetch and cache the image
  try {
    const response = await fetch(url, {
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const blob = await response.blob();

    // Convert to base64 for localStorage
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Store in localStorage
    setCachedData(url, base64, contentType);

    // Create blob URL for this session
    const blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(url, blobUrl);

    return blobUrl;
  } catch {
    // If caching fails, return original URL
    return url;
  }
}

/**
 * Preload and cache an image
 */
export function preloadImage(url: string): void {
  if (url && url.includes('googleusercontent.com')) {
    getCachedImageUrl(url).catch(() => {
      // Silently fail preloading
    });
  }
}

/**
 * Clear all cached images
 */
export function clearImageCache(): void {
  if (!isBrowser()) return;

  // Revoke all blob URLs
  blobUrlCache.forEach((blobUrl) => {
    URL.revokeObjectURL(blobUrl);
  });
  blobUrlCache.clear();

  // Clear localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
