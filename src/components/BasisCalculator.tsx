'use client';

// ─────────────────────────────────────────────────────────────────────────────
// src/components/BasisCalculator.tsx
// Aurexon v7.19 — Physical Commodity Basis & Delivered Price Calculator
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState,
  useMemo,
  useCallback,
  useId,
  type FC,
  type ChangeEvent,
} from 'react';
import { useTranslations } from 'next-intl';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type PricingConvention = 'lme' | 'comex' | 'nymex' | 'cbot' | 'ice' | 'custom';

export interface BasisCalculatorProps {
  /** Pre-fill the base spot price — e.g. from a live market feed */
  initialSpotPrice?: number;
  /** ISO 4217 currency — affects formatting */
  currency?: string;
  /** Unit label displayed after prices */
  unit?: string;
  /** Commodity exchange label */
  exchange?: string;
  /** Commodity display name */
  commodityName?: string;
  /**
   * When provided, the "Request Firm Quote" button triggers this callback
   * instead of the default mailto: link (e.g. to open a modal).
   */
  onRequestQuote?: (quoteData: QuoteRequestData) => void;
  /** Recipient email for the mailto fallback */
  quoteEmailRecipient?: string;
  /** Additional CSS class for the outer wrapper */
  className?: string;
}

export interface QuoteRequestData {
  commodityName: string;
  exchange: string;
  currency: string;
  unit: string;
  spotPrice: number;
  premium: number;
  freight: number;
  deliveredPrice: number;
  insuranceCost: number;
  totalLandedCost: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Safely parse a controlled string input to a finite float, else 0 */
function parseField(raw: string): number {
  const v = parseFloat(raw.replace(/,/g, ''));
  return isFinite(v) ? v : 0;
}

/** Clamp a string so it only contains numeric + sign chars */
function sanitizeNumericInput(raw: string): string {
  return raw.replace(/[^0-9.\-]/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG icons
// ─────────────────────────────────────────────────────────────────────────────

const IconCalculator: FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconSend: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const IconInfo: FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const IconChevronRight: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface CalculatorFieldProps {
  id: string;
  label: string;
  tooltip?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  isNegativeAllowed?: boolean;
  highlight?: boolean;
}

const CalculatorField: FC<CalculatorFieldProps> = ({
  id,
  label,
  tooltip,
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0.00',
  isNegativeAllowed = false,
  highlight = false,
}) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    if (!isNegativeAllowed) raw = raw.replace(/-/g, '');
    onChange(sanitizeNumericInput(raw));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className="form-label text-[11px] font-semibold uppercase tracking-widest text-text-secondary"
        >
          {label}
        </label>
        {tooltip && (
          <span
            className="text-text-secondary/50 hover:text-text-secondary transition-colors cursor-help"
            title={tooltip}
            aria-label={tooltip}
          >
            <IconInfo />
          </span>
        )}
      </div>

      <div
        className={[
          'relative flex items-center rounded-lg border transition-all duration-150',
          focused
            ? 'border-gold/60 ring-1 ring-gold/20 bg-ink-2'
            : highlight
              ? 'border-gold/30 bg-ink-2/80'
              : 'border-border-subtle bg-ink-2 hover:border-border-subtle/80',
        ].join(' ')}
      >
        {prefix && (
          <span className="pl-3 pr-1 font-mono text-sm text-text-secondary shrink-0 select-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={[
            'form-input flex-1 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none',
            'font-mono text-sm py-2.5 px-3',
            'text-white placeholder:text-text-secondary/40',
            highlight ? 'text-gold font-semibold' : '',
            prefix ? 'pl-0' : '',
          ].join(' ')}
          aria-label={label}
        />
        {suffix && (
          <span className="pr-3 pl-1 font-mono text-xs text-text-secondary shrink-0 select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Result row in the breakdown panel ────────────────────────────────────────
interface ResultRowProps {
  label: string;
  value: string;
  isBold?: boolean;
  isGold?: boolean;
  sign?: string;
  signColor?: string;
  indent?: boolean;
}

const ResultRow: FC<ResultRowProps> = ({
  label, value, isBold = false, isGold = false, sign = '', signColor = '', indent = false,
}) => (
  <div
    className={[
      'flex items-center justify-between gap-2 py-2',
      indent ? 'pl-3' : '',
    ].join(' ')}
  >
    <span
      className={[
        'text-xs leading-tight',
        isBold ? 'font-semibold text-white' : 'text-text-secondary',
        indent ? 'text-[11px]' : '',
      ].join(' ')}
    >
      {label}
    </span>
    <span
      className={[
        'font-mono text-sm tabular-nums shrink-0',
        isGold    ? 'font-bold text-gold' : '',
        isBold && !isGold ? 'font-semibold text-white' : '',
        !isBold && !isGold ? 'text-text-secondary' : '',
        signColor,
      ].join(' ')}
    >
      {sign}{value}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export const BasisCalculator: FC<BasisCalculatorProps> = ({
  initialSpotPrice,
  currency = 'USD',
  unit = 't',
  exchange = 'LME',
  commodityName = 'Commodity',
  onRequestQuote,
  quoteEmailRecipient = 'trading@aurexon.com',
  className = '',
}) => {
  const t  = useTranslations('calculator');
  const id = useId();

  // ── Field state ──────────────────────────────────────────────────────────
  const [spotRaw,      setSpotRaw]      = useState(initialSpotPrice?.toFixed(2) ?? '');
  const [premiumRaw,   setPremiumRaw]   = useState('');
  const [freightRaw,   setFreightRaw]   = useState('');
  const [insurancePct, setInsurancePct] = useState('0.15');   // % of CIF value
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Derived calculations ─────────────────────────────────────────────────
  const {
    spotPrice,
    premium,
    freight,
    insurance,
    insuranceCost,
    deliveredPrice,
    totalLandedCost,
    basisBps,
  } = useMemo(() => {
    const spotPrice     = parseField(spotRaw);
    const premium       = parseField(premiumRaw);
    const freight       = parseField(freightRaw);
    const insurance     = parseField(insurancePct);
    const cifBase       = spotPrice + premium + freight;
    const insuranceCost = cifBase * (insurance / 100);
    const deliveredPrice  = spotPrice + premium + freight;
    const totalLandedCost = deliveredPrice + insuranceCost;
    const basisBps = spotPrice > 0
      ? Math.round(((premium / spotPrice) * 10_000))
      : 0;
    return { spotPrice, premium, freight, insurance, insuranceCost, deliveredPrice, totalLandedCost, basisBps };
  }, [spotRaw, premiumRaw, freightRaw, insurancePct]);

  const isValid = spotPrice > 0;

  // ── Quote request ────────────────────────────────────────────────────────
  const handleRequestQuote = useCallback(() => {
    const data: QuoteRequestData = {
      commodityName,
      exchange,
      currency,
      unit,
      spotPrice,
      premium,
      freight,
      deliveredPrice,
      insuranceCost,
      totalLandedCost,
    };

    if (onRequestQuote) {
      onRequestQuote(data);
      return;
    }

    // Mailto fallback
    const subject = encodeURIComponent(
      `Firm Quote Request — ${commodityName} @ ${formatCurrency(deliveredPrice, currency)}/${unit}`
    );
    const body = encodeURIComponent([
      `Commodity: ${commodityName} (${exchange})`,
      ``,
      `--- Basis Calculation ---`,
      `Base Spot / Futures Price : ${formatCurrency(spotPrice, currency)}/${unit}`,
      `Premium / Discount        : ${premium >= 0 ? '+' : ''}${formatCurrency(premium, currency)}/${unit}`,
      `Freight / Logistics       : ${formatCurrency(freight, currency)}/${unit}`,
      `Insurance (${insurance}%)      : ${formatCurrency(insuranceCost, currency)}/${unit}`,
      ``,
      `Estimated Delivered Price : ${formatCurrency(deliveredPrice, currency)}/${unit}`,
      `Total Landed Cost (w/ Ins): ${formatCurrency(totalLandedCost, currency)}/${unit}`,
      `Basis                     : ${basisBps > 0 ? '+' : ''}${basisBps} bps`,
      ``,
      `Please provide a firm quotation for the above specification.`,
    ].join('\n'));

    window.location.href = `mailto:${quoteEmailRecipient}?subject=${subject}&body=${body}`;
  }, [
    commodityName, exchange, currency, unit, spotPrice, premium,
    freight, deliveredPrice, insuranceCost, totalLandedCost, insurance,
    basisBps, quoteEmailRecipient, onRequestQuote,
  ]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`rounded-xl border border-border-subtle bg-ink overflow-hidden ${className}`}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle bg-ink-2/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 text-gold shrink-0">
          <IconCalculator className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm leading-tight">
            {t('title')}
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {t('subtitle', { exchange, commodity: commodityName })}
          </p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary/50 border border-border-subtle rounded px-1.5 py-px">
            {currency}/{unit}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">

        {/* ── Input panel ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 p-5">
          <CalculatorField
            id={`${id}-spot`}
            label={t('labelSpot')}
            tooltip={t('tooltipSpot', { exchange })}
            value={spotRaw}
            onChange={setSpotRaw}
            prefix={currency === 'USD' ? '$' : currency}
            suffix={`/${unit}`}
            placeholder="9,450.00"
            highlight
          />

          <CalculatorField
            id={`${id}-premium`}
            label={t('labelPremium')}
            tooltip={t('tooltipPremium')}
            value={premiumRaw}
            onChange={setPremiumRaw}
            prefix="+"
            suffix={`/${unit}`}
            placeholder="150.00"
            isNegativeAllowed
          />

          <CalculatorField
            id={`${id}-freight`}
            label={t('labelFreight')}
            tooltip={t('tooltipFreight')}
            value={freightRaw}
            onChange={setFreightRaw}
            prefix={currency === 'USD' ? '$' : currency}
            suffix={`/${unit}`}
            placeholder="45.00"
          />

          {/* Advanced toggle */}
          <div>
            <button
              type="button"
              className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary hover:text-gold transition-colors tracking-wide uppercase"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
            >
              <IconChevronRight
                className={`w-3 h-3 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`}
              />
              {t('advancedToggle')}
            </button>

            {showAdvanced && (
              <div className="mt-3">
                <CalculatorField
                  id={`${id}-insurance`}
                  label={t('labelInsurance')}
                  tooltip={t('tooltipInsurance')}
                  value={insurancePct}
                  onChange={setInsurancePct}
                  suffix="%"
                  placeholder="0.15"
                />
                <p className="mt-1.5 text-[10px] text-text-secondary/60">
                  {t('insuranceNote')}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleRequestQuote}
            disabled={!isValid}
            className={[
              'btn-primary mt-auto w-full flex items-center justify-center gap-2',
              'rounded-lg px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-150',
              isValid
                ? 'bg-gold text-ink hover:bg-gold-dark active:scale-[0.99]'
                : 'bg-ink-3 text-text-secondary cursor-not-allowed opacity-60',
            ].join(' ')}
            aria-disabled={!isValid}
            title={!isValid ? t('ctaDisabledHint') : undefined}
          >
            <IconSend className="w-4 h-4" />
            {t('ctaLabel')}
          </button>

          {isValid && (
            <p className="text-[10px] text-text-secondary/50 text-center -mt-2">
              {t('ctaNote', { email: quoteEmailRecipient })}
            </p>
          )}
        </div>

        {/* ── Results panel ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-0 p-5 bg-ink-2/30">
          {/* Panel title */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary mb-3">
            {t('breakdownTitle')}
          </p>

          {!isValid ? (
            <div className="flex flex-1 items-center justify-center py-8 text-center">
              <p className="text-text-secondary text-sm">{t('breakdownEmpty')}</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border-subtle/50">
                <ResultRow
                  label={t('labelSpot')}
                  value={formatCurrency(spotPrice, currency)}
                  isBold
                />
                <ResultRow
                  label={t('labelPremium')}
                  value={formatCurrency(Math.abs(premium), currency)}
                  sign={premium >= 0 ? '+ ' : '− '}
                  signColor={premium >= 0 ? 'text-emerald-400' : 'text-red-400'}
                  indent
                />
                <ResultRow
                  label={t('labelFreight')}
                  value={formatCurrency(freight, currency)}
                  sign="+ "
                  indent
                />

                {/* Delivered price */}
                <div className="py-3 border-t border-gold/20 bg-gold/[0.03] rounded-lg -mx-1 px-1 mt-1">
                  <ResultRow
                    label={t('deliveredLabel')}
                    value={formatCurrency(deliveredPrice, currency)}
                    isGold
                    isBold
                  />
                </div>

                {showAdvanced && insuranceCost > 0 && (
                  <>
                    <ResultRow
                      label={t('labelInsuranceCalc', { pct: insurance })}
                      value={formatCurrency(insuranceCost, currency)}
                      sign="+ "
                      indent
                    />
                    <div className="py-3">
                      <ResultRow
                        label={t('totalLandedLabel')}
                        value={formatCurrency(totalLandedCost, currency)}
                        isBold
                        isGold
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Basis indicator */}
              {spotPrice > 0 && (
                <div className="mt-4 rounded-lg border border-border-subtle bg-ink-3/50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary">{t('basisLabel')}</span>
                    <span className={[
                      'font-mono text-sm font-bold tabular-nums',
                      basisBps > 0 ? 'text-emerald-400' : basisBps < 0 ? 'text-red-400' : 'text-text-secondary',
                    ].join(' ')}>
                      {basisBps > 0 ? '+' : ''}{basisBps} bps
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary/50 mt-1">
                    {t('basisNote')}
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-text-secondary/40 mt-4 leading-relaxed">
                {t('disclaimer')}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasisCalculator;
