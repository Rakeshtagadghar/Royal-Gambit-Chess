'use client';

import * as React from 'react';
import { AvatarImage } from './avatar';
import { getCachedImageUrl, preloadImage } from '@/lib/image-cache';

interface CachedAvatarImageProps extends React.ComponentProps<typeof AvatarImage> {
  src?: string;
}

/**
 * A cached version of AvatarImage that caches googleusercontent images
 * to prevent 429 rate limiting errors
 */
export function CachedAvatarImage({ src, ...props }: CachedAvatarImageProps) {
  const [cachedSrc, setCachedSrc] = React.useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      if (!src) {
        setIsLoading(false);
        return;
      }

      // For non-googleusercontent URLs, use directly
      if (!src.includes('googleusercontent.com')) {
        if (isMounted) {
          setCachedSrc(src);
          setIsLoading(false);
        }
        return;
      }

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
  }, [src]);

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
