// ─────────────────────────────────────────────────────────────────────────────
// src/app/[locale]/page.tsx  —  Aurexon v7.22 Home
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { HeroSection } from '@/components/HeroSection';
import { MarketTable } from '@/components/MarketTable';
import { MOCK_COMMODITIES } from '@/lib/mockData';

interface PageProps { params: { locale: string }; }

export async function generateMetadata(
  { params: { locale } }: PageProps
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('homeTitle') };
}

const FEATURES = [
  { icon: '◈', titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: '⬡', titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: '⟐', titleKey: 'feature3Title', descKey: 'feature3Desc' },
] as const;

export default async function HomePage({ params: { locale } }: PageProps) {
  const t      = await getTranslations({ locale, namespace: 'home' });
  const prefix = locale === 'en' ? '' : `/${locale}`;

  // Top 6 commodities for the home page preview
  const previewRows = MOCK_COMMODITIES.slice(0, 6);

  return (
    <>
      {/* ── Hero — background image applied here ────────────────── */}
      <HeroSection
        backgroundImage="/images/hero-bg.jpg"
        imageOpacity={0.22}
        overlayVariant="normal"
      />

      {/* ── Feature strip ──────────────────────────────────────── */}
      <section className="border-y border-border-default bg-ink-2/40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map(({ icon, titleKey, descKey }) => (
              <div key={titleKey} className="flex items-start gap-3">
                <span className="text-gold text-lg mt-0.5 shrink-0">{icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    {t(titleKey)}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Market preview ─────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="section-eyebrow mb-1">{t('marketLabel')}</p>
            <h2 className="text-lg font-bold text-text-primary">{t('marketHeading')}</h2>
          </div>
          <Link href={`${prefix}/markets`} className="btn-ghost text-xs">
            {t('viewAll')} →
          </Link>
        </div>
        <MarketTable rows={previewRows} />
      </section>

      {/* ── Incoterms CTA strip ────────────────────────────────── */}
      <section className="border-t border-border-default bg-ink-2/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <p className="section-eyebrow mb-1">{t('incotermsCta')}</p>
              <h2 className="text-base font-bold text-text-primary">
                {t('incotermsCtaHeading')}
              </h2>
              <p className="text-xs text-text-secondary mt-1 max-w-md">
                {t('incotermsCtaDesc')}
              </p>
            </div>
            <Link href={`${prefix}/incoterms`} className="btn-primary shrink-0">
              {t('incotermsCtaBtn')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
