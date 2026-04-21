// ─────────────────────────────────────────────────────────────────────────────
// src/app/[locale]/about/page.tsx  —  Aurexon v7.22
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps { params: { locale: string }; }

export async function generateMetadata(
  { params: { locale } }: PageProps
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('aboutTitle') };
}

const VALUES = [
  { icon: '◈', titleKey: 'value1Title', descKey: 'value1Desc' },
  { icon: '⬡', titleKey: 'value2Title', descKey: 'value2Desc' },
  { icon: '⟐', titleKey: 'value3Title', descKey: 'value3Desc' },
  { icon: '△', titleKey: 'value4Title', descKey: 'value4Desc' },
] as const;

const TEAM = [
  { name: 'Dr. Klaus Hoffmann', role: 'CEO & Head of Metals Trading'       },
  { name: 'Sarah Chen',         role: 'Head of Energy & Analytics'          },
  { name: 'Marcus Adeyemi',     role: 'Head of Agricultural Commodities'    },
  { name: 'Ingrid Larsson',     role: 'Chief Risk Officer'                  },
] as const;

export default async function AboutPage({ params: { locale } }: PageProps) {
  const t      = await getTranslations({ locale, namespace: 'about' });
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <>
      {/* ── About hero with background image ──────────────────── */}
      <section className="hero-image-section min-h-[60vh] flex flex-col justify-center">
        {/* Background image layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ opacity: 0.18 }}
          />
        </div>
        {/* Gradient overlay */}
        <div className="hero-image-overlay pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-xl">
            <p className="section-eyebrow mb-3">{t('badge')}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-4">
              {t('headline')}
            </h1>
            <p className="text-text-secondary text-base leading-relaxed">
              {t('intro')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <p className="section-eyebrow mb-3">{t('missionLabel')}</p>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {t('missionHeading')}
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            {t('missionText')}
          </p>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────── */}
      <section className="border-t border-border-default bg-ink-2/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="section-eyebrow mb-6">{t('valuesLabel')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map(({ icon, titleKey, descKey }) => (
              <div key={titleKey} className="card p-4">
                <span className="text-gold text-base mb-3 block">{icon}</span>
                <h3 className="text-sm font-semibold text-text-primary mb-1.5">
                  {t(titleKey)}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {t(descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="section-eyebrow mb-6">{t('teamLabel')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map(({ name, role }) => (
            <div key={name} className="card p-4">
              {/* Initials avatar */}
              <div className="w-10 h-10 rounded border border-border-default bg-ink-3 flex items-center justify-center mb-3">
                <span className="text-gold font-bold text-sm">{name[0]}</span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary leading-snug">
                {name}
              </h3>
              <p className="text-[11px] text-text-secondary mt-1 leading-snug">
                {role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────── */}
      <section className="border-t border-border-default bg-ink-2/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {t('ctaHeading')}
              </h2>
              <p className="text-xs text-text-secondary mt-1">{t('ctaDesc')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`${prefix}/markets`} className="btn-primary">
                {t('ctaMarkets')}
              </Link>
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? 'trading@aurexon.com'}`}
                className="btn-secondary"
              >
                {t('ctaContact')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
