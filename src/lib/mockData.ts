// ─────────────────────────────────────────────────────────────────────────────
// src/lib/mockData.ts
// Aurexon v7.20 — Mock commodity data (replace with live API in production)
// ─────────────────────────────────────────────────────────────────────────────

import type { CommodityRow } from '@/components/MarketTable';

/** Generate a deterministic 7-point sparkline from a seed */
function mockTrend(seed: number, up: boolean): number[] {
  const base = seed;
  const dir  = up ? 1 : -1;
  return [
    base,
    base + dir * seed * 0.005 * 1.2,
    base + dir * seed * 0.008 * 0.9,
    base + dir * seed * 0.011 * 1.1,
    base + dir * seed * 0.009 * 1.4,
    base + dir * seed * 0.014 * 0.8,
    base + dir * seed * 0.018,
  ];
}

export const MOCK_COMMODITIES: CommodityRow[] = [
  // ── Metals ─────────────────────────────────────────────────────────────
  {
    symbol:    'LME_CU',
    name:      'LME Copper',
    currency:  'USD',
    unit:      'mt',
    category:  'metals',
    price:     9_487.50,
    change:    +112.50,
    changePct: +1.20,
    volume:    284_600,
    weekTrend: mockTrend(9_487.50, true),
  },
  {
    symbol:    'LME_AL',
    name:      'LME Aluminium',
    currency:  'USD',
    unit:      'mt',
    category:  'metals',
    price:     2_418.00,
    change:    -24.00,
    changePct: -0.98,
    volume:    512_400,
    weekTrend: mockTrend(2_418.00, false),
  },
  {
    symbol:    'LME_ZN',
    name:      'LME Zinc',
    currency:  'USD',
    unit:      'mt',
    category:  'metals',
    price:     2_956.00,
    change:    +38.50,
    changePct: +1.32,
    volume:    148_200,
    weekTrend: mockTrend(2_956.00, true),
  },
  {
    symbol:    'LME_NI',
    name:      'LME Nickel',
    currency:  'USD',
    unit:      'mt',
    category:  'metals',
    price:     16_885.00,
    change:    -215.00,
    changePct: -1.26,
    volume:    89_300,
    weekTrend: mockTrend(16_885.00, false),
  },
  {
    symbol:    'LME_PB',
    name:      'LME Lead',
    currency:  'USD',
    unit:      'mt',
    category:  'metals',
    price:     1_987.50,
    change:    +12.50,
    changePct: +0.63,
    volume:    67_100,
    weekTrend: mockTrend(1_987.50, true),
  },
  {
    symbol:    'XAUUSD',
    name:      'Gold Spot',
    currency:  'USD',
    unit:      'oz',
    category:  'metals',
    price:     2_384.20,
    change:    +18.60,
    changePct: +0.79,
    volume:    null,
    weekTrend: mockTrend(2_384.20, true),
  },
  {
    symbol:    'XAGUSD',
    name:      'Silver Spot',
    currency:  'USD',
    unit:      'oz',
    category:  'metals',
    price:     31.44,
    change:    -0.28,
    changePct: -0.88,
    volume:    null,
    weekTrend: mockTrend(31.44, false),
  },
  // ── Energy ─────────────────────────────────────────────────────────────
  {
    symbol:    'BRT',
    name:      'Brent Crude',
    currency:  'USD',
    unit:      'bbl',
    category:  'energy',
    price:     84.72,
    change:    +0.94,
    changePct: +1.12,
    volume:    1_284_000,
    weekTrend: mockTrend(84.72, true),
  },
  {
    symbol:    'WTI',
    name:      'WTI Crude',
    currency:  'USD',
    unit:      'bbl',
    category:  'energy',
    price:     80.15,
    change:    +0.82,
    changePct: +1.03,
    volume:    1_640_000,
    weekTrend: mockTrend(80.15, true),
  },
  {
    symbol:    'NATGAS',
    name:      'Natural Gas',
    currency:  'USD',
    unit:      'mmbtu',
    category:  'energy',
    price:     2.847,
    change:    -0.043,
    changePct: -1.49,
    volume:    756_000,
    weekTrend: mockTrend(2.847, false),
  },
  // ── Agriculture ────────────────────────────────────────────────────────
  {
    symbol:    'CBOT_W',
    name:      'CBOT Wheat',
    currency:  'USD',
    unit:      'bu',
    category:  'agriculture',
    price:     594.25,
    change:    +8.75,
    changePct: +1.49,
    volume:    312_000,
    weekTrend: mockTrend(594.25, true),
  },
  {
    symbol:    'CBOT_C',
    name:      'CBOT Corn',
    currency:  'USD',
    unit:      'bu',
    category:  'agriculture',
    price:     454.50,
    change:    -6.25,
    changePct: -1.36,
    volume:    428_000,
    weekTrend: mockTrend(454.50, false),
  },
  {
    symbol:    'CBOT_S',
    name:      'CBOT Soybeans',
    currency:  'USD',
    unit:      'bu',
    category:  'agriculture',
    price:     1_178.75,
    change:    +14.25,
    changePct: +1.22,
    volume:    285_000,
    weekTrend: mockTrend(1_178.75, true),
  },
];

/** Ticker strip items derived from commodity rows */
export interface TickerItem {
  symbol:    string;
  price:     number;
  changePct: number;
  currency:  string;
}

export const TICKER_ITEMS: TickerItem[] = MOCK_COMMODITIES.map(({ symbol, price, changePct, currency }) => ({
  symbol, price, changePct, currency,
}));

/** Physical context notes per symbol (used in chart tooltip) */
export const PHYSICAL_CONTEXT: Record<string, string> = {
  LME_CU:  'LME Grade A Copper Cathode. Cash settlement + $112 premium over 3M futures. Warrant queues elevated in Rotterdam.',
  LME_AL:  'LME P1020A Aluminium. Midwest premium softening. Cancelled warrants at 18% of on-warrant stock.',
  LME_ZN:  'LME SHG Zinc. TC/RC negotiations ongoing. Smelter capacity returning in China.',
  LME_NI:  'LME Nickel Class I. Indonesia NPI exports elevated. Battery-grade demand offset by stainless softness.',
  LME_PB:  'LME Lead. Seasonal battery demand supporting prompt. Secondary supply tight in Europe.',
  XAUUSD:  'Spot Gold (LBMA). Central bank buying remains elevated. ETF flows turned positive for 3rd consecutive week.',
  XAGUSD:  'Spot Silver (LBMA). Industrial demand from solar sector providing support below $31.00.',
  BRT:     'ICE Brent Crude (front month). OPEC+ compliance steady at 94%. North Sea Forties blend trading near flat.',
  WTI:     'NYMEX WTI (front month). Cushing stocks at seasonal low. Shale activity flat on rig count.',
  NATGAS:  'NYMEX Henry Hub. Storage build above 5-year average. Weather-adjusted demand neutral.',
  CBOT_W:  'CBOT Soft Red Winter Wheat. Black Sea export pace slowing. FOB Gulf premiums firming.',
  CBOT_C:  'CBOT Yellow Corn. South American harvest pressure. Ethanol margins recovering.',
  CBOT_S:  'CBOT No.2 Yellow Soybeans. US planting progress ahead of average. Crush margins supportive.',
};
