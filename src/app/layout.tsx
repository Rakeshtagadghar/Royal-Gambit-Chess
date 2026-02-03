import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import { RouteTracker } from "@/components/analytics/RouteTracker";
import { GoogleAdSense } from "@/components/analytics/GoogleAdSense";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";
import { ReCaptcha } from "@/components/recaptcha/ReCaptcha";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { DevIndicator } from "@/components/DevIndicator";
import {
  GTM_ID,
  GTM_CONSENT_INIT_SCRIPT,
  getGTMScript,
  getGTMNoScriptSrc,
} from "@/lib/analytics/gtm-config";
import { BASE_URL } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-alt",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "RoyalGambit - Learn and Play Chess Online",
    template: "%s | RoyalGambit",
  },
  description: "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends. From beginner basics to advanced strategy - start your chess journey today.",
  keywords: ["chess", "online chess", "play chess", "learn chess", "chess lessons", "chess puzzles", "stockfish", "chess for beginners"],
  authors: [{ name: "RoyalGambit" }],
  creator: "RoyalGambit",
  publisher: "RoyalGambit",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "RoyalGambit - Learn and Play Chess Online",
    description: "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends. From beginner basics to advanced strategy.",
    url: BASE_URL,
    siteName: "RoyalGambit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoyalGambit - Learn and Play Chess Online",
    description: "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google-adsense-account': process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
  },
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RoyalGambit",
  url: BASE_URL,
  description: "Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/chess-guides?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Consent Mode v2 - MUST run before GTM */}
        <script
          dangerouslySetInnerHTML={{ __html: GTM_CONSENT_INIT_SCRIPT }}
        />
        {/* Google Tag Manager */}
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{ __html: getGTMScript() }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        {/* GTM noscript fallback */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={getGTMNoScriptSrc()}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <GoogleAdSense />
        <MicrosoftClarity />
        <ReCaptcha />
        <Providers>
          <Suspense fallback={null}>
            <RouteTracker />
          </Suspense>
          {children}
          <Toaster />
          <CookieConsent />
          <DevIndicator />
        </Providers>
      </body>
    </html>
  );
}
