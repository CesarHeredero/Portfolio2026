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
          <p className="about__name">César Heredero Herranz</p>
          <p className="about__role">Senior PO · UX Strategist</p>
          <div className="about__id-table">
            <div className="about__id-row">
              <span className="about__id-key">Exp</span>
              <span className="about__id-val">10+ años</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">Ubicación</span>
              <span className="about__id-val">Madrid · Remoto OK</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">Idiomas</span>
              <span className="about__id-val">Español</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">Empresa</span>
              <span className="about__id-val">Flexicar</span>
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
