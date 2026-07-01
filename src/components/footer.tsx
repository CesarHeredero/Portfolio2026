import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const tc = useTranslations('contact');

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__mark">CH.</span>
            <p className="footer__pitch">{t('pitch')}</p>
          </div>

          <div className="footer__cols">
            <div className="footer__col">
              <p className="footer__col-label">{t('navLabel')}</p>
              <ul role="list">
                <li><a href="#work">{tn('work')}</a></li>
                <li><a href="#about">{tn('about')}</a></li>
                <li><a href="#process">{tn('process')}</a></li>
                <li><a href="#contact">{tn('contact')}</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <p className="footer__col-label">{t('channelsLabel')}</p>
              <ul role="list">
                <li><a href={`mailto:${tc('email')}`}>Email</a></li>
                <li><a href={`https://${tc('linkedin')}`} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href={`https://${tc('cal')}`} target="_blank" rel="noopener noreferrer">cal.com</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <p className="footer__col-label">{t('systemLabel')}</p>
              <ul role="list">
                <li><span>{t('builtWith')}</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">{t('copy')}</p>
          <p className="footer__built">{t('builtWith')}</p>
        </div>
      </div>
    </footer>
  );
}
