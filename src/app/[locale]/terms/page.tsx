import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, ArrowLeft } from "lucide-react";
import { getLocaleAlternates, getLocaleUrl } from "@/i18n/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: getLocaleAlternates(locale, "/terms"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: getLocaleUrl(locale, "/terms"),
      siteName: "RoyalGambit",
      type: "website",
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToHome")}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ScrollText className="h-8 w-8 text-primary" />
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
              <p className="text-muted-foreground mb-4">
                {t("section2Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("section2Item1")}</li>
                <li>{t("section2Item2")}</li>
                <li>{t("section2Item3")}</li>
                <li>{t("section2Item4")}</li>
                <li>{t("section2Item5")}</li>
                <li>{t("section2Item6")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section3Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section3Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("section3Item1")}</li>
                <li>{t("section3Item2")}</li>
                <li>{t("section3Item3")}</li>
                <li>{t("section3Item4")}</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                {t("section3Note")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section4Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section4Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("section4Item1")}</li>
                <li>{t("section4Item2")}</li>
                <li>{t("section4Item3")}</li>
                <li>{t("section4Item4")}</li>
                <li>{t("section4Item5")}</li>
                <li>{t("section4Item6")}</li>
                <li>{t("section4Item7")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section5Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section5Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("section5Item1")}</li>
                <li>{t("section5Item2")}</li>
                <li>{t("section5Item3")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section6Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section6Content1")}
              </p>
              <p className="text-muted-foreground">
                {t("section6Content2")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section7Title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("section7Content")}
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{t("section7Item1")}</li>
                <li>{t("section7Item2")}</li>
                <li>{t("section7Item3")}</li>
                <li>{t("section7Item4")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section8Title")}</h2>
              <p className="text-muted-foreground">
                {t("section8Content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section9Title")}</h2>
              <p className="text-muted-foreground">
                {t.rich("section9Content", {
                  privacyPolicy: (chunks) => (
                    <Link href="/privacy-policy" className="text-primary hover:underline">
                      {t("privacyPolicyLink")}
                    </Link>
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

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("section11Title")}</h2>
              <p className="text-muted-foreground">
                {t("section11Content")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t("section12Title")}</h2>
              <p className="text-muted-foreground">
                {t("section12Content")}{" "}
                <a href="mailto:rakeshtagadghar@gmail.com" className="text-primary hover:underline">
                  rakeshtagadghar@gmail.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
