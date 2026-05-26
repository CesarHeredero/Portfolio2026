'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { CASES, type ImpactType, type Locale } from '@/lib/content';
import { CaseCard } from './case-card';

type FilterKey = 'all' | ImpactType;

const FILTERS: FilterKey[] = ['all', 'product', 'seo', 'data', 'ux', 'performance', 'content'];

export function WorkSection() {
  const t = useTranslations('work');
  const locale = useLocale() as Locale;
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered =
    activeFilter === 'all'
      ? CASES
      : CASES.filter((c) => c.impactType === activeFilter);

  function getFilterLabel(key: FilterKey): string {
    if (key === 'all') return t('filterAll');
    if (key === 'product') return t('filterProduct');
    if (key === 'seo') return t('filterSEO');
    if (key === 'data') return t('filterData');
    if (key === 'ux') return t('filterUX');
    if (key === 'performance') return t('filterPerformance');
    return key;
  }

  function getCount(key: FilterKey): number {
    if (key === 'all') return CASES.length;
    return CASES.filter((c) => c.impactType === key).length;
  }

  const workPath = locale === 'es' ? '/trabajo' : '/work';

  return (
    <section className="sec" id="work" aria-labelledby="work-title">
      <div className="sec__head">
        <span className="sec__num">02</span>
        <div>
          <h2 id="work-title" className="sec__title">{t('title')}</h2>
          <p className="sec__intro">{t('intro')}</p>
        </div>
      </div>

      <div className="work__filterbar">
        <div className="work__filters" role="group" aria-label="Filter by type">
          {FILTERS.map((key) => {
            const count = getCount(key);
            if (count === 0 && key !== 'all') return null;
            return (
              <button
                key={key}
                className={`chip${activeFilter === key ? ' chip--on' : ''}`}
                onClick={() => setActiveFilter(key)}
                aria-pressed={activeFilter === key}
              >
                {getFilterLabel(key)}
                <span className="chip__count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="work__view" role="group" aria-label="View mode">
          <button
            className={`icon-btn${viewMode === 'grid' ? ' chip--on' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label={t('viewGrid')}
            title={t('viewGrid')}
          >
            ⊞
          </button>
          <button
            className={`icon-btn${viewMode === 'list' ? ' chip--on' : ''}`}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            aria-label={t('viewList')}
            title={t('viewList')}
          >
            ≡
          </button>
        </div>
      </div>

      <div
        className={`case-grid${viewMode === 'list' ? ' case-grid--list' : ''}`}
        role="list"
        aria-label="Cases"
      >
        {filtered.map((c) => (
          <div key={c.id} role="listitem">
            <CaseCard
              case_={c}
              locale={locale}
              workPath={workPath}
              readCaseLabel={t('readCase')}
              featuredLabel={t('featured')}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
