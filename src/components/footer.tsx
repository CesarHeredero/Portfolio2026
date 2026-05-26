import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <p className="footer__copy">
          <strong>{t('copy')}</strong>
          {' · '}© {year}
        </p>
        <p className="footer__built">{t('builtWith')}</p>
      </div>
    </footer>
  );
}
