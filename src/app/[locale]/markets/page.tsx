// ─────────────────────────────────────────────────────────────────────────────
// src/app/[locale]/markets/page.tsx  —  Aurexon v7.22
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MarketsClient } from '@/components/MarketsClient';
import { MOCK_COMMODITIES } from '@/lib/mockData';

interface PageProps { params: { locale: string }; }

export async function generateMetadata(
  { params: { locale } }: PageProps
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('marketsTitle') };
}

export default async function MarketsPage({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale, namespace: 'markets' });

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6 pb-5 border-b border-border-default">
        <p className="section-eyebrow mb-1.5">{t('pageLabel')}</p>
        <h1 className="text-2xl font-bold text-text-primary">{t('pageHeading')}</h1>
        <p className="text-text-secondary text-sm mt-1.5 max-w-2xl">
          {t('pageSubheading')}
        </p>
      </div>

      <MarketsClient rows={MOCK_COMMODITIES} />

      <p className="mt-8 text-[10px] text-text-muted text-center">
        {t('pageDisclaimer')}
      </p>
    </div>
  );
}
