import Link from 'next/link';
import { type Case, type Locale, PIA_SUMMARY } from '@/lib/content';

type Props = {
  case_: Case;
  locale: Locale;
  workPath: string;
  piaLabel?: string;
  readCaseLabel?: string;
  featuredLabel?: string;
};

export function CaseCard({
  case_,
  locale,
  workPath,
  piaLabel = 'PIA',
  readCaseLabel = 'Read',
  featuredLabel = 'Featured',
}: Props) {
  const pia = PIA_SUMMARY[case_.id]?.[locale];
  const href = `/${locale}${workPath}/${case_.slug}`;

  return (
    <Link
      href={href}
      className={`case-card${case_.featured ? ' case-card--featured' : ''}`}
      aria-label={case_.title[locale]}
    >
      <div className="case-card__head">
        <span className="case-card__category">{case_.category[locale]}</span>
        <span className="case-card__year">{case_.year}</span>
      </div>

      <h3 className="case-card__title">{case_.title[locale]}</h3>
      <p className="case-card__teaser">{case_.teaser[locale]}</p>

      {case_.kpis.length > 0 && (
        <div className="case-card__kpis">
          {case_.kpis.slice(0, 3).map((kpi, i) => (
            <div key={i} className="case-card__kpi">
              <span className="case-card__kpi-value">{kpi.value}</span>
              <span className="case-card__kpi-label">{kpi.label[locale]}</span>
            </div>
          ))}
        </div>
      )}

      {pia && (
        <div className="case-card__pia">
          <div className="case-card__pia-row">
            <span className="case-card__pia-key">P</span>
            <span>{pia.problem}</span>
          </div>
          <div className="case-card__pia-row">
            <span className="case-card__pia-key">I</span>
            <span>{pia.impact}</span>
          </div>
        </div>
      )}

      <div className="case-card__foot">
        <div className="case-card__tags">
          {case_.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {case_.featured && (
            <span className="tag tag--accent">{featuredLabel}</span>
          )}
        </div>
        <span className="case-card__cta">
          {readCaseLabel} →
        </span>
      </div>
    </Link>
  );
}
