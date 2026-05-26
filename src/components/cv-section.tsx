import { useTranslations } from 'next-intl';

const SKILL_GROUPS = [
  {
    label: 'Product',
    tags: ['Roadmap', 'User Stories', 'OKRs', 'Backlog', 'Sprint Planning'],
  },
  {
    label: 'Data & Analytics',
    tags: ['GA4', 'GTM', 'BigQuery', 'SQL', 'Looker Studio'],
  },
  {
    label: 'SEO & WPO',
    tags: ['Schema.org', 'Core Web Vitals', 'Sitemaps', 'Canonical', 'CrUX'],
  },
  {
    label: 'Technical',
    tags: ['Next.js', 'TypeScript', 'HTML/CSS', 'REST APIs', 'Git'],
  },
];

export function CVSection() {
  const t = useTranslations('cv');

  const experience = [
    {
      title: t('job1Title'),
      company: t('job1Company'),
      period: t('job1Period'),
      desc: t('job1Desc'),
    },
    {
      title: t('job2Title'),
      company: t('job2Company'),
      period: t('job2Period'),
      desc: t('job2Desc'),
    },
    {
      title: t('job3Title'),
      company: t('job3Company'),
      period: t('job3Period'),
      desc: t('job3Desc'),
    },
  ];

  const education = [
    {
      title: t('edu1Title'),
      company: t('edu1School'),
      period: t('edu1Period'),
      desc: '',
    },
    {
      title: t('edu2Title'),
      company: t('edu2School'),
      period: t('edu2Period'),
      desc: '',
    },
  ];

  return (
    <section className="sec" id="cv" aria-labelledby="cv-title">
      <div className="sec__head">
        <span className="sec__num">05</span>
        <div>
          <h2 id="cv-title" className="sec__title">{t('title')}</h2>
          <p className="sec__intro">{t('intro')}</p>
        </div>
      </div>

      <div className="cv__grid">
        <div>
          <p className="cv__section-label">{t('experience')}</p>
          <ul className="cv__list">
            {experience.map((item, i) => (
              <li key={i} className="cv__item">
                <div className="cv__item-head">
                  <span className="cv__item-title">{item.title}</span>
                  <span className="cv__item-period">{item.period}</span>
                </div>
                <p className="cv__item-company">{item.company}</p>
                {item.desc && <p className="cv__item-desc">{item.desc}</p>}
              </li>
            ))}
          </ul>

          <p className="cv__section-label">{t('education')}</p>
          <ul className="cv__list">
            {education.map((item, i) => (
              <li key={i} className="cv__item">
                <div className="cv__item-head">
                  <span className="cv__item-title">{item.title}</span>
                  <span className="cv__item-period">{item.period}</span>
                </div>
                <p className="cv__item-company">{item.company}</p>
              </li>
            ))}
          </ul>

          <a
            href="#"
            className="btn btn--ghost"
            aria-label={t('downloadCV')}
            download
          >
            ↓ {t('downloadCV')}
          </a>
        </div>

        <aside className="cv__skills" aria-label={t('skills')}>
          <p className="cv__section-label" style={{ marginBottom: 'var(--s-5)' }}>{t('skills')}</p>
          {SKILL_GROUPS.map((group) => (
            <div key={group.label} className="cv__skill-group">
              <p className="cv__skill-group-label">{group.label}</p>
              <div className="cv__skill-tags">
                {group.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
