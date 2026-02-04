import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, ArrowLeft } from "lucide-react";
import { getLocaleAlternates, getLocaleUrl } from "@/i18n/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookiePolicy" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: getLocaleAlternates(locale, "/cookie-policy"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: getLocaleUrl(locale, "/cookie-policy"),
      siteName: "RoyalGambit",
      type: "website",
    },
  };
}

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookiePolicy" });

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
          <Cookie className="h-8 w-8 text-primary" />
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
                {t("section1Content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section2Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section2Content")}
              </p>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-green-500 mb-2">{t("essentialTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("essentialContent")}
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                    <li>{t("essentialItem1")}</li>
                    <li>{t("essentialItem2")}</li>
                    <li>{t("essentialItem3")}</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-500 mb-2">{t("analyticsTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("analyticsContent")}
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                    <li>{t("analyticsItem1")}</li>
                    <li>{t("analyticsItem2")}</li>
                    <li>{t("analyticsItem3")}</li>
                    <li>{t("analyticsItem4")}</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-500 mb-2">{t("functionalTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("functionalContent")}
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                    <li>{t("functionalItem1")}</li>
                    <li>{t("functionalItem2")}</li>
                    <li>{t("functionalItem3")}</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section3Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section3Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li><strong>{t.rich("thirdPartyGA", { strong: (chunks) => <strong>{chunks}</strong> })}</strong></li>
                <li><strong>{t.rich("thirdPartyRecaptcha", { strong: (chunks) => <strong>{chunks}</strong> })}</strong></li>
                <li><strong>{t.rich("thirdPartySupabase", { strong: (chunks) => <strong>{chunks}</strong> })}</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section4Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section4Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li>{t("managingItem1")}</li>
                <li>{t("managingItem2")}</li>
                <li>{t("managingItem3")}</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                {t("managingNote")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section5Title")}</h2>
              <p className="text-muted-foreground">
                {t("section5Content")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t("section6Title")}</h2>
              <p className="text-muted-foreground">
                {t("section6Content")}{" "}
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
