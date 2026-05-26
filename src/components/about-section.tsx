import { useTranslations } from 'next-intl';

const STACK_ITEMS = [
  'GTM', 'GA4', 'BigQuery', 'SQL',
  'Schema.org', 'Next.js', 'TypeScript',
  'HTML/CSS', 'Figma', 'JIRA', 'Looker Studio',
];

export function AboutSection() {
  const t = useTranslations('about');

  const qualities = [
    { icon: '⚡', text: t('q1') },
    { icon: '📊', text: t('q2') },
    { icon: '👥', text: t('q3') },
    { icon: '💻', text: t('q4') },
  ];

  return (
    <section className="sec" id="about" aria-labelledby="about-title">
      <div className="sec__head">
        <span className="sec__num">03</span>
        <div>
          <h2 id="about-title" className="sec__title">{t('title')}</h2>
          <p className="sec__intro">{t('intro')}</p>
        </div>
      </div>

      <div className="about__grid">
        <div className="about__id">
          <div className="about__avatar-area" aria-hidden="true">CH</div>
          <p className="about__name">César Heredero</p>
          <p className="about__role">Senior Product Owner</p>
          <div className="about__id-table">
            <div className="about__id-row">
              <span className="about__id-key">Location</span>
              <span className="about__id-val">Madrid, Spain</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">Focus</span>
              <span className="about__id-val">Product · SEO · Data</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">Since</span>
              <span className="about__id-val">2016</span>
            </div>
            <div className="about__id-row">
              <span className="about__id-key">Email</span>
              <span className="about__id-val">
                <a href="mailto:heredero.cesar@gmail.com" style={{ color: 'var(--accent)' }}>
                  heredero.cesar@gmail.com
                </a>
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="about__copy">{t('bio')}</p>

          <div className="about__qualities">
            {qualities.map((q, i) => (
              <div key={i} className="about__quality">
                <span className="about__quality-icon" aria-hidden="true">{q.icon}</span>
                <span>{q.text}</span>
              </div>
            ))}
          </div>

          <p className="about__stack-label">{t('stack')}</p>
          <div className="about__stack-list">
            {STACK_ITEMS.map((item) => (
              <span key={item} className="tag">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
