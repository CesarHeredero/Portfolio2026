'use client';

import { useTranslations } from 'next-intl';

export function BentoGrid() {
  const t = useTranslations('bento');

  const seekingRoles = t('seekingRoles').split(',').map((s) => s.trim()).filter(Boolean);
  const capabilities = t('capabilities').split(',').map((s) => s.trim()).filter(Boolean);

  const meta = [
    { k: t('metaListings'), v: t('metaListingsValue') },
    { k: t('metaCountries'), v: t('metaCountriesValue') },
    { k: t('metaTeams'), v: t('metaTeamsValue') },
    { k: t('metaProjects'), v: t('metaProjectsValue') },
  ];

  return (
    <section aria-label="Key metrics" className="bento">
      <div className="bento__grid">
        {/* Rol actual — celda destacada oscura */}
        <div className="bento__cell bento__cell--feat bento__cell--dark">
          <span className="bento__label">{t('roleLabel')}</span>
          <p className="bento__role-title">{t('roleValue')}</p>
          <p className="bento__role-company">{t('roleCompany')}</p>
          <div className="bento__meta-grid">
            {meta.map((m) => (
              <div className="bento__meta-item" key={m.k}>
                <span className="bento__meta-value">{m.v}</span>
                <span className="bento__meta-key">{m.k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buscando — celda acento con pills */}
        <div className="bento__cell bento__cell--accent bento__cell--md">
          <span className="bento__label">{t('seekingLabel')}</span>
          <div className="bento__pills">
            {seekingRoles.map((r) => (
              <span key={r} className="bento__pill">{r}</span>
            ))}
          </div>
        </div>

        {/* KPI 28% */}
        <div className="bento__cell bento__cell--sm">
          <span className="bento__value">{t('kpiValue')}</span>
          <span className="bento__hint">{t('kpiLabel')}</span>
        </div>

        {/* Clientes pasados */}
        <div className="bento__cell bento__cell--sm">
          <span className="bento__label">{t('clientsLabel')}</span>
          <span className="bento__value bento__value--sm">{t('clientsValue')}</span>
        </div>

        {/* Premio Cardio Xplore */}
        <div className="bento__cell bento__cell--sm">
          <span className="bento__label">{t('awardLabel')}</span>
          <span className="bento__value bento__value--sm">🏆 {t('awardValue')}</span>
        </div>

        {/* Capacidades */}
        <div className="bento__cell bento__cell--wide">
          <span className="bento__label">{t('capabilitiesLabel')}</span>
          <div className="bento__tech-list">
            {capabilities.map((c) => (
              <span key={c} className="bento__tech-item">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
