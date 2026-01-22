import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft, Crown, Target, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - RoyalGambit",
  description: "Learn about RoyalGambit, the modern chess platform built with passion for the game.",
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
      </main>

      <Footer />
    </div>
  );
}
