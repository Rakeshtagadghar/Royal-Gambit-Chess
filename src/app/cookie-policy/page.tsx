import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy - RoyalGambit",
  description: "Learn about how RoyalGambit uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Cookie className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>
        </div>

        <Card>
          <CardContent className="prose prose-invert max-w-none p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files that are stored on your device when you visit a website.
                They help the website remember your preferences and improve your browsing experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">How We Use Cookies</h2>
              <p className="text-muted-foreground mb-4">
                RoyalGambit uses cookies for the following purposes:
              </p>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-green-500 mb-2">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies are necessary for the website to function properly. They enable core
                    functionality such as authentication, session management, and security features.
                    Without these cookies, the website cannot function properly.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                    <li>User authentication and session management</li>
                    <li>Security tokens and CSRF protection</li>
                    <li>Cookie consent preferences</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-500 mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    We use Google Analytics to understand how visitors interact with our website.
                    This helps us improve our services and user experience.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on pages</li>
                    <li>Device and browser information</li>
                    <li>Geographic location (country/city level)</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-500 mb-2">Functional Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies enable enhanced functionality and personalization, such as
                    remembering your preferences and settings.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                    <li>Theme preferences (dark/light mode)</li>
                    <li>Board orientation preferences</li>
                    <li>Language settings</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We use services from third parties that may set their own cookies:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Google reCAPTCHA:</strong> For bot protection and security</li>
                <li><strong>Supabase:</strong> For authentication and user session management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Managing Cookies</h2>
              <p className="text-muted-foreground mb-4">
                You can manage your cookie preferences in several ways:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li>Use our cookie consent banner to accept or reject non-essential cookies</li>
                <li>Adjust your browser settings to block or delete cookies</li>
                <li>Use browser extensions that manage cookie permissions</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Note that blocking essential cookies may affect the functionality of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Cookie Retention</h2>
              <p className="text-muted-foreground">
                Session cookies are deleted when you close your browser. Persistent cookies remain
                on your device for a set period or until you delete them. Analytics cookies are
                typically retained for up to 2 years.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact us at{" "}
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
