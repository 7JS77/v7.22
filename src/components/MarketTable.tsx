'use client';

// ─────────────────────────────────────────────────────────────────────────────
// src/components/MarketTable.tsx
// Aurexon v7.19 — Advanced Market Table with Watchlist, Sparklines & Volume
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type FC,
  type KeyboardEvent,
} from 'react';
import { useTranslations } from 'next-intl';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type CommodityCategory = 'metals' | 'energy' | 'agriculture';
export type TableFilter = 'all' | CommodityCategory | 'watchlist';

export interface CommodityRow {
  /** Exchange ticker / unique key */
  symbol: string;
  /** Full display name */
  name: string;
  /** ISO 4217 currency code */
  currency: string;
  /** Unit of measure shown after price */
  unit: string;
  category: CommodityCategory;
  /** Current mid-price */
  price: number;
  /** Absolute 24h change */
  change: number;
  /** Percentage 24h change */
  changePct: number;
  /** 24h traded volume (contracts or tonnes) — may be null while loading */
  volume: number | null;
  /** 7 data-points for the 1-week sparkline (oldest → newest) */
  weekTrend: readonly number[];
}

export interface MarketTableProps {
  /** Live rows injected from SWR / server component */
  rows: CommodityRow[];
  /** Show skeleton placeholders while first load */
  isLoading?: boolean;
  /** SWR / fetch error message */
  error?: string | null;
  /** Called when user clicks a row for detail view */
  onRowSelect?: (symbol: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const WATCHLIST_STORAGE_KEY = 'aurexon_watchlist_v1';

const FILTER_TABS: Array<{ id: TableFilter; labelKey: string }> = [
  { id: 'all',         labelKey: 'filterAll'         },
  { id: 'metals',      labelKey: 'filterMetals'      },
  { id: 'energy',      labelKey: 'filterEnergy'      },
  { id: 'agriculture', labelKey: 'filterAgriculture' },
  { id: 'watchlist',   labelKey: 'filterWatchlist'   },
];

// ─────────────────────────────────────────────────────────────────────────────
// Micro helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatVolume(value: number | null): string {
  if (value === null) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

/** Read watchlist from localStorage — safe to call on client only */
function readStoredWatchlist(): Set<string> {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch {
    // corrupted storage — start fresh
  }
  return new Set();
}

/** Persist watchlist to localStorage */
function writeStoredWatchlist(symbols: Set<string>): void {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify([...symbols]));
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG icons
// ─────────────────────────────────────────────────────────────────────────────

const IconStar: FC<{ filled: boolean; className?: string }> = ({ filled, className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const IconTrendUp: FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const IconTrendDown: FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
  </svg>
);

const IconSort: FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline — pure SVG, no external lib
// ─────────────────────────────────────────────────────────────────────────────

interface SparklineProps {
  data: readonly number[];
  width?: number;
  height?: number;
}

const Sparkline: FC<SparklineProps> = ({ data, width = 80, height = 28 }) => {
  if (data.length < 2) return <span className="text-text-secondary text-xs">—</span>;

  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;

  const pad    = 2;
  const innerW = width  - pad * 2;
  const innerH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const isUp    = data[data.length - 1] >= data[0];
  const color   = isUp ? '#22c55e' : '#ef4444';   // success / error — system tokens
  const polyline = points.join(' ');

  // Filled area path
  const areaPath = `M ${points[0]} ${points.slice(1).map(p => `L ${p}`).join(' ')} L ${(pad + innerW).toFixed(1)},${(pad + innerH).toFixed(1)} L ${pad},${(pad + innerH).toFixed(1)} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id={`sg-${isUp ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${isUp ? 'up' : 'dn'})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Terminal dot */}
      <circle
        cx={points[points.length - 1].split(',')[0]}
        cy={points[points.length - 1].split(',')[1]}
        r="2"
        fill={color}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonRow: FC<{ index: number }> = ({ index }) => (
  <tr
    className="border-b border-border-subtle animate-pulse"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    {[32, 56, 72, 48, 40, 80].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3.5 rounded-sm bg-ink-3"
          style={{ width: `${w}%` }}
        />
      </td>
    ))}
    <td className="px-4 py-3.5">
      <div className="h-7 w-20 rounded-sm bg-ink-3" />
    </td>
    <td className="px-4 py-3.5 w-8">
      <div className="h-4 w-4 rounded-sm bg-ink-3" />
    </td>
  </tr>
);

// ─────────────────────────────────────────────────────────────────────────────
// Category badge
// ─────────────────────────────────────────────────────────────────────────────

const categoryStyles: Record<CommodityCategory, string> = {
  metals:      'bg-gold/10 text-gold border-gold/25',
  energy:      'bg-orange-500/10 text-orange-400 border-orange-500/25',
  agriculture: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
};

const CategoryBadge: FC<{ category: CommodityCategory; label: string }> = ({ category, label }) => (
  <span className={`inline-block rounded border px-1.5 py-px text-[9px] font-bold uppercase tracking-widest ${categoryStyles[category]}`}>
    {label}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sort state hook
// ─────────────────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'price' | 'change' | 'changePct' | 'volume';
type SortDir = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  dir: SortDir;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export const MarketTable: FC<MarketTableProps> = ({
  rows,
  isLoading = false,
  error = null,
  onRowSelect,
}) => {
  const t = useTranslations('market');

  // ── Watchlist — hydration-safe pattern ──────────────────────────────────
  // We start with an empty set on both server and client to avoid mismatch,
  // then populate from localStorage inside a useEffect (client-only).
  const [watchlist,   setWatchlist]   = useState<Set<string>>(new Set());
  const [wlMounted,   setWlMounted]   = useState(false);    // prevents SSR mismatch

  useEffect(() => {
    setWatchlist(readStoredWatchlist());
    setWlMounted(true);
  }, []);

  const toggleWatchlist = useCallback((symbol: string, e: React.MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      writeStoredWatchlist(next);
      return next;
    });
  }, []);

