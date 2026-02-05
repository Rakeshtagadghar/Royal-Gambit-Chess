'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import {
  LOCALE_CONFIG,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  type SupportedLocale,
  SUPPORTED_LOCALES,
} from '@/i18n/locales';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const rawPathname = usePathname();
  // Ensure we don't have undefined pathname
  const pathname = rawPathname || '/';

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    if (newLocale === locale) return;

    // Persist locale preference
    const setCookie = () => {
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
    };
    const setStorage = () => {
      localStorage.setItem('preferred_language', newLocale);
    };

    setCookie();
    setStorage();

    // Clean pathname to avoid double locales (e.g. /hi/hi/play)
    // next-intl's usePathname should return the path without locale, but just in case
    let cleanPathname = pathname;

    // Check if pathname accidentally includes a locale prefix
    for (const loc of SUPPORTED_LOCALES) {
      if (cleanPathname.startsWith(`/${loc}/`) || cleanPathname === `/${loc}`) {
        cleanPathname = cleanPathname.replace(`/${loc}`, '');
        if (cleanPathname === '') cleanPathname = '/';
        break;
      }
    }

    // Navigate to same path with new locale
    router.replace(cleanPathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Current language: ${LOCALE_CONFIG[locale].label}. Click to change language.`}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={loc === locale ? 'bg-accent' : ''}
          >
            <span className="mr-2">{LOCALE_CONFIG[loc].nativeLabel}</span>
            {loc !== locale && (
              <span className="text-xs text-muted-foreground ml-auto">
                {LOCALE_CONFIG[loc].label}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
