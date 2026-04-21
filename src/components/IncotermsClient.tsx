'use client';

// ─────────────────────────────────────────────────────────────────────────────
// src/components/IncotermsClient.tsx
// Interactive ICC Incoterms® 2020 educational tool
// Design system: ink / gold (Seller) / sky (Buyer) / success / error
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, type FC, type ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  INCOTERMS,
  INCOTERMS_ANY_MODE,
  INCOTERMS_SEA_ONLY,
  hasSplitTransfer,
  type Incoterm,
  type Responsibility,
  type TimelineStep,
} from '@/lib/incotermsData';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FilterMode = 'all' | 'any' | 'sea';
type TFunc = ReturnType<typeof useTranslations>;

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG Icons — zero external dependencies
// ─────────────────────────────────────────────────────────────────────────────

const IconFactory: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.25 21h19.5M9 20.25v-9l-3.75 2.25V9.75L9 7.5v-.75A2.25 2.25 0 0111.25 4.5h1.5A2.25 2.25 0 0115 6.75v.75l3.75 2.25v2.25L15 9.75v9" />
    <rect x="9.75" y="12" width="1.5" height="3" rx=".25" />
    <rect x="12.75" y="12" width="1.5" height="3" rx=".25" />
  </svg>
);

const IconAnchor: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="5.25" r="2.25" />
    <path d="M12 7.5v13.5M4.5 12a7.5 7.5 0 0015 0M4.5 12h15" />
  </svg>
);

const IconShip: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v7.5M9.75 7.5H14.25M4.5 14.25L3 19.5h18l-1.5-5.25M4.5 14.25h15M7.5 10.5H5.25l-.75 3.75M16.5 10.5H18.75l.75 3.75" />
  </svg>
);

const IconCrane: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21h18M6 21V9m0-6l12 6H6m12 12V9M6 13.5h4.5m-4.5 3h4.5" />
    <rect x="13.5" y="14.25" width="3" height="3" rx=".5" />
    <path d="M15 14.25v-3" />
  </svg>
);

const IconBuilding: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.75 21h16.5M4.5 3h15v18H4.5V3zm3.75 4.5h.75m-.75 3h.75m-.75 3h.75m3.75-9.75h.75m-.75 3h.75m-.75 3h.75" />
    <path d="M9 21v-3.375A1.125 1.125 0 0110.125 16.5h3.75A1.125 1.125 0 0115 17.625V21" />
  </svg>
);

const IconDocument: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 12h6m-6 3.75h6M7.5 21h9a2.25 2.25 0 002.25-2.25V8.25L14.25 3H7.5A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21z" />
    <path d="M14.25 3v5.25h5.25" />
  </svg>
);

const IconBox: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25M12 12.75V21" />
  </svg>
);

const IconTruck: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
);

const IconShield: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 3.375L4.875 6.75v5.25c0 4.043 3.206 7.312 7.125 7.5 3.919-.188 7.125-3.457 7.125-7.5V6.75L12 3.375z" />
  </svg>
);

const IconArrowDown: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconChevronDown: FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 9l-7 7-7-7" />
  </svg>
);

const IconSplit: FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Timeline step definitions
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineStepDef {
  labelKey: string;
  Icon: FC<{ className?: string }>;
}

