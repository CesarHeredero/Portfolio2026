import { useTranslations } from 'next-intl';

export function ContactSection() {
  const t = useTranslations('contact');

  const links = [
    { label: t('emailLabel'), value: t('email'), href: `mailto:${t('email')}`, icon: '✉' },
    { label: t('linkedinLabel'), value: t('linkedin'), href: `https://${t('linkedin')}`, icon: 'in' },
    { label: t('calLabel'), value: t('cal'), href: `https://${t('cal')}`, icon: '📅' },
    { label: t('cvLabel'), value: t('cv'), href: '/cv.pdf', icon: '↓' },
  ];

  return (
    <section className="sec" id="contact" aria-labelledby="contact-title">
      <div className="sec__head">
        <span className="sec__num">07</span>
        <div>
          <h2 id="contact-title" className="sec__title">{t('title')}</h2>
          <p className="sec__intro">{t('intro')}</p>
        </div>
      </div>

      <div className="contact__grid">
        <ul className="contact__links" role="list">
          {links.map((link) => {
            const external = link.href.startsWith('http');
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="contact__link"
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                >
                  <span className="contact__link-icon" aria-hidden="true">{link.icon}</span>
                  <span className="contact__link-info">
                    <span className="contact__link-label">{link.label}</span>
                    <span className="contact__link-value">{link.value}</span>
                  </span>
                  <span className="contact__link-arr" aria-hidden="true">→</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
