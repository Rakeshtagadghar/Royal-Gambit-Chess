import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  JetBrains_Mono,
  Noto_Sans_Devanagari,
} from "next/font/google";
import {
  GTM_ID,
  GTM_CONSENT_INIT_SCRIPT,
  getGTMScript,
  getGTMNoScriptSrc,
} from "@/lib/analytics/gtm-config";
import "./globals.css";

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

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const isDevanagari = locale === "hi" || locale === "sa";
  const fontClasses = `${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}${isDevanagari ? ` ${notoDevanagari.variable}` : ""}`;

  return (
    <html lang={locale} className="light">
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
      </head>
      <body className={`${fontClasses} antialiased min-h-screen`}>
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
        {children}
      </body>
    </html>
  );
}
