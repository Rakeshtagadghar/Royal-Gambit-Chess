import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, MessageSquare, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - RoyalGambit",
  description: "Get in touch with the RoyalGambit team. We're here to help with any questions or feedback.",
};

export default function ContactPage() {
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
          <Mail className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p className="text-muted-foreground">We&apos;re here to help</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">General Inquiries</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Questions about RoyalGambit, features, or how to use our platform?
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
                <h2 className="font-semibold text-lg">Privacy & Security</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Concerns about your data, privacy, or account security?
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
                Response Time
              </h2>
              <p className="text-muted-foreground">
                We strive to respond to all inquiries within 24-48 hours. For urgent matters
                related to account security, please include &quot;URGENT&quot; in your email subject line.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Before You Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                You might find answers to common questions in our policies:
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  {" "}- Learn how we handle your data
                </li>
                <li>
                  <Link href="/cookie-policy" className="text-primary hover:underline">
                    Cookie Policy
                  </Link>
                  {" "}- Information about cookies and tracking
                </li>
                <li>
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {" "}- Our terms and conditions
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Feedback Welcome</h2>
              <p className="text-muted-foreground">
                Have ideas for new features or improvements? We love hearing from our community!
                Your feedback helps us make RoyalGambit better for everyone. Don&apos;t hesitate
                to share your thoughts with us.
              </p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Connect with the Founder</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Rakesh Tagadghar - Founder of RoyalGambit
            </p>
            <a
              href="mailto:rakeshtagadghar@gmail.com"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Send an Email
            </a>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
