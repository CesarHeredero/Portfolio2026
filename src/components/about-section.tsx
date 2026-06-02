import { useTranslations } from 'next-intl';

export function AboutSection() {
  const t = useTranslations('about');

  const qualities = [
    { title: t('q1Title'), desc: t('q1Desc') },
    { title: t('q2Title'), desc: t('q2Desc') },
    { title: t('q3Title'), desc: t('q3Desc') },
    { title: t('q4Title'), desc: t('q4Desc') },
  ];

  const bioParagraphs = t('bio').split('\n\n');

  return (
    <section className="sec" id="about" aria-labelledby="about-title">
      <div className="sec__head">
        <span className="sec__num">03</span>
        <div>
          <h2 id="about-title" className="sec__title">{t('title')}</h2>
        </div>
      </div>

      <div className="about__grid">
        <div className="about__id">
          <div className="about__avatar-area" aria-hidden="true">CH</div>
          <p className="about__name">{t('name')}</p>
          <p className="about__role">{t('roleTag')}</p>
          <div className="about__id-table">
            <div className="about__id-row">
              <span className="about__id-key">{t('expLabel')}</span>
              <span className="about__id-val">{t('expValue')}</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">{t('locationLabel')}</span>
              <span className="about__id-val">{t('locationValue')}</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">{t('langLabel')}</span>
              <span className="about__id-val">{t('langValue')}</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">{t('companyLabel')}</span>
              <span className="about__id-val">{t('companyValue')}</span>
            </div>
          </div>
        </div>

        <div>
          {bioParagraphs.map((p, i) => (
            <p key={i} className="about__copy">{p}</p>
          ))}

          <div className="about__qualities">
            {qualities.map((q, i) => (
              <div key={i} className="about__quality">
                <span className="about__quality-title">{q.title}</span>
                <span className="about__quality-desc">{q.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