  // ── Filter & sort ────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<TableFilter>('all');
  const [sort,         setSort]         = useState<SortState>({ key: 'name', dir: 'asc' });

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }, []);

  const sortedFilteredRows = useMemo(() => {
    let filtered = rows;

    if (activeFilter === 'watchlist') {
      filtered = rows.filter((r) => watchlist.has(r.symbol));
    } else if (activeFilter !== 'all') {
      filtered = rows.filter((r) => r.category === activeFilter);
    }

    return [...filtered].sort((a, b) => {
      const mul = sort.dir === 'asc' ? 1 : -1;
      switch (sort.key) {
        case 'name':      return mul * a.name.localeCompare(b.name);
        case 'price':     return mul * (a.price     - b.price);
        case 'change':    return mul * (a.change    - b.change);
        case 'changePct': return mul * (a.changePct - b.changePct);
        case 'volume':    return mul * ((a.volume ?? -1) - (b.volume ?? -1));
        default:          return 0;
      }
    });
  }, [rows, activeFilter, watchlist, sort]);

  // ── Column header helper ─────────────────────────────────────────────────
  const SortableHeader: FC<{ sortKey: SortKey; labelKey: string; className?: string }> = ({
    sortKey, labelKey, className = '',
  }) => (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-secondary cursor-pointer select-none group hover:text-gold transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
      aria-sort={sort.key === sortKey ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="inline-flex items-center gap-1.5">
        {t(labelKey)}
        <IconSort className={`w-2.5 h-2.5 transition-opacity ${sort.key === sortKey ? 'opacity-100 text-gold' : 'opacity-0 group-hover:opacity-50'}`} />
      </span>
    </th>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border-subtle bg-ink overflow-hidden">

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map(({ id, labelKey }) => {
          const isActive = activeFilter === id;
          const isWl     = id === 'watchlist';
          return (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={[
                'shrink-0 inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150',
                isActive
                  ? 'bg-ink-2 border-border-subtle text-gold'
                  : 'border-transparent text-text-secondary hover:text-gold hover:border-border-subtle/50',
                isWl && !isActive && wlMounted && watchlist.size > 0
                  ? 'text-gold/70'
                  : '',
              ].join(' ')}
              type="button"
              aria-pressed={isActive}
            >
              {isWl && (
                <IconStar
                  filled={wlMounted && watchlist.size > 0}
                  className="w-3 h-3"
                />
              )}
              {t(labelKey)}
              {isWl && wlMounted && watchlist.size > 0 && (
                <span className="rounded-full bg-gold/20 text-gold px-1.5 py-px text-[9px] font-bold leading-none">
                  {watchlist.size}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="h-px w-full bg-border-subtle mx-0" />

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-medium">
          {t('errorFetch')}: {error}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]" role="grid">
          <thead className="bg-ink-2/60 border-b border-border-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-secondary w-8">
                {/* star col */}
              </th>
              <SortableHeader sortKey="name"      labelKey="colCommodity" className="min-w-[180px]" />
              <SortableHeader sortKey="price"     labelKey="colPrice"     />
              <SortableHeader sortKey="change"    labelKey="colChange"    />
              <SortableHeader sortKey="changePct" labelKey="colChangePct" />
              <SortableHeader sortKey="volume"    labelKey="colVolume"    />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-secondary min-w-[96px]">
                {t('colTrend')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle/50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} index={i} />)
              : sortedFilteredRows.length === 0
                ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-text-secondary text-sm"
                    >
                      {activeFilter === 'watchlist'
                        ? t('watchlistEmpty')
                        : t('noResults')
                      }
                    </td>
                  </tr>
                )
                : sortedFilteredRows.map((row) => {
                  const isUp       = row.changePct >= 0;
                  const isWatched  = wlMounted && watchlist.has(row.symbol);
                  const changeSign = isUp ? '+' : '';

                  return (
                    <tr
                      key={row.symbol}
                      className={[
                        'group transition-colors duration-100',
                        onRowSelect
                          ? 'cursor-pointer hover:bg-ink-3/50'
                          : 'hover:bg-ink-3/30',
                      ].join(' ')}
                      onClick={() => onRowSelect?.(row.symbol)}
                      role={onRowSelect ? 'button' : undefined}
                      tabIndex={onRowSelect ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (onRowSelect && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onRowSelect(row.symbol);
                        }
                      }}
                      aria-label={`${row.name} — ${formatPrice(row.price, row.currency)}`}
                    >
                      {/* Star */}
                      <td className="px-3 py-3.5 w-8">
                        <button
                          className={[
                            'flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150',
                            isWatched
                              ? 'text-gold hover:text-gold/70'
                              : 'text-text-secondary/40 hover:text-gold/70 opacity-0 group-hover:opacity-100',
                          ].join(' ')}
                          onClick={(e) => toggleWatchlist(row.symbol, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleWatchlist(row.symbol, e as unknown as KeyboardEvent);
                            }
                          }}
                          aria-label={isWatched ? t('removeWatchlist') : t('addWatchlist')}
                          aria-pressed={isWatched}
                          title={isWatched ? t('removeWatchlist') : t('addWatchlist')}
                          type="button"
                        >
                          <IconStar filled={isWatched} className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Name + category */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm text-white leading-tight">
                            {row.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-text-secondary">
                              {row.symbol}
                            </span>
                            <CategoryBadge
                              category={row.category}
                              label={t(`cat${row.category.charAt(0).toUpperCase() + row.category.slice(1)}`)}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-semibold text-sm text-white tabular-nums">
                          {formatPrice(row.price, row.currency)}
                        </span>
                        <div className="text-[10px] text-text-secondary font-mono">
                          /{row.unit}
                        </div>
                      </td>

                      {/* Absolute change */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-mono text-sm font-medium tabular-nums ${
                            isUp ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {changeSign}{row.change.toFixed(2)}
                        </span>
                      </td>

                      {/* % change */}
                      <td className="px-4 py-3.5">
                        <span
                          className={[
                            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold font-mono tabular-nums',
                            isUp
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400',
                          ].join(' ')}
                        >
                          {isUp ? <IconTrendUp /> : <IconTrendDown />}
                          {changeSign}{row.changePct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-sm text-text-secondary tabular-nums">
                          {formatVolume(row.volume)}
                        </span>
                      </td>

                      {/* Sparkline */}
                      <td className="px-4 py-3.5">
                        <Sparkline data={row.weekTrend} width={80} height={28} />
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      {!isLoading && rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-ink-2/40">
          <span className="text-[10px] text-text-secondary">
            {t('showing', { count: sortedFilteredRows.length, total: rows.length })}
          </span>
          <span className="text-[10px] text-text-secondary">
            {t('dataDisclaimer')}
          </span>
        </div>
      )}
    </div>
  );
};

export default MarketTable;
