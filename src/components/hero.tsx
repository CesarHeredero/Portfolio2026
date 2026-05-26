'use client';

import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero__head">
        <p className="hero__pretitle">{t('pretitle')}</p>
        <h1 id="hero-title" className="hero__title">
          {t('title')}
        </h1>
        <p className="hero__sub">{t('sub')}</p>
        <div className="hero__ctas">
          <a href="#work" className="btn btn--primary btn--lg">
            {t('cta1')} →
          </a>
          <a href="#about" className="btn btn--ghost btn--lg">
            {t('cta2')}
          </a>
        </div>
      </div>

      <div className="hero__id" aria-label="Identity card">
        <div className="hero__id-row">
          <span className="hero__id-key">{t('roleLabel')}</span>
          <span className="hero__id-val">{t('roleValue')}</span>
        </div>
        <div className="hero__id-row">
          <span className="hero__id-key">{t('locationLabel')}</span>
          <span className="hero__id-val">{t('locationValue')}</span>
        </div>
        <div className="hero__id-row">
          <span className="hero__id-key">{t('focusLabel')}</span>
          <span className="hero__id-val hero__id-val--accent">{t('focusValue')}</span>
        </div>
      </div>
    </section>
  );
}
