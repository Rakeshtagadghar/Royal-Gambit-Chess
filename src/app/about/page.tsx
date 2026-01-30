import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Crown, Target, Heart, ChevronRight } from "lucide-react";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us - RoyalGambit Chess Platform",
  description: "Learn about RoyalGambit, the modern chess platform built with passion for the game. Free lessons, AI opponents, and real-time multiplayer chess.",
  keywords: ["about RoyalGambit", "chess platform", "learn chess online", "online chess"],
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: "About Us - RoyalGambit Chess Platform",
    description: "Learn about RoyalGambit, the modern chess platform built with passion for the game. Free lessons, AI opponents, and real-time multiplayer.",
    url: `${BASE_URL}/about`,
    siteName: "RoyalGambit",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About Us - RoyalGambit Chess Platform",
    description: "Learn about RoyalGambit, the modern chess platform built with passion for the game.",
  },
};

export default function AboutPage() {
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
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">About Us</h1>
            <p className="text-muted-foreground">The story behind RoyalGambit</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-invert max-w-none p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-4">
                RoyalGambit is a modern chess platform designed to make the game of chess
                accessible, enjoyable, and educational for players of all skill levels.
                Whether you&apos;re a complete beginner learning the basics or an experienced
                player looking to sharpen your skills, RoyalGambit provides the tools and
                community you need to grow.
              </p>
              <p className="text-muted-foreground">
                Our platform combines the timeless appeal of chess with modern technology,
                offering features like real-time multiplayer games, AI opponents powered by
                Stockfish, comprehensive learning tracks, and detailed game analysis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                What We Offer
              </h2>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                <li>
                  <strong>Play Online:</strong> Challenge players from around the world in real-time matches
                </li>
                <li>
                  <strong>Practice with Bots:</strong> Improve your skills against AI opponents at various difficulty levels
                </li>
                <li>
                  <strong>Learn Chess:</strong> Structured learning tracks from beginner to advanced
                </li>
                <li>
                  <strong>Game Review:</strong> Analyze your games with powerful engine analysis
                </li>
                <li>
                  <strong>Leaderboards:</strong> Compete for rankings and track your progress
                </li>
                <li>
                  <strong>Game Archives:</strong> Review your past games and learn from your mistakes
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Our Team
              </h2>
              <div className="bg-secondary/30 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">RT</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Rakesh Tagadghar</h3>
                    <p className="text-primary text-sm">Founder</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Passionate about chess and technology, building RoyalGambit to share
                      the love of the game with players worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">
                Have questions, suggestions, or feedback? We&apos;d love to hear from you!
                Visit our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Us
                </Link>{" "}
                page or email us directly at{" "}
                <a href="mailto:rakeshtagadghar@gmail.com" className="text-primary hover:underline">
                  rakeshtagadghar@gmail.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Chess Journey?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Explore our free chess guides or jump into a game against our AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/learn/chess-basics">
                Start Learning
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/play">Play Now</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "RoyalGambit",
            url: BASE_URL,
            description: "A modern chess platform for learning and playing chess online.",
            founder: {
              "@type": "Person",
              name: "Rakesh Tagadghar",
            },
          }),
        }}
      />

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: BASE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "About",
                item: `${BASE_URL}/about`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
