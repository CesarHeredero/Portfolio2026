'use client';

import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');

  // Título con énfasis en "palancas de negocio"
  const title = t('title');
  const em = t('titleEm');
  const [before, after] = title.includes(em) ? title.split(em) : [title, ''];

  const idRows = [
    { key: t('roleLabel'), val: t('roleValue') },
    { key: t('expLabel'), val: t('expValue') },
    { key: t('locationLabel'), val: t('locationValue') },
    { key: t('langLabel'), val: t('langValue') },
    { key: t('availLabel'), val: t('availValue'), accent: true },
  ];

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero__head">
        <p className="hero__pretitle">{t('pretitle')}</p>
        <h1 id="hero-title" className="hero__title">
          {before}
          {after !== '' ? <em>{em}</em> : null}
          {after}
        </h1>
        <p className="hero__sub">{t('sub')}</p>
        <div className="hero__ctas">
          <a href="#work" className="btn btn--primary btn--lg">
            {t('cta1')} →
          </a>
          <a href="#contact" className="btn btn--ghost btn--lg">
            {t('cta2')}
          </a>
          <a href="/api/cv/pdf" className="btn btn--ghost btn--lg" download>
            {t('cta3')} ↓
          </a>
        </div>
      </div>

      <div className="hero__id" aria-label="Identity card">
        <div className="hero__id-name">{t('idName')}</div>
        {idRows.map((row) => (
          <div className="hero__id-row" key={row.key}>
            <span className="hero__id-key">{row.key}</span>
            <span className={`hero__id-val${row.accent ? ' hero__id-val--accent' : ''}`}>
              {row.val}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
