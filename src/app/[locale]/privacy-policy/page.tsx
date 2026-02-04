import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { getLocaleAlternates, getLocaleUrl } from "@/i18n/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPolicy" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: getLocaleAlternates(locale, "/privacy-policy"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: getLocaleUrl(locale, "/privacy-policy"),
      siteName: "RoyalGambit",
      type: "website",
    },
  };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPolicy" });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToHome")}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("lastUpdated")}</p>
          </div>
        </div>

        <Card>
          <CardContent className="prose prose-invert max-w-none p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section1Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section1Content1")}
              </p>
              <p className="text-muted-foreground">
                {t("section1Content2")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section2Title")}</h2>

              <h3 className="font-semibold mt-4 mb-2">{t("personalInfoTitle")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("personalInfoContent")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1 mb-4">
                <li>{t("personalInfoItem1")}</li>
                <li>{t("personalInfoItem2")}</li>
                <li>{t("personalInfoItem3")}</li>
                <li>{t("personalInfoItem4")}</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">{t("autoCollectedTitle")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("autoCollectedContent")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("autoCollectedItem1")}</li>
                <li>{t("autoCollectedItem2")}</li>
                <li>{t("autoCollectedItem3")}</li>
                <li>{t("autoCollectedItem4")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section3Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section3Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("useItem1")}</li>
                <li>{t("useItem2")}</li>
                <li>{t("useItem3")}</li>
                <li>{t("useItem4")}</li>
                <li>{t("useItem5")}</li>
                <li>{t("useItem6")}</li>
                <li>{t("useItem7")}</li>
                <li>{t("useItem8")}</li>
                <li>{t("useItem9")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section4Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section4Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li>
                  <strong>Public Profile:</strong> {t("sharingPublicProfile")}
                </li>
                <li>
                  <strong>Service Providers:</strong> {t("sharingServiceProviders")}
                </li>
                <li>
                  <strong>Legal Requirements:</strong> {t("sharingLegal")}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section5Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section5Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("securityItem1")}</li>
                <li>{t("securityItem2")}</li>
                <li>{t("securityItem3")}</li>
                <li>{t("securityItem4")}</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                {t("securityNote")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section6Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section6Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("rightsItem1")}</li>
                <li>{t("rightsItem2")}</li>
                <li>{t("rightsItem3")}</li>
                <li>{t("rightsItem4")}</li>
                <li>{t("rightsItem5")}</li>
                <li>{t("rightsItem6")}</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                {t("rightsNote")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section7Title")}</h2>
              <p className="text-muted-foreground">
                {t("section7Content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section8Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section8Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li>
                  <strong>{t("thirdPartySupabase")}</strong>
                </li>
                <li>
                  <strong>{t.rich("thirdPartyGA", {
                    cookiePolicy: (chunks) => (
                      <Link href="/cookie-policy" className="text-primary hover:underline">
                        {t("thirdPartyGALink")}
                      </Link>
                    )
                  })}</strong>
                </li>
                <li>
                  <strong>{t("thirdPartyRecaptcha")}</strong>
                </li>
                <li>
                  <strong>{t("thirdPartyOAuth")}</strong>
                </li>
                <li>
                  <strong>{t("thirdPartyAdSense")}</strong>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section9Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section9Content1")}
              </p>
              <p className="text-muted-foreground mb-4">
                {t("section9Content2")}
              </p>
              <p className="text-muted-foreground">
                {t.rich("section9Content3", {
                  microsoftPrivacy: (chunks) => (
                    <a
                      href="https://privacy.microsoft.com/privacystatement"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t("microsoftPrivacyLink")}
                    </a>
                  )
                })}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section10Title")}</h2>
              <p className="text-muted-foreground">
                {t("section10Content")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t("section11Title")}</h2>
              <p className="text-muted-foreground">
                {t("section11Content")}{" "}
                <a href="mailto:rakeshtagadghar@gmail.com" className="text-primary hover:underline">
                  rakeshtagadghar@gmail.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
