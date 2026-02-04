'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Shield, Cookie, Github, ScrollText, Users, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <span className="text-2xl">♟</span>
              <span>RoyalGambit</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/play" className="text-muted-foreground hover:text-foreground transition-colors">
                  {tNav('play')}
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
                  {tNav('learn')}
                </Link>
              </li>
              <li>
                <Link href="/chess-guides" className="text-muted-foreground hover:text-foreground transition-colors">
                  {tNav('guides')}
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  {tNav('leaderboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3">{t('company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Users className="h-4 w-4" />
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3">{t('legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Cookie className="h-4 w-4" />
                  {t('cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ScrollText className="h-4 w-4" />
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Clarity Disclosure */}
        <div className="border-t mt-6 pt-6">
          <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
            We improve our products and advertising by using Microsoft Clarity to see how you use our website.
            By using our site, you agree that we and Microsoft can collect and use this data.
            Our{' '}
            <Link href="/privacy-policy" className="text-primary hover:underline">
              {t('privacyPolicy').toLowerCase()}
            </Link>
            {' '}has more details.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} RoyalGambit. {t('allRightsReserved')}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
