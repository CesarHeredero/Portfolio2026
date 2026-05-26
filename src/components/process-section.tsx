import { useTranslations } from 'next-intl';

export function ProcessSection() {
  const t = useTranslations('process');

  const steps = [
    { title: t('step1Title'), desc: t('step1Desc') },
    { title: t('step2Title'), desc: t('step2Desc') },
    { title: t('step3Title'), desc: t('step3Desc') },
    { title: t('step4Title'), desc: t('step4Desc') },
    { title: t('step5Title'), desc: t('step5Desc') },
  ];

  return (
    <section className="sec" id="process" aria-labelledby="process-title">
      <div className="sec__head">
        <span className="sec__num">04</span>
        <div>
          <h2 id="process-title" className="sec__title">{t('title')}</h2>
          <p className="sec__intro">{t('intro')}</p>
        </div>
      </div>

      <div className="process" role="list">
        {steps.map((step, i) => (
          <div key={i} className="process__step" role="listitem">
            <div className="process__num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="process__content">
              <h3 className="process__title">{step.title}</h3>
              <p className="process__desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
