'use client';

// ─────────────────────────────────────────────────────────────────────────────
// src/components/CommodityChart.tsx
// Aurexon v7.19 — Recharts price chart with timeframe selector & custom tooltip
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState,
  useMemo,
  type FC,
  type CSSProperties,
} from 'react';
import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  type TooltipProps,
} from 'recharts';
import {
  type ValueType,
  type NameType,
} from 'recharts/types/component/DefaultTooltipContent';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ChartTimeframe = '1D' | '5D' | '1M' | '6M';

export interface PriceDataPoint {
  /** ISO timestamp string, e.g. "2024-06-15" */
  ts: string;
  /** Mid price */
  price: number;
  /** Optional 24h volume at this point */
  volume?: number;
}

export interface CommodityChartProps {
  /** Commodity symbol, e.g. "LME_CU" */
  symbol: string;
  /** Full display name for the chart title */
  name: string;
  /** ISO 4217 currency */
  currency: string;
  /** Unit of measure */
  unit: string;
  /** Injected price history (should contain enough points for 6M view) */
  data?: PriceDataPoint[];
  /** Physical market context note shown in the tooltip */
  physicalContextKey?: string;
  /** Show skeleton / loading state */
  isLoading?: boolean;
  /** Additional wrapper className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data generator — 180 days, realistic random-walk
// Used when no data prop is provided (development / placeholder)
// ─────────────────────────────────────────────────────────────────────────────

function generateMockHistory(basePrice: number, days: number): PriceDataPoint[] {
  const points: PriceDataPoint[] = [];
  let price = basePrice;
  const now  = new Date();

  for (let i = days; i >= 0; i--) {
    const d   = new Date(now);
    d.setDate(d.getDate() - i);

    // Skip weekends for a realistic market-data feel
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    // Correlated random walk with slight drift
    const drift     = (Math.random() - 0.48) * 0.012;
    const volatility = 0.008;
    price = price * (1 + drift + (Math.random() - 0.5) * volatility);

    points.push({
      ts: d.toISOString().slice(0, 10),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(80_000 + Math.random() * 120_000),
    });
  }
  return points;
}

const MOCK_BASE = 9_400; // LME Copper-ish
const FULL_HISTORY = generateMockHistory(MOCK_BASE, 180);

// ─────────────────────────────────────────────────────────────────────────────
// Timeframe configuration
// ─────────────────────────────────────────────────────────────────────────────

const TIMEFRAMES: Array<{ id: ChartTimeframe; days: number; labelKey: string }> = [
  { id: '1D', days: 1,   labelKey: 'tf1D' },
  { id: '5D', days: 5,   labelKey: 'tf5D' },
  { id: '1M', days: 30,  labelKey: 'tf1M' },
  { id: '6M', days: 180, labelKey: 'tf6M' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Custom Recharts tooltip
// ─────────────────────────────────────────────────────────────────────────────

interface CustomTooltipPayload {
  ts: string;
  price: number;
  volume?: number;
}

const CustomTooltip: FC<
  TooltipProps<ValueType, NameType> & {
    currency: string;
    unit: string;
    contextNote: string;
    labelOpen: string;
    labelVolume: string;
    labelContext: string;
    basePrice: number;
  }
> = ({ active, payload, currency, unit, contextNote, labelOpen, labelVolume, labelContext, basePrice }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as CustomTooltipPayload;
  const change = point.price - basePrice;
  const changePct = ((change / basePrice) * 100).toFixed(2);
  const isUp  = change >= 0;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(point.price);

  // Style: matches bg-ink-3 + border-gold from design system
  const tooltipStyle: CSSProperties = {
    background: 'rgba(15, 18, 26, 0.97)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1)',
    padding: '12px 14px',
    minWidth: '200px',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div style={tooltipStyle}>
      {/* Date */}
      <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        {new Date(point.ts + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })}
      </p>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
          {formattedPrice}
        </span>
        <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '11px' }}>/{unit}</span>
      </div>

      {/* Change */}
      <p style={{
        color: isUp ? '#4ade80' : '#f87171',
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: 600,
        marginBottom: 8,
      }}>
        {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct}%)
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(212,175,55,0.15)', marginBottom: 8 }} />

      {/* Volume (if available) */}
      {point.volume !== undefined && (
        <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '11px', marginBottom: 6 }}>
          <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {labelVolume}:&nbsp;
          </span>
          {new Intl.NumberFormat('en-US').format(point.volume ?? 0)}
        </p>
      )}

      {/* Physical context note */}
      <div style={{
        background: 'rgba(212,175,55,0.06)',
        border: '1px solid rgba(212,175,55,0.15)',
        borderRadius: '6px',
        padding: '6px 8px',
        marginTop: 4,
      }}>
        <p style={{ color: 'rgba(212,175,55,0.6)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
          {labelContext}
        </p>
        <p style={{ color: 'rgba(203,213,225,0.75)', fontSize: '11px', lineHeight: 1.5 }}>
          {contextNote}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Chart skeleton
// ─────────────────────────────────────────────────────────────────────────────

const ChartSkeleton: FC = () => (
  <div className="flex flex-col gap-3 h-[300px] animate-pulse" aria-label="Loading chart…">
    <div className="h-3 w-24 rounded bg-ink-3" />
    <div className="flex-1 rounded-lg bg-ink-3/60" />
    <div className="flex gap-2">
      {[40, 40, 40, 40].map((w, i) => (
        <div key={i} className="h-7 rounded-md bg-ink-3" style={{ width: w }} />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tick formatters
// ─────────────────────────────────────────────────────────────────────────────

function xTickFormatter(ts: string, timeframe: ChartTimeframe): string {
  const d = new Date(ts + 'T00:00:00');
  if (timeframe === '1D' || timeframe === '5D') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function yTickFormatter(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export const CommodityChart: FC<CommodityChartProps> = ({
  symbol,
  name,
  currency,
  unit,
  data,
  physicalContextKey,
  isLoading = false,
  className = '',
}) => {
  const t = useTranslations('chart');

  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1M');

  // Use provided data or fall back to generated mock
  const fullHistory = useMemo<PriceDataPoint[]>(
    () => data ?? FULL_HISTORY,
    [data]
  );

  // Slice by selected timeframe
  const visibleData = useMemo(() => {
    const tf   = TIMEFRAMES.find((x) => x.id === timeframe)!;
    const from = new Date();
    from.setDate(from.getDate() - tf.days);
    const fromStr = from.toISOString().slice(0, 10);
    const sliced = fullHistory.filter((p) => p.ts >= fromStr);
    // Always show at least 2 points for the chart to render
    return sliced.length >= 2 ? sliced : fullHistory.slice(-2);
  }, [fullHistory, timeframe]);

  // Domain & derived stats
  const prices     = visibleData.map((p) => p.price);
  const priceMin   = Math.min(...prices);
  const priceMax   = Math.max(...prices);
  const priceRange = priceMax - priceMin;
  const yPad       = priceRange * 0.08;
  const yDomain: [number, number] = [priceMin - yPad, priceMax + yPad];

  const firstPrice = visibleData[0]?.price ?? 0;
  const lastPrice  = visibleData[visibleData.length - 1]?.price ?? 0;
  const periodChange    = lastPrice - firstPrice;
  const periodChangePct = firstPrice ? ((periodChange / firstPrice) * 100).toFixed(2) : '0.00';
  const isUp            = periodChange >= 0;

  const lineColor = isUp ? '#4ade80' : '#f87171';

  const contextNote = physicalContextKey
    ? t(physicalContextKey)
    : t('defaultPhysicalContext', { symbol });

  // Determine sensible tick count to avoid clutter
  const xTickCount = timeframe === '1D' ? 4 : timeframe === '5D' ? 5 : timeframe === '1M' ? 6 : 8;

  if (isLoading) return <ChartSkeleton />;

  return (
    <div className={`flex flex-col gap-4 rounded-xl border border-border-subtle bg-ink p-5 ${className}`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-base leading-tight">{name}</h3>
            <span className="font-mono text-[10px] text-text-secondary border border-border-subtle rounded px-1.5 py-px">
              {symbol}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-mono font-bold text-2xl text-gold tabular-nums leading-none">
              {new Intl.NumberFormat('en-US', {
                style: 'currency', currency, minimumFractionDigits: 2,
              }).format(lastPrice)}
            </span>
            <span className="text-text-secondary text-xs">/{unit}</span>
          </div>
          <p className={`font-mono text-sm font-medium mt-0.5 tabular-nums ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{periodChange.toFixed(2)} ({isUp ? '+' : ''}{periodChangePct}%)
            <span className="text-text-secondary font-normal ml-1.5">
              {TIMEFRAMES.find((x) => x.id === timeframe)?.id}
            </span>
          </p>
        </div>

        {/* Timeframe selector */}
        <div
          className="flex items-center rounded-lg border border-border-subtle bg-ink-2 p-1 gap-0.5"
          role="group"
          aria-label={t('timeframeLabel')}
        >
          {TIMEFRAMES.map(({ id, labelKey }) => (
            <button
              key={id}
              onClick={() => setTimeframe(id)}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-semibold font-mono tracking-wide transition-all duration-150',
                timeframe === id
                  ? 'bg-gold text-ink shadow-sm'
                  : 'text-text-secondary hover:text-white hover:bg-ink-3',
              ].join(' ')}
              type="button"
              aria-pressed={timeframe === id}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ───────────────────────────────────────────────────────── */}
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleData}
            margin={{ top: 4, right: 8, bottom: 0, left: 4 }}
          >
            <defs>
              <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={lineColor} stopOpacity={0.12} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(148,163,184,0.07)"
              vertical={false}
            />

            <XAxis
              dataKey="ts"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(148,163,184,0.55)', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(ts) => xTickFormatter(ts as string, timeframe)}
              interval="preserveStartEnd"
              tickCount={xTickCount}
            />

            <YAxis
              domain={yDomain}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(148,163,184,0.55)', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(v) => yTickFormatter(v as number, currency)}
              width={72}
              tickCount={5}
            />

            {/* Opening price reference line */}
            <ReferenceLine
              y={firstPrice}
              stroke="rgba(212,175,55,0.2)"
              strokeDasharray="3 4"
              label={{
                value: t('openLabel'),
                fill: 'rgba(212,175,55,0.4)',
                fontSize: 9,
                fontFamily: 'monospace',
                position: 'insideTopRight',
              }}
            />

            <Tooltip
              content={
                <CustomTooltip
                  currency={currency}
                  unit={unit}
                  contextNote={contextNote}
                  labelOpen={t('openLabel')}
                  labelVolume={t('colVolume')}
                  labelContext={t('physicalContextLabel')}
                  basePrice={firstPrice}
                />
              }
              cursor={{
                stroke: 'rgba(212,175,55,0.3)',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
            />

            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={1.75}
              dot={false}
              activeDot={{
                r: 4,
                fill: lineColor,
                stroke: 'rgba(15,18,26,0.9)',
                strokeWidth: 2,
              }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Footer disclaimer ───────────────────────────────────────────── */}
      <p className="text-[10px] text-text-secondary/60 text-right">
        {t('chartDisclaimer')}
      </p>
    </div>
  );
};

export default CommodityChart;
