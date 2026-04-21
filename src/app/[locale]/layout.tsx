// ─────────────────────────────────────────────────────────────────────────────
// src/app/[locale]/layout.tsx  —  Aurexon v7.22
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navigation } from '@/components/Navigation';
import { Footer }     from '@/components/Footer';
import { PriceTicker } from '@/components/PriceTicker';
import { TICKER_ITEMS } from '@/lib/mockData';
import '../globals.css';

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata(
  { params: { locale } }: LayoutProps
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title:       { default: t('siteTitle'), template: `%s | ${t('siteName')}` },
    description: t('siteDescription'),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aurexon.com'),
    openGraph: {
      type:     'website',
      locale,
      siteName: t('siteName'),
    },
    // Vercel deployment: prevent search engine indexing of preview deployments
    robots: process.env.VERCEL_ENV === 'preview'
      ? { index: false, follow: false }
      : { index: true,  follow: true  },
  };
}

export default async function LocaleLayout(
  { children, params: { locale } }: LayoutProps
) {
  // Validate locale — 404 for anything not in our routing config
  if (!routing.locales.includes(locale as 'en' | 'de' | 'es')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <head>
        {/* Preconnect to self for font optimisation */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-ink text-text-primary antialiased min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {/* Fixed nav (h=56px) + ticker (h=36px) = 92px of pinned chrome */}
          <Navigation />
          <div className="pt-14"> {/* pushes content below fixed nav */}
            <PriceTicker items={TICKER_ITEMS} />
          </div>
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
