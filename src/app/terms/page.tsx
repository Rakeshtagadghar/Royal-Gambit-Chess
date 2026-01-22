import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - RoyalGambit",
  description: "Read the terms and conditions for using RoyalGambit chess platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ScrollText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>
        </div>

        <Card>
          <CardContent className="prose prose-invert max-w-none p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using RoyalGambit (&quot;the Service&quot;), you accept and agree to be
                bound by these Terms of Service. If you do not agree to these terms, please do
                not use our Service.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Your continued use of
                the Service after any changes constitutes your acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                RoyalGambit is an online chess platform that provides:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Online multiplayer chess games</li>
                <li>Chess games against AI opponents</li>
                <li>Learning resources and tutorials</li>
                <li>Game analysis and review features</li>
                <li>Leaderboards and player rankings</li>
                <li>User profiles and game history</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground mb-4">
                When using RoyalGambit, you agree NOT to:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Use cheating software, bots, or external assistance during games</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Create multiple accounts to manipulate ratings</li>
                <li>Intentionally disconnect or abandon games to avoid losses</li>
                <li>Use offensive or inappropriate usernames or content</li>
                <li>Attempt to exploit bugs or vulnerabilities</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Fair Play Policy</h2>
              <p className="text-muted-foreground mb-4">
                Fair play is essential to our community. The use of chess engines, computer
                assistance, or any form of cheating during rated games is strictly prohibited.
                Violations may result in:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Rating adjustments or resets</li>
                <li>Temporary suspension</li>
                <li>Permanent account ban</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                The Service and its original content, features, and functionality are owned by
                RoyalGambit and are protected by international copyright, trademark, and other
                intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You retain ownership of any content you create (such as game moves), but grant
                us a license to use, display, and analyze this content for the purpose of
                providing our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground mb-4">
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
                kind, either express or implied, including but not limited to:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Implied warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Uninterrupted or error-free service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall RoyalGambit, its founder, or its affiliates be liable for any
                indirect, incidental, special, consequential, or punitive damages arising out of
                or relating to your use of the Service, even if advised of the possibility of
                such damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Privacy</h2>
              <p className="text-muted-foreground">
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . Please review our Privacy Policy to understand how we collect, use, and
                protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your access to the Service immediately, without
                prior notice or liability, for any reason, including breach of these Terms.
                Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with applicable
                laws, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please contact us at{" "}
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
