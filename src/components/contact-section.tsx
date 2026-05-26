'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

export function ContactSection() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  const links = [
    {
      label: t('emailLabel'),
      value: t('email'),
      href: `mailto:${t('email')}`,
      icon: '✉',
    },
    {
      label: t('linkedinLabel'),
      value: t('linkedin'),
      href: `https://${t('linkedin')}`,
      icon: 'in',
    },
    {
      label: t('githubLabel'),
      value: t('github'),
      href: `https://${t('github')}`,
      icon: 'gh',
    },
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
        <div>
          <ul className="contact__links" role="list">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="contact__link"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <span className="contact__link-icon" aria-hidden="true">
                    {link.icon}
                  </span>
                  <span className="contact__link-info">
                    <span className="contact__link-label">{link.label}</span>
                    <span className="contact__link-value">{link.value}</span>
                  </span>
                  <span className="contact__link-arr" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {submitted ? (
            <div
              style={{
                padding: 'var(--s-7)',
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-line)',
                borderRadius: 'var(--r-3)',
                textAlign: 'center',
              }}
              role="alert"
            >
              <p style={{ fontSize: 'var(--fs-18)', fontWeight: 600, color: 'var(--accent)', marginBottom: 'var(--s-2)' }}>
                ✓
              </p>
              <p style={{ fontSize: 'var(--fs-15)', color: 'var(--ink-700)' }}>
                {t('formSend')}
              </p>
            </div>
          ) : (
            <form className="contact__form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label htmlFor="contact-name" className="form__label">
                  {t('formName')}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className="form__input"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="form__field">
                <label htmlFor="contact-email" className="form__label">
                  {t('formEmail')}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="form__input"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form__field">
                <label htmlFor="contact-message" className="form__label">
                  {t('formMessage')}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="form__textarea"
                  required
                  rows={5}
                />
              </div>
              <button type="submit" className="btn btn--primary">
                {t('formSend')} →
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