const TIMELINE_STEP_DEFS: readonly TimelineStepDef[] = [
  { labelKey: 'stepOrigin',      Icon: IconFactory  },
  { labelKey: 'stepExportPort',  Icon: IconAnchor   },
  { labelKey: 'stepMainCarriage',Icon: IconShip     },
  { labelKey: 'stepImportPort',  Icon: IconCrane    },
  { labelKey: 'stepDestination', Icon: IconBuilding },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Responsibility matrix cell definitions
// ─────────────────────────────────────────────────────────────────────────────

interface MatrixCellDef {
  key: keyof Incoterm['responsibilities'];
  labelKey: string;
  Icon: FC<{ className?: string }>;
}

const MATRIX_CELLS: readonly MatrixCellDef[] = [
  { key: 'exportClearance',       labelKey: 'matrixExport',    Icon: IconDocument  },
  { key: 'loadingAtOrigin',       labelKey: 'matrixLoading',   Icon: IconBox       },
  { key: 'mainCarriage',          labelKey: 'matrixCarriage',  Icon: IconTruck     },
  { key: 'insurance',             labelKey: 'matrixInsurance', Icon: IconShield    },
  { key: 'unloadingAtDestination',labelKey: 'matrixUnloading', Icon: IconArrowDown },
  { key: 'importClearance',       labelKey: 'matrixImport',    Icon: IconDocument  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Responsibility badge ──────────────────────────────────────────────────────

interface BadgeProps {
  value: Responsibility;
  t: TFunc;
}

const ResponsibilityBadge: FC<BadgeProps> = ({ value, t }) => {
  const config: Record<Responsibility, { classes: string; label: string }> = {
    Seller:     { classes: 'bg-gold/15 text-gold border border-gold/30 font-semibold',         label: t('seller')     },
    Buyer:      { classes: 'bg-sky-500/10 text-sky-600 border border-sky-500/30 font-semibold', label: t('buyer')      },
    Negotiable: { classes: 'bg-ink-3 text-text-secondary border border-border-default',               label: t('negotiable') },
  };
  const { classes, label } = config[value];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] leading-5 tracking-wide ${classes}`}>
      {label}
    </span>
  );
};

// ── Single timeline row (Risk or Cost) ────────────────────────────────────────

interface TimelineRowProps {
  transferStep: TimelineStep;
  label: string;
  t: TFunc;
}

const TimelineRow: FC<TimelineRowProps> = ({ transferStep, label, t }) => {
  // grid: node(auto) connector(1fr) node(auto) ... × 5 nodes / 4 connectors = 9 cols
  const gridTemplateColumns = 'auto 1fr auto 1fr auto 1fr auto 1fr auto';

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Row label */}
      <span className="shrink-0 w-8 text-right text-[10px] font-semibold uppercase tracking-widest text-text-secondary/60">
        {label}
      </span>

      {/* Track */}
      <div
        className="flex-1 grid items-center min-w-0 overflow-x-auto"
        style={{ gridTemplateColumns }}
        role="presentation"
      >
        {TIMELINE_STEP_DEFS.map(({ Icon, labelKey }, idx) => {
          const isSeller   = idx < transferStep;
          const isTransfer = idx === transferStep;
          const isBuyer    = idx > transferStep;

          const nodeClasses = [
            'w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
            isSeller   && 'bg-gold border-gold text-white shadow-sm',
            isTransfer && 'bg-white border-gold ring-2 ring-gold/40 ring-offset-1 text-gold shadow-md',
            isBuyer    && 'bg-sky-100 border-sky-400 text-sky-500',
          ].filter(Boolean).join(' ');

          return (
            <React.Fragment key={idx}>
              {/* Node */}
              <div className="flex flex-col items-center gap-1">
                <div className={nodeClasses} title={t(labelKey)}>
                  {isTransfer
                    ? (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                        <polygon points="6,1 11,9 1,9" />
                      </svg>
                    )
                    : <Icon className="w-3.5 h-3.5" />
                  }
                </div>
                <span
                  className={[
                    'text-[9px] font-medium text-center leading-tight w-14 hidden sm:block',
                    isSeller   && 'text-gold/80',
                    isTransfer && 'text-gold font-bold',
                    isBuyer    && 'text-sky-500',
                  ].filter(Boolean).join(' ')}
                >
                  {t(labelKey)}
                </span>
              </div>

              {/* Connector */}
              {idx < TIMELINE_STEP_DEFS.length - 1 && (
                <div
                  className={[
                    'h-0.5 w-full min-w-[12px]',
                    idx < transferStep ? 'bg-gold' : 'bg-sky-300',
                  ].join(' ')}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ── Full transfer timeline (risk + cost rows) ─────────────────────────────────

interface TransferTimelineProps {
  incoterm: Incoterm;
  t: TFunc;
}

const TransferTimeline: FC<TransferTimelineProps> = ({ incoterm, t }) => {
  const isSplit = hasSplitTransfer(incoterm);

  return (
    <div className="rounded-lg border border-border-default bg-ink-2/60 p-4 space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          {t('timeline')}
        </h4>
        {isSplit && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
            <IconSplit className="w-3 h-3" />
            {t('riskCostSplit')}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gold inline-block" />
          <span className="text-gold font-semibold">{t('seller')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" />
          <span className="text-sky-600 font-semibold">{t('buyer')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border-2 border-gold inline-block" />
          <span className="text-text-secondary">{t('transferMarker')}</span>
        </span>
      </div>

      {/* Transfer point callout */}
      <div className="flex items-start gap-2 rounded-lg bg-gold/5 border border-gold/20 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gold shrink-0 mt-0.5">
          {t('transfersAt')}
        </span>
        <span className="text-xs text-text-primary leading-snug">{incoterm.transferPoint}</span>
      </div>

      {/* Risk row */}
      <TimelineRow
        transferStep={incoterm.riskTransferStep}
        label={t('riskLabel')}
        t={t}
      />

      {/* Cost row — always shown for educational clarity; visually identical when steps match */}
      <TimelineRow
        transferStep={incoterm.costTransferStep}
        label={t('costLabel')}
        t={t}
      />
    </div>
  );
};

// ── Responsibility matrix ─────────────────────────────────────────────────────

interface ResponsibilityMatrixProps {
  responsibilities: Incoterm['responsibilities'];
  t: TFunc;
}

const ResponsibilityMatrix: FC<ResponsibilityMatrixProps> = ({ responsibilities, t }) => (
  <div className="rounded-lg border border-border-default bg-white overflow-hidden">
    {/* Section header */}
    <div className="px-4 py-2.5 bg-ink-3/50 border-b border-border-default">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
        {t('responsibilities')}
      </h4>
    </div>

    {/* 3 × 2 grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
      {MATRIX_CELLS.map(({ key, labelKey, Icon }, idx) => {
        const value = responsibilities[key];

        const cardBase = [
          'flex flex-col gap-2 p-4',
          // Right-divide every cell except last in each row
          idx % 3 !== 2 && 'lg:border-r lg:border-border-subtle',
          idx < 3 && 'lg:border-b lg:border-border-subtle',
        ].filter(Boolean).join(' ');

        return (
          <div key={key} className={cardBase}>
            <div className="flex items-center gap-2 text-text-secondary">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider leading-tight">
                {t(labelKey)}
              </span>
            </div>
            <div>
              <ResponsibilityBadge value={value} t={t} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ── Accordion item ────────────────────────────────────────────────────────────

interface AccordionItemProps {
  item: Incoterm;
  isOpen: boolean;
  onToggle: () => void;
  t: TFunc;
  locale: string;
}

const AccordionItem: FC<AccordionItemProps> = ({ item, isOpen, onToggle, t, locale }) => {
  // Locale-aware name / description
  const localeName = locale === 'de' ? item.nameDE : locale === 'es' ? item.nameES : item.name;
  const localeDesc = locale === 'de' ? item.descriptionDE : locale === 'es' ? item.descriptionES : item.description;

  const modeBadge =
    item.mode === 'sea'
      ? 'bg-sky-500/8 text-sky-400 border-sky-500/25'
      : 'bg-ink-3/50 text-text-secondary border-border-default';
  const modeLabelKey = item.mode === 'sea' ? 'modeSea' : 'modeAny';

  return (
    <div
      className={[
        'rounded-lg border transition-all duration-200',
        isOpen
          ? 'border-gold/50 shadow-card'
          : 'border-border-default hover:border-border-default',
      ].join(' ')}
    >
      {/* Accordion trigger */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left group"
        aria-expanded={isOpen}
        type="button"
      >
        {/* Code badge */}
        <span
          className={[
            'shrink-0 inline-flex items-center justify-center rounded-lg font-mono font-bold text-sm w-14 h-9 border tracking-widest transition-colors',
            isOpen
              ? 'bg-gold text-white border-gold shadow-sm'
              : 'bg-gold/10 text-gold border-gold/30 group-hover:bg-gold/20',
          ].join(' ')}
        >
          {item.code}
        </span>

        {/* Title and mode badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-ink leading-tight">{localeName}</span>
            <span className={`inline-block rounded-full border px-2 py-px text-[10px] font-semibold uppercase tracking-wider ${modeBadge}`}>
              {t(modeLabelKey)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary/60 truncate">{item.transferPoint}</p>
        </div>

        {/* Chevron */}
        <IconChevronDown
          className={`shrink-0 w-5 h-5 text-text-secondary/60 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold' : ''}`}
        />
      </button>

      {/* Expandable body */}
      <div
        className={[
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        <div className="px-5 pb-5 space-y-4 border-t border-border-subtle pt-4">
          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed">{localeDesc}</p>

          {/* Transfer Timeline */}
          <TransferTimeline incoterm={item} t={t} />

          {/* Responsibility Matrix */}
          <ResponsibilityMatrix responsibilities={item.responsibilities} t={t} />
        </div>
      </div>
    </div>
  );
};

// ── Group sub-header ──────────────────────────────────────────────────────────

interface GroupHeaderProps {
  label: string;
  count: number;
  mode: 'any' | 'sea';
}

const GroupHeader: FC<GroupHeaderProps> = ({ label, count, mode }) => {
  const dot = mode === 'sea' ? 'bg-sky-400' : 'bg-text-secondary/50';
  return (
    <div className="flex items-center gap-3 mt-6 mb-3 first:mt-0">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary flex-1">
        {label}
      </h3>
      <span className="text-xs text-text-secondary/60 font-mono">{count}</span>
      <div className="flex-1 h-px bg-ink-3 max-w-[160px]" />
    </div>
  );
};

// ── Filter tabs ───────────────────────────────────────────────────────────────

interface FilterTabsProps {
  active: FilterMode;
  onChange: (mode: FilterMode) => void;
  t: TFunc;
}

const FilterTabs: FC<FilterTabsProps> = ({ active, onChange, t }) => {
  const tabs: { id: FilterMode; labelKey: string }[] = [
    { id: 'all',  labelKey: 'filterAll'  },
    { id: 'any',  labelKey: 'filterAny'  },
    { id: 'sea',  labelKey: 'filterSea'  },
  ];

  return (
    <div
      className="inline-flex rounded-lg border border-border-default bg-ink-3/50 p-1 gap-1"
      role="tablist"
      aria-label={t('filterLabel')}
    >
      {tabs.map(({ id, labelKey }) => (
        <button
          key={id}
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={[
            'rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150',
            active === id
              ? 'bg-white text-gold shadow-sm border border-gold/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-ink-2/60',
          ].join(' ')}
          type="button"
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export const IncotermsClient: FC = () => {
  const t      = useTranslations('incoterms');
  const locale = useLocale();

  const [filter,    setFilter]    = useState<FilterMode>('all');
  const [openCode,  setOpenCode]  = useState<string | null>(null);

  const handleToggle = useCallback((code: string) => {
    setOpenCode((prev) => (prev === code ? null : code));
  }, []);

  const handleFilterChange = useCallback((mode: FilterMode) => {
    setFilter(mode);
    setOpenCode(null);
  }, []);

  // Derive visible items
  const visibleAny = filter !== 'sea' ? INCOTERMS_ANY_MODE : [];
  const visibleSea = filter !== 'any' ? INCOTERMS_SEA_ONLY : [];
  const showGroups = filter === 'all';

  const renderList = (items: readonly Incoterm[]): ReactNode =>
    items.map((item) => (
      <AccordionItem
        key={item.code}
        item={item}
        isOpen={openCode === item.code}
        onToggle={() => handleToggle(item.code)}
        t={t}
        locale={locale}
      />
    ));

  return (
    <section className="w-full max-w-3xl mx-auto space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-ink">{t('sectionTitle')}</h2>
          <p className="text-xs text-text-secondary/60 mt-0.5">{t('sectionSubtitle')}</p>
        </div>
        <FilterTabs active={filter} onChange={handleFilterChange} t={t} />
      </div>

      {/* Incoterm lists */}
      {showGroups ? (
        <>
          {visibleAny.length > 0 && (
            <div>
              <GroupHeader label={t('groupAny')} count={visibleAny.length} mode="any" />
              <div className="space-y-2">{renderList(visibleAny)}</div>
            </div>
          )}
          {visibleSea.length > 0 && (
            <div>
              <GroupHeader label={t('groupSea')} count={visibleSea.length} mode="sea" />
              <div className="space-y-2">{renderList(visibleSea)}</div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {renderList(filter === 'any' ? visibleAny : visibleSea)}
        </div>
      )}

      {/* Empty state */}
      {visibleAny.length === 0 && visibleSea.length === 0 && (
        <div className="py-16 text-center text-text-secondary/60 text-sm">{t('noResults')}</div>
      )}
    </section>
  );
};

export default IncotermsClient;
