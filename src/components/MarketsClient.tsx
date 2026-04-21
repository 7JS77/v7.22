'use client';
// ─────────────────────────────────────────────────────────────────────────────
// src/components/MarketsClient.tsx  —  Aurexon v7.22
// v7.19 shell design wrapping v7.20 functional components.
// CommodityChart is imported dynamically (ssr: false) to prevent recharts
// from running server-side and causing hydration errors.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, type FC } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { MarketTable } from '@/components/MarketTable';
import { BasisCalculator } from '@/components/BasisCalculator';
import type { CommodityRow } from '@/components/MarketTable';
import type { CommodityChartProps } from '@/components/CommodityChart';
import { PHYSICAL_CONTEXT } from '@/lib/mockData';

const CommodityChart = dynamic<CommodityChartProps>(
  () => import('@/components/CommodityChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[288px] card animate-pulse flex items-center justify-center">
        <span className="text-text-secondary text-sm">Loading chart…</span>
      </div>
    ),
  }
);

interface MarketsClientProps { rows: CommodityRow[]; }

export const MarketsClient: FC<MarketsClientProps> = ({ rows }) => {
  const t = useTranslations('markets');
  const [selectedSymbol, setSelectedSymbol] = useState(rows[0]?.symbol ?? '');
  const selected = rows.find(r => r.symbol === selectedSymbol) ?? rows[0];

  const handleRowSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setTimeout(() => {
      document.getElementById('market-detail')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (!selected) return null;

  return (
    <div className="space-y-8">
      {/* ── Market table ──────────────────────────────────────────── */}
      <MarketTable rows={rows} onRowSelect={handleRowSelect} />

      {/* ── Chart + Calculator ────────────────────────────────────── */}
      <div
        id="market-detail"
        className="grid grid-cols-1 xl:grid-cols-5 gap-5 scroll-mt-20"
      >
        {/* Price history chart — 3/5 width on xl */}
        <div className="xl:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">{t('chartLabel')}</h3>
            <span className="font-mono text-[10px] text-text-secondary border border-border-default rounded px-1.5 py-px">
              {selected.symbol}
            </span>
          </div>
          <CommodityChart
            symbol={selected.symbol}
            name={selected.name}
            currency={selected.currency}
            unit={selected.unit}
          />
          {/* Physical market context note */}
          {PHYSICAL_CONTEXT[selected.symbol] && (
            <div className="card-sm px-3.5 py-3 border-gold/20 bg-gold/3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-1">
                {t('physicalContext')}
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {PHYSICAL_CONTEXT[selected.symbol]}
              </p>
            </div>
          )}
        </div>

        {/* Delivered price calculator — 2/5 width on xl */}
        <div className="xl:col-span-2">
          <h3 className="text-sm font-semibold text-text-primary mb-3">{t('calcLabel')}</h3>
          <BasisCalculator
            initialSpotPrice={selected.price}
            currency={selected.currency}
            unit={selected.unit}
            exchange={selected.symbol.split('_')[0]}
            commodityName={selected.name}
            quoteEmailRecipient={
              process.env.NEXT_PUBLIC_QUOTE_EMAIL ?? 'trading@aurexon.com'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MarketsClient;
