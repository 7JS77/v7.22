import React, { type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HeroSectionProps {
  /**
   * Path to the background image relative to /public.
   * Pass the home image here: "/images/hero-bg.jpg"
   * For the About page, pass "/images/about-bg.jpg" instead.
   *
   * If omitted, the hero renders without a background image — identical
   * to the original v7.20 hero (dark ink background only).
   */
  backgroundImage?: string;

  /**
   * Alt text for the background image.
   * Should be "" for purely decorative images (the default).
   */
  backgroundImageAlt?: string;

  /**
   * Controls how opaque the image appears before the overlay is applied.
   * 0 = invisible, 1 = full opacity. Default: 0.22
   * Tune this to taste depending on how bright/contrasty your image is.
   */
  imageOpacity?: number;

  /**
   * Switch between the two overlay presets defined in globals.css:
   * - "normal"  → .hero-image-overlay      (stronger, for bright images)
   * - "light"   → .hero-image-overlay-light (softer, for dark images)
   * Default: "normal"
   */
  overlayVariant?: 'normal' | 'light';
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — v7.19 style (solid border, no backdrop blur)
// ─────────────────────────────────────────────────────────────────────────────

const StatCard: FC<{ value: string; label: string; up?: boolean }> = ({
  value,
  label,
  up,
}) => (
  <div className="card-sm px-4 py-3">
    <span
      className={[
        'font-mono text-xl font-bold tabular-nums block leading-none',
        up === true  ? 'text-success' :
        up === false ? 'text-error'   : 'text-gold',
      ].join(' ')}
    >
      {value}
    </span>
    <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium mt-1.5 block">
      {label}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────────────────────────────────────

export const HeroSection: FC<HeroSectionProps> = ({
  backgroundImage,
  backgroundImageAlt = '',
  imageOpacity = 0.22,
  overlayVariant = 'normal',
}) => {
  const t      = useTranslations('hero');
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const overlayClass =
    overlayVariant === 'light' ? 'hero-image-overlay-light' : 'hero-image-overlay';

  return (
    <section className="hero-image-section min-h-[88vh] flex flex-col justify-center pt-14">

      {/* ── Background image (v7.21 addition) ──────────────────────── */}
      {backgroundImage && (
        <>
          {/*
            Next.js <Image> with fill layout.
            The parent section must be position:relative (from .hero-image-section).
            We wrap in a sized div so fill has a reference box.
          */}
          <div className="absolute inset-0 z-0">
            <Image
              src={backgroundImage}
              alt={backgroundImageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              style={{ opacity: imageOpacity }}
            />
          </div>

          {/* Gradient overlay — keeps ink palette legible over any image */}
          <div className={`${overlayClass} pointer-events-none`} />
        </>
      )}

      {/* ── Content — always above image layers ─────────────────────── */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded border border-gold/25 bg-gold/6 px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/80">
              {t('badge')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight tracking-tight text-balance mb-5">
            {t('headline1')}
            <span className="block text-gold">{t('headline2')}</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-xl">
            {t('subheadline')}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`${prefix}/markets`} className="btn-primary">
              {t('ctaMarkets')}
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href={`${prefix}/incoterms`} className="btn-secondary">
              {t('ctaIncoterms')}
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
            <StatCard value="13"   label={t('statCommodities')} />
            <StatCard value="ICC"  label={t('statIncoterms')}   />
            <StatCard value="3"    label={t('statLanguages')}    />
            <StatCard value="Live" label={t('statPrices')}       up={true} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

// ─────────────────────────────────────────────────────────────────────────────
// Integration notes
// ─────────────────────────────────────────────────────────────────────────────
//
// HOME PAGE  →  src/app/[locale]/page.tsx
// ─────────────────────────────────────────
//   import { HeroSection } from '@/components/HeroSection';
//
//   <HeroSection backgroundImage="/images/hero-bg.jpg" />
//
//   Place your home background image at:
//     public/images/hero-bg.jpg   (recommended: 1920×1080 JPG, ≤ 400 KB)
//
//
// ABOUT PAGE  →  src/app/[locale]/about/page.tsx
// ─────────────────────────────────────────────────
//   <HeroSection
//     backgroundImage="/images/about-bg.jpg"
//     overlayVariant="light"   ← use "light" if your image is already dark
//   />
//
//   Place your about background image at:
//     public/images/about-bg.jpg  (recommended: 1920×1080 JPG, ≤ 400 KB)
//
//
// OPACITY TUNING
// ──────────────
//   If the image shows through too much or too little, adjust imageOpacity:
//   - Bright/high-contrast photos:  imageOpacity={0.15}
//   - Dark/moody industrial photos: imageOpacity={0.30}
//   Default is 0.22, which works well for most commodity/industrial shots.
//
//
// NO IMAGE (original v7.20 behaviour)
// ──────────────────────────────────────
//   <HeroSection />
//   Renders the plain dark ink hero exactly as before — no regressions.
