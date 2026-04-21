// ─────────────────────────────────────────────────────────────────────────────
// src/components/Footer.tsx  —  Aurexon v7.22 (v7.19 design)
// ─────────────────────────────────────────────────────────────────────────────

import React, { type FC } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const FooterLogo: FC = () => (
  <svg width="22" height="22" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <polygon points="13,2 24,22 2,22" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
    <polygon points="13,8 20,20 6,20" stroke="rgba(201,168,76,0.35)" strokeWidth="1" fill="rgba(201,168,76,0.05)" strokeLinejoin="round"/>
  </svg>
);

export const Footer: FC = () => {
  const t      = useTranslations('footer');
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const year   = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default bg-ink-2/50 mt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <FooterLogo />
              <span className="font-bold text-text-primary tracking-[0.14em] text-sm">AUREXON</span>
              <span className="font-mono text-[9px] text-text-muted border border-border-default rounded px-1.5 py-px">
                v7.22
              </span>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed max-w-xs">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[10px] text-text-secondary">{t('liveMarkets')}</span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="section-eyebrow mb-3">{t('platform')}</h4>
            <ul className="space-y-2">
              <li><Link href={`${prefix}/`}           className="text-xs text-text-secondary hover:text-gold transition-colors duration-150">{t('linkHome')}</Link></li>
              <li><Link href={`${prefix}/markets`}    className="text-xs text-text-secondary hover:text-gold transition-colors duration-150">{t('linkMarkets')}</Link></li>
              <li><Link href={`${prefix}/incoterms`}  className="text-xs text-text-secondary hover:text-gold transition-colors duration-150">{t('linkIncoterms')}</Link></li>
              <li><Link href={`${prefix}/about`}      className="text-xs text-text-secondary hover:text-gold transition-colors duration-150">{t('linkAbout')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-eyebrow mb-3">{t('contact')}</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? 'trading@aurexon.com'}`}
                  className="text-xs text-text-secondary hover:text-gold transition-colors duration-150"
                >
                  {process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? 'trading@aurexon.com'}
                </a>
              </li>
              <li><span className="text-xs text-text-secondary">{t('phone')}</span></li>
              <li className="pt-1">
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? 'trading@aurexon.com'}`}
                  className="btn-primary text-xs px-3.5 py-1.5"
                >
                  {t('requestQuote')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="divider mt-8 mb-4" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] text-text-muted">
            © {year} Aurexon GmbH. {t('allRights')}
          </span>
          <span className="text-[10px] text-text-muted text-center">{t('disclaimer')}</span>
          <span className="font-mono text-[10px] text-text-muted">ICC Incoterms® 2020</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
