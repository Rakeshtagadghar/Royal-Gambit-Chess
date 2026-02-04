import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { type SupportedLocale } from "@/i18n/locales";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import { RouteTracker } from "@/components/analytics/RouteTracker";
import { GoogleAdSense } from "@/components/analytics/GoogleAdSense";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";
import { ReCaptcha } from "@/components/recaptcha/ReCaptcha";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { DevIndicator } from "@/components/DevIndicator";
import { BASE_URL } from "@/lib/config";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${BASE_URL}/${l}`;
  }
  languages["x-default"] = `${BASE_URL}/en`;

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: "RoyalGambit - Learn and Play Chess Online",
      template: "%s | RoyalGambit",
    },
    description:
      "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends. From beginner basics to advanced strategy - start your chess journey today.",
    keywords: [
      "chess",
      "online chess",
      "play chess",
      "learn chess",
      "chess lessons",
      "chess puzzles",
      "stockfish",
      "chess for beginners",
    ],
    authors: [{ name: "RoyalGambit" }],
    creator: "RoyalGambit",
    publisher: "RoyalGambit",
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      title: "RoyalGambit - Learn and Play Chess Online",
      description:
        "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends. From beginner basics to advanced strategy.",
      url: `${BASE_URL}/${locale}`,
      siteName: "RoyalGambit",
      type: "website",
      locale: locale === "fr" ? "fr_FR" : locale === "hi" ? "hi_IN" : locale === "sa" ? "sa_IN" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "RoyalGambit - Learn and Play Chess Online",
      description:
        "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends.",
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "google-adsense-account":
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
    },
  };
}

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RoyalGambit",
  url: BASE_URL,
  description:
    "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/chess-guides?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as SupportedLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <GoogleAdSense />
      <MicrosoftClarity />
      <ReCaptcha />
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <Suspense fallback={null}>
            <RouteTracker />
          </Suspense>
          {children}
          <Toaster />
          <CookieConsent />
          <DevIndicator />
        </Providers>
      </NextIntlClientProvider>
    </>
  );
}
