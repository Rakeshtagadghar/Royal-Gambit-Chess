'use client';

import * as React from 'react';
import { AvatarImage } from './avatar';
import { getCachedImageUrl, preloadImage, getCachedImageUrlSync } from '@/lib/image-cache';

interface CachedAvatarImageProps extends React.ComponentProps<typeof AvatarImage> {
  src?: string;
}

/**
 * A cached version of AvatarImage that caches googleusercontent images
 * to prevent 429 rate limiting errors
 */
export function CachedAvatarImage({ src, ...props }: CachedAvatarImageProps) {
  // Check cache synchronously to avoid flicker on navigation
  const initialCachedSrc = React.useMemo(() => {
    if (!src) return undefined;
    // For non-googleusercontent URLs, use directly
    if (!src.includes('googleusercontent.com')) return src;
    // Check if already in memory cache
    return getCachedImageUrlSync(src);
  }, [src]);

  const [cachedSrc, setCachedSrc] = React.useState<string | undefined>(initialCachedSrc);
  const [isLoading, setIsLoading] = React.useState(!initialCachedSrc && !!src);

  React.useEffect(() => {
    // If we already have a cached source from sync check, skip async loading
    if (initialCachedSrc || !src) {
      return;
    }

    let isMounted = true;

    async function loadImage() {
      // src is guaranteed to be defined here due to early return above
      if (!src) return;
      
      try {
        const url = await getCachedImageUrl(src);
        if (isMounted) {
          setCachedSrc(url);
          setIsLoading(false);
        }
      } catch {
        // Fallback to original URL on error
        if (isMounted) {
          setCachedSrc(src);
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, initialCachedSrc]);

  // Preload the image on mount if it's a googleusercontent URL
  React.useEffect(() => {
    if (src) {
      preloadImage(src);
    }
  }, [src]);

  // Don't render until we have a cached source
  if (isLoading || !cachedSrc) {
    return null;
  }

  return <AvatarImage src={cachedSrc} {...props} />;
}
