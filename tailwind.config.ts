import type { Config } from 'tailwindcss';

// ─────────────────────────────────────────────────────────────────────────────
// Aurexon v7.19 Design System
// Restored for v7.21: muted gold, deeper ink, refined financial-terminal
// aesthetic. No decorative glow utilities from v7.20.
// ─────────────────────────────────────────────────────────────────────────────

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Core dark palette — v7.19 values ──────────────────────────
        // Slightly deeper and more neutral than v7.20
        ink: {
          DEFAULT: '#0A0D14',   // v7.20 was #080B10
          '2':     '#12161F',   // v7.20 was #0E1219
          '3':     '#181D28',   // v7.20 was #141B25
        },

        // ── Brand gold — v7.19 muted antique gold ─────────────────────
        // v7.20 used a brighter #D4AF37. v7.19 was a warmer, more muted
        // #C9A84C that reads as premium rather than vivid.
        gold: {
          DEFAULT: '#C9A84C',   // v7.20 was #D4AF37
          dark:    '#A8853A',   // v7.20 was #B8962E
          light:   '#DFC06A',   // v7.20 was #E8CB5A
        },

        // ── Borders — v7.19 slightly cooler/tighter ───────────────────
        'border-default': '#1F2535',  // v7.20 was #1E2636
        'border-subtle':  '#191E2B',  // v7.20 was #141C2C

        // ── Text — v7.19 slightly cooler, less blue-white ─────────────
        'text-primary':   '#E8EAF0',  // v7.20 was #F1F5F9 (too bright)
        'text-secondary': '#7B8BA4',  // v7.20 was #8B9CB6
        'text-muted':     '#3D4B61',  // v7.20 was #4B5568

        // ── Status — v7.19 deeper, less neon ─────────────────────────
        success: '#16A34A',   // v7.20 was #22C55E (too vivid)
        error:   '#DC2626',   // v7.20 was #EF4444 (too vivid)
        warning: '#CA8A04',   // v7.20 was #F59E0B
        info:    '#0284C7',   // v7.20 was #38BDF8

        // ── Sky tones — kept identical (Incoterms buyer colour) ───────
        sky: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
      },

      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Menlo', 'monospace'],
      },

      // ── Border radius — v7.19 tighter, more terminal-like ───────────
      // v7.20 leaned on rounded-xl/2xl. v7.19 used rounded-md/lg.
      borderRadius: {
        DEFAULT: '6px',
        sm:  '4px',
        md:  '8px',
        lg:  '10px',
        xl:  '12px',   // still available but used sparingly
        '2xl': '16px',
        full: '9999px',
      },

      // ── Box shadows — v7.19 subtle depth, no glow rings ─────────────
      // v7.20 introduced gold-sm/md/lg glow rings. v7.19 used clean
      // depth shadows only.
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.55)',
        input:      'inset 0 1px 2px rgba(0,0,0,0.35)',
        'gold-focus':'0 0 0 2px rgba(201,168,76,0.22)',
        popover:    '0 8px 24px rgba(0,0,0,0.65)',
      },

      // ── Animations — v7.19 kept only what's functional ──────────────
      // Removed: pulse-gold, slide-up (decorative). Kept: ticker, fade-in.
      animation: {
        'ticker':      'ticker 45s linear infinite',
        'fade-in':     'fadeIn 0.25s ease-out',
        'slide-down':  'slideDown 0.2s ease-out',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ── Background images — v7.19 intentionally empty ────────────────
      // v7.20 added bg-noise, bg-grid-gold, bg-hero-glow, bg-radial-gold
      // as ambient decorative layers. These are removed in v7.19.
      // The only background utility added for v7.21 is the image overlay
      // helper used exclusively in HeroSection and the About hero;
      // it is defined in globals.css, not here.
    },
  },
  plugins: [],
};

export default config;
