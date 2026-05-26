'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { CASES } from '@/lib/content';

const TECH_STACK = [
  'GTM', 'GA4', 'BigQuery', 'SQL', 'Schema.org',
  'Next.js', 'TypeScript', 'Figma', 'JIRA',
];

export function BentoGrid() {
  const t = useTranslations('bento');
  const locale = useLocale();

  const totalCases = CASES.length;
  const featuredCount = CASES.filter((c) => c.featured).length;

  return (
    <section aria-label="Key metrics" className="bento">
      <div className="bento__grid">
        {/* Cases count */}
        <div className="bento__cell">
          <span className="bento__label">{t('casesLabel')}</span>
          <span className="bento__value">{totalCases}</span>
          <span className="bento__hint">{featuredCount} {locale === 'es' ? 'destacados' : 'featured'}</span>
        </div>

        {/* Role cell — wide, tall */}
        <div className="bento__cell bento__cell--wide bento__cell--tall bento__cell--dark">
          <span className="bento__label">{t('roleLabel')}</span>
          <div className="bento__role">
            <p className="bento__role-title">{t('roleValue')}</p>
            <div>
              <span className="bento__role-pill">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} aria-hidden="true" />
                {t('availLabel')}
              </span>
            </div>
          </div>
        </div>

        {/* Year */}
        <div className="bento__cell">
          <span className="bento__label">{t('yearLabel')}</span>
          <span className="bento__value">2025</span>
        </div>

        {/* Domain */}
        <div className="bento__cell">
          <span className="bento__label">{t('domainLabel')}</span>
          <span className="bento__value bento__value--sm">{t('domainValue')}</span>
        </div>

        {/* Teams */}
        <div className="bento__cell bento__cell--wide">
          <span className="bento__label">{t('teamsLabel')}</span>
          <span className="bento__value bento__value--sm">{t('teamsValue')}</span>
        </div>

        {/* Tech stack */}
        <div className="bento__cell bento__cell--wide">
          <span className="bento__label">{t('techLabel')}</span>
          <div className="bento__tech-list">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="bento__tech-item">{tech}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
