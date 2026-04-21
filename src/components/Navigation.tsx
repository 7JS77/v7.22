'use client';
// ─────────────────────────────────────────────────────────────────────────────
// src/components/Navigation.tsx  —  Aurexon v7.22 (v7.19 design)
// Clean financial-terminal header. No glow effects, no backdrop-blur on links.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, type FC } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

const NAV_LINKS = [
  { href: '/',          labelKey: 'home'      },
  { href: '/markets',   labelKey: 'markets'   },
  { href: '/incoterms', labelKey: 'incoterms' },
  { href: '/about',     labelKey: 'about'     },
] as const;

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'es', label: 'ES' },
] as const;

// v7.19 minimal triangle logo mark
const Logo: FC = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <polygon
      points="13,2 24,22 2,22"
      stroke="#C9A84C"
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
    />
    <polygon
      points="13,8 20,20 6,20"
      stroke="rgba(201,168,76,0.35)"
      strokeWidth="1"
      fill="rgba(201,168,76,0.05)"
      strokeLinejoin="round"
    />
  </svg>
);

export const Navigation: FC = () => {
  const t        = useTranslations('nav');
  const locale   = useLocale();
  const pathname = usePathname();
  const router   = useRouter();

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const prefix = locale === 'en' ? '' : `/${locale}`;
  const locHref = (path: string) => `${prefix}${path}`;

  const isActive = (path: string) => {
    const target = locHref(path);
    if (path === '/') {
      return pathname === '/' || pathname === `/${locale}` || pathname === target;
    }
    return pathname.startsWith(target);
  };

  const switchLocale = (code: string) => {
    const segs   = pathname.split('/').filter(Boolean);
    const hasLoc = (['en', 'de', 'es'] as string[]).includes(segs[0] ?? '');
    const rest   = hasLoc ? segs.slice(1) : segs;
    const next   = code === 'en' ? `/${rest.join('/')}` : `/${code}/${rest.join('/')}`;
    router.push(next || '/');
  };

  return (
    <header
      className={[
        'fixed top-0 inset-x-0 z-50 transition-colors duration-200',
        scrolled
          ? 'bg-ink/96 backdrop-blur-sm border-b border-border-default'
          : 'bg-ink/75 backdrop-blur-sm border-b border-border-subtle/40',
      ].join(' ')}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-6">

          {/* Logo + wordmark */}
          <Link href={locHref('/')} className="flex items-center gap-2.5 shrink-0 group">
            <Logo />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-text-primary text-[14px] tracking-[0.14em] group-hover:text-gold transition-colors duration-150">
                AUREXON
              </span>
              <span className="text-[8px] text-gold/50 tracking-[0.26em] font-medium uppercase mt-0.5">
                Commodity Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={locHref(href)}
                className={[
                  'px-3.5 py-1.5 rounded text-sm font-medium transition-colors duration-150',
                  isActive(href)
                    ? 'text-gold bg-gold/8'
                    : 'text-text-secondary hover:text-text-primary hover:bg-ink-3',
                ].join(' ')}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="hidden md:flex items-center gap-3">
            {/* Locale switcher — v7.19 segmented pill */}
            <div
              className="flex items-center rounded border border-border-default bg-ink-3 overflow-hidden"
              role="group"
              aria-label="Language selector"
            >
              {LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => switchLocale(code)}
                  className={[
                    'px-2.5 py-1 text-[10px] font-bold tracking-widest transition-colors duration-150',
                    locale === code
                      ? 'bg-gold text-ink'
                      : 'text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                  type="button"
                  aria-pressed={locale === code}
                  aria-label={`Switch to ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Quote CTA */}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? 'trading@aurexon.com'}`}
              className="btn-primary text-xs px-4 py-2"
            >
              {t('requestQuote')}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            type="button"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              {menuOpen ? (
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              ) : (
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="md:hidden border-t border-border-default py-3 space-y-0.5 animate-fade-in"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={locHref(href)}
                className={[
                  'block px-3 py-2.5 rounded text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'text-gold bg-gold/8'
                    : 'text-text-secondary hover:text-text-primary hover:bg-ink-3',
                ].join(' ')}
                onClick={() => setMenuOpen(false)}
              >
                {t(labelKey)}
              </Link>
            ))}
            <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
              {LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => { switchLocale(code); setMenuOpen(false); }}
                  className={[
                    'px-2.5 py-1 rounded text-[10px] font-bold border transition-colors',
                    locale === code
                      ? 'bg-gold text-ink border-gold'
                      : 'border-border-default text-text-secondary hover:text-text-primary hover:border-border-default/80',
                  ].join(' ')}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
