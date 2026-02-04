import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, MessageSquare, Clock, Shield } from "lucide-react";
import { getLocaleAlternates } from "@/i18n/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Contact Us - RoyalGambit",
    description: "Get in touch with the RoyalGambit team. We're here to help with any questions or feedback.",
    alternates: getLocaleAlternates(locale, "/contact"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

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
          <Mail className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">{t("generalInquiries")}</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {t("generalInquiriesDesc")}
              </p>
              <a
                href="mailto:rakeshtagadghar@gmail.com"
                className="text-primary hover:underline flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                rakeshtagadghar@gmail.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <h2 className="font-semibold text-lg">{t("privacySecurity")}</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {t("privacySecurityDesc")}
              </p>
              <a
                href="mailto:rakeshtagadghar@gmail.com"
                className="text-primary hover:underline flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                rakeshtagadghar@gmail.com
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-invert max-w-none p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t("responseTimeTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("responseTimeContent")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("beforeContactTitle")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("beforeContactDesc")}
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    {t("privacyPolicyLink")}
                  </Link>
                  {" "}- {t("privacyPolicyLinkDesc")}
                </li>
                <li>
                  <Link href="/cookie-policy" className="text-primary hover:underline">
                    {t("cookiePolicyLink")}
                  </Link>
                  {" "}- {t("cookiePolicyLinkDesc")}
                </li>
                <li>
                  <Link href="/terms" className="text-primary hover:underline">
                    {t("termsLink")}
                  </Link>
                  {" "}- {t("termsLinkDesc")}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t("feedbackTitle")}</h2>
              <p className="text-muted-foreground">
                {t("feedbackContent")}
              </p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">{t("connectFounder")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("founderName")}
            </p>
            <a
              href="mailto:rakeshtagadghar@gmail.com"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              {t("sendEmail")}
            </a>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
