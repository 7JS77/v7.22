'use client';
// ─────────────────────────────────────────────────────────────────────────────
// src/components/PriceTicker.tsx  —  Aurexon v7.22 (v7.19 design)
// ─────────────────────────────────────────────────────────────────────────────

import React, { type FC } from 'react';
import type { TickerItem } from '@/lib/mockData';

interface PriceTickerProps { items: TickerItem[]; }

function fmtPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: price < 100 ? 3 : 2,
    maximumFractionDigits: price < 100 ? 3 : 2,
  }).format(price);
}

const TickerCell: FC<{ item: TickerItem }> = ({ item }) => {
  const up = item.changePct >= 0;
  return (
    <div className="flex items-center gap-2.5 px-5 border-r border-border-subtle/50 last:border-r-0 shrink-0">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary">
        {item.symbol}
      </span>
      <span className="font-mono text-[12px] font-semibold text-text-primary tabular-nums">
        {fmtPrice(item.price, item.currency)}
      </span>
      <span className={`font-mono text-[11px] font-semibold tabular-nums ${up ? 'text-success' : 'text-error'}`}>
        {up ? '▲' : '▼'}{Math.abs(item.changePct).toFixed(2)}%
      </span>
    </div>
  );
};

export const PriceTicker: FC<PriceTickerProps> = ({ items }) => {
  const doubled = [...items, ...items];

  return (
    <div
      className="w-full h-9 overflow-hidden border-b border-border-default bg-ink-3/70 flex items-center"
      role="marquee"
      aria-label="Live commodity prices"
    >
      {/* Live badge */}
      <div className="shrink-0 flex items-center gap-1.5 px-4 h-full border-r border-border-default bg-ink-2">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-gold/60">Live</span>
      </div>

      {/* Scrolling strip */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center animate-ticker whitespace-nowrap h-9">
          {doubled.map((item, i) => (
            <TickerCell key={`${item.symbol}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceTicker;
