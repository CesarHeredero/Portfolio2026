import Link from 'next/link';
import { type Case, type Locale, PIA_SUMMARY } from '@/lib/content';
import { CaseCard } from './case-card';

type Props = {
  case_: Case;
  locale: Locale;
  related: Case[];
  backLabel: string;
  problemLabel: string;
  actionLabel: string;
  impactLabel: string;
  tagsLabel: string;
  relatedLabel: string;
  readCaseLabel: string;
  featuredLabel: string;
};

export function CaseDetail({
  case_,
  locale,
  related,
  backLabel,
  problemLabel,
  actionLabel,
  impactLabel,
  tagsLabel,
  relatedLabel,
  readCaseLabel,
  featuredLabel,
}: Props) {
  const pia = case_.pia?.[locale] ?? PIA_SUMMARY[case_.id]?.[locale];
  const workPath = locale === 'es' ? '/trabajo' : '/work';
  const backHref = `/${locale}/#work`;

  return (
    <main className="cd" id="main-content">
      <Link href={backHref} className="cd__back">
        ← {backLabel}
      </Link>

      <header className="cd__header">
        <p className="cd__category">{case_.category[locale]}</p>
        <h1 className="cd__title">{case_.title[locale]}</h1>
        <p className="cd__teaser">{case_.teaser[locale]}</p>
        <div className="cd__meta">
          <div className="cd__meta-item">
            <span className="cd__meta-key">Year</span>
            <span className="cd__meta-val">{case_.year}</span>
          </div>
          <div className="cd__meta-item">
            <span className="cd__meta-key">Impact</span>
            <span className="cd__meta-val">{case_.impactType}</span>
          </div>
        </div>
      </header>

      <div className="cd__kpis">
        {case_.kpis.map((kpi, i) => (
          <div key={i} className="cd__kpi">
            <div className="cd__kpi-value">{kpi.value}</div>
            <div className="cd__kpi-label">{kpi.label[locale]}</div>
          </div>
        ))}
      </div>

      <div className="cd__body">
        <div>
          {pia && (
            <div style={{ marginBottom: 'var(--s-8)' }}>
              <p style={{ fontSize: 'var(--fs-16)', color: 'var(--ink-500)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--ink-700)' }}>{problemLabel}: </strong>
                {pia.problem}
              </p>
              <p style={{ fontSize: 'var(--fs-16)', color: 'var(--ink-500)', lineHeight: 1.7, marginTop: 'var(--s-4)' }}>
                <strong style={{ color: 'var(--ink-700)' }}>{actionLabel}: </strong>
                {pia.action}
              </p>
              <p style={{ fontSize: 'var(--fs-16)', color: 'var(--ink-500)', lineHeight: 1.7, marginTop: 'var(--s-4)' }}>
                <strong style={{ color: 'var(--ink-700)' }}>{impactLabel}: </strong>
                {pia.impact}
              </p>
            </div>
          )}

          <div>
            <p className="cd__pia-key" style={{ marginBottom: 'var(--s-3)' }}>{tagsLabel}</p>
            <div className="cd__tags">
              {case_.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {pia && (
          <aside className="cd__pia" aria-label="PIA Summary">
            <p className="cd__pia-title">PIA</p>
            <div className="cd__pia-block">
              <p className="cd__pia-key">{problemLabel}</p>
              <p className="cd__pia-val">{pia.problem}</p>
            </div>
            <div className="cd__pia-block">
              <p className="cd__pia-key">{actionLabel}</p>
              <p className="cd__pia-val">{pia.action}</p>
            </div>
            <div className="cd__pia-block">
              <p className="cd__pia-key">{impactLabel}</p>
              <p className="cd__pia-val">{pia.impact}</p>
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <div className="cd__related">
          <h2 className="cd__related-title">{relatedLabel}</h2>
          <div className="cd__related-grid">
            {related.map((rc) => (
              <CaseCard
                key={rc.id}
                case_={rc}
                locale={locale}
                workPath={workPath}
                readCaseLabel={readCaseLabel}
                featuredLabel={featuredLabel}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
