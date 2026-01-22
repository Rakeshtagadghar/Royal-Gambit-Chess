import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - RoyalGambit",
  description: "Learn about how RoyalGambit collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
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
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>
        </div>

        <Card>
          <CardContent className="prose prose-invert max-w-none p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to RoyalGambit. We are committed to protecting your personal information
                and your right to privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p className="text-muted-foreground">
                Please read this privacy policy carefully. If you do not agree with the terms of this
                privacy policy, please do not access the site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>

              <h3 className="font-semibold mt-4 mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We collect personal information that you voluntarily provide when you:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1 mb-4">
                <li>Register for an account (email address, username)</li>
                <li>Sign in with Google (name, email, profile picture)</li>
                <li>Update your profile settings</li>
                <li>Contact us for support</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-4">
                When you access our website, we automatically collect certain information:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and approximate location</li>
                <li>Pages visited and time spent on the site</li>
                <li>Game statistics and play history</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Provide, operate, and maintain our services</li>
                <li>Create and manage your user account</li>
                <li>Process and complete game sessions</li>
                <li>Track and display your chess statistics and ratings</li>
                <li>Enable matchmaking and leaderboard features</li>
                <li>Send you important updates about your account</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns to improve our services</li>
                <li>Detect, prevent, and address technical issues and abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li>
                  <strong>Public Profile:</strong> Your username, rating, and game statistics are
                  publicly visible on your profile and leaderboards.
                </li>
                <li>
                  <strong>Service Providers:</strong> We share data with third-party vendors who
                  assist us in operating our website (e.g., Supabase for database, Google for analytics).
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose your information if required
                  by law or in response to valid legal requests.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational security measures to protect
                your personal information, including:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure password hashing</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive
                to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of analytics tracking</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise any of these rights, please contact us at the email address below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Children&apos;s Privacy</h2>
              <p className="text-muted-foreground">
                Our services are not intended for children under the age of 13. We do not knowingly
                collect personal information from children under 13. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                We use the following third-party services:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li>
                  <strong>Supabase:</strong> Database and authentication services
                </li>
                <li>
                  <strong>Google Analytics:</strong> Website analytics (see our{" "}
                  <Link href="/cookie-policy" className="text-primary hover:underline">
                    Cookie Policy
                  </Link>
                  )
                </li>
                <li>
                  <strong>Google reCAPTCHA:</strong> Bot protection for forms
                </li>
                <li>
                  <strong>Google OAuth:</strong> Optional sign-in method
                </li>
                <li>
                  <strong>Google AdSense:</strong> Advertising services
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Microsoft Clarity</h2>
              <p className="text-muted-foreground mb-4">
                We partner with Microsoft Clarity and Microsoft Advertising to capture how you
                use and interact with our website through behavioral metrics, heatmaps, and
                session replay to improve and market our products/services.
              </p>
              <p className="text-muted-foreground mb-4">
                Website usage data is captured using first and third-party cookies and other
                tracking technologies to determine the popularity of products/services and
                online activity. Additionally, we use this information for site optimization,
                fraud/security purposes, and advertising.
              </p>
              <p className="text-muted-foreground">
                For more information about how Microsoft collects and uses your data, visit the{" "}
                <a
                  href="https://privacy.microsoft.com/privacystatement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Microsoft Privacy Statement
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any
                changes by posting the new privacy policy on this page and updating the
                &quot;Last updated&quot; date. You are advised to review this privacy policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions or concerns about this privacy policy or our data practices,
                please contact us at{" "}
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
