# Aurexon v7.22

> Physical Commodity Intelligence Platform  
> **v7.19 visual design · v7.20 full functionality · GitHub + Vercel ready**

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Add background images (optional — placeholders provided)
# public/images/hero-bg.jpg   →  Home hero background
# public/images/about-bg.jpg  →  About hero background

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

### One-click (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo
3. Add environment variables in the Vercel dashboard:
   ```
   NEXT_PUBLIC_SITE_URL   = https://your-domain.com
   NEXT_PUBLIC_QUOTE_EMAIL = trading@aurexon.com
   ```
4. Click **Deploy**

### CLI

```bash
npm i -g vercel
vercel --prod
```

Vercel auto-detects Next.js. The included `vercel.json` sets the region to `fra1` (Frankfurt) and adds security headers.

---

## Deploy to GitHub Pages / Static Export

Not recommended — this project uses Next.js App Router with server components and `next-intl` server-side locale detection, which requires a Node.js runtime. Use Vercel, Railway, Render, or any Node.js host.

---

## Project Structure

```
aurexon-v7.22/
├── .github/
│   └── workflows/
│       └── ci.yml              GitHub Actions — type-check + lint + build
├── public/
│   └── images/
│       ├── hero-bg.jpg         Replace with real home hero image
│       ├── about-bg.jpg        Replace with real about hero image
│       └── README.txt          Image replacement guide
├── messages/
│   ├── en.json                 165 keys · 12 namespaces
│   ├── de.json                 165 keys · 12 namespaces
│   └── es.json                 165 keys · 12 namespaces
├── src/
│   ├── app/
│   │   ├── globals.css                 v7.19 design tokens + hero-image utilities
│   │   └── [locale]/
│   │       ├── layout.tsx              Root locale layout (Nav + Ticker + Footer)
│   │       ├── page.tsx                Home (hero bg image, features, market preview)
│   │       ├── markets/page.tsx        Markets (table + chart + calculator)
│   │       ├── incoterms/page.tsx      Incoterms® 2020 interactive tool
│   │       └── about/page.tsx          About (about bg image, values, team, CTA)
│   ├── components/
│   │   ├── MarketTable.tsx     ★ Watchlist (localStorage), sparklines, volume, sort
│   │   ├── CommodityChart.tsx  ★ Recharts line chart, 4 timeframes, themed tooltip
│   │   ├── BasisCalculator.tsx ★ Delivered price, basis bps, insurance, mailto CTA
│   │   ├── IncotermsClient.tsx ★ All 11 ICC rules, visual timeline, 6-cell matrix
│   │   ├── HeroSection.tsx       Background image + v7.19 hero layout
│   │   ├── MarketsClient.tsx     Markets page shell (dynamic chart import)
│   │   ├── Navigation.tsx        Fixed header, locale switcher, mobile menu
│   │   ├── PriceTicker.tsx       Animated live price strip
│   │   └── Footer.tsx            Site footer
│   ├── lib/
│   │   ├── incotermsData.ts    ICC 2020 data — all 11 rules, trilingual
│   │   └── mockData.ts         13 commodity rows + physical context notes
│   └── i18n/
│       ├── routing.ts          next-intl locale config (en/de/es)
│       └── request.ts          next-intl server config
├── tailwind.config.ts          v7.19 design system tokens
├── middleware.ts               next-intl locale routing middleware
└── vercel.json                 Vercel deployment config
```

---

## v7.22 Design × Functionality Matrix

| Area | Source | Detail |
|---|---|---|
| Color palette | v7.19 | `gold: #C9A84C`, `ink: #0A0D14`, muted text/status |
| Typography | v7.19 | System font stack, tighter tracking |
| Border radius | v7.19 | `rounded-md` (8px) base, not rounded-xl |
| Button style | v7.19 | No glow shadow, solid border |
| Form inputs | v7.19 | Solid `bg-ink-3` fill + inset shadow |
| Cards | v7.19 | Depth shadow, no hover glow ring |
| Animations | v7.19 | Ticker + fade-in only; no pulse-gold |
| Hero background image | v7.22 | `public/images/hero-bg.jpg` + gradient overlay |
| About background image | v7.22 | `public/images/about-bg.jpg` + gradient overlay |
| MarketTable | v7.20 | Watchlist, sparklines, volume, sortable columns |
| CommodityChart | v7.20 | Recharts, timeframes, physical-context tooltip |
| BasisCalculator | v7.20 | Basis bps, insurance, mailto/modal CTA |
| IncotermsClient | v7.20 | 11 ICC rules, risk/cost timeline, responsibility matrix |
| Trilingual i18n | v7.20 | EN / DE / ES, 165 keys, 12 namespaces |
| About page | v7.22 | New page — values, team, mission, CTA |

---

## Design Tokens (v7.19)

| Token | Value | Usage |
|---|---|---|
| `bg-ink` | `#0A0D14` | Page background |
| `bg-ink-2` | `#12161F` | Card surface |
| `bg-ink-3` | `#181D28` | Input fill, elevated surface |
| `text-gold` | `#C9A84C` | Brand accent, selected states |
| `gold-dark` | `#A8853A` | Button hover |
| `border-default` | `#1F2535` | Standard border |
| `border-subtle` | `#191E2B` | Dividers |
| `text-primary` | `#E8EAF0` | Body text |
| `text-secondary` | `#7B8BA4` | Labels / captions |
| `text-muted` | `#3D4B61` | Disabled / meta |
| `success` | `#16A34A` | Positive price change |
| `error` | `#DC2626` | Negative price change |

---

## Background Images

Drop your images into `public/images/` — the SVG placeholders are replaced automatically on next build.

| File | Used on | Style |
|---|---|---|
| `hero-bg.jpg` | Home hero | `opacity: 0.22`, gradient overlay |
| `about-bg.jpg` | About hero | `opacity: 0.18`, gradient overlay |

Tune `imageOpacity` (0–1) and `overlayVariant` (`"normal"` or `"light"`) as props on `<HeroSection>` and directly in `about/page.tsx`.

---

## Locale Routing

| URL | Locale |
|---|---|
| `/` | English (default, no prefix) |
| `/de`, `/de/markets`, etc. | Deutsch |
| `/es`, `/es/incoterms`, etc. | Español |

---

## Replacing Mock Data with Live Prices

`src/lib/mockData.ts` exports `MOCK_COMMODITIES: CommodityRow[]`.

For live data, create an API route or use SWR in `MarketsClient.tsx`:

```ts
const { data, isLoading, error } = useSWR<CommodityRow[]>(
  '/api/commodities',
  fetcher,
  { refreshInterval: 15_000 }
);
<MarketTable rows={data ?? []} isLoading={isLoading} error={error?.message} />
```

---

*Incoterms® is a registered trademark of the International Chamber of Commerce (ICC).*  
*This platform is for informational purposes only. Not investment advice.*
