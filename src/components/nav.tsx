'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type AccentColor = 'green' | 'blue' | 'terra' | 'plum' | 'ink';

const ACCENT_COLORS: { key: AccentColor; bg: string }[] = [
  { key: 'green', bg: '#2b6f4a' },
  { key: 'blue', bg: '#2563eb' },
  { key: 'terra', bg: '#b45309' },
  { key: 'plum', bg: '#7c3aed' },
  { key: 'ink', bg: '#27272a' },
];

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^| )${name}=([^;]+)`));
  return match?.[1] ?? null;
}

export function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState<AccentColor>('green');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = getCookie('ch_theme');
    const savedAccent = getCookie('ch_accent');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
      setTheme('dark');
    if (savedAccent && ACCENT_COLORS.some((c) => c.key === savedAccent))
      setAccent(savedAccent as AccentColor);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setCookie('ch_theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
    if (next === 'light') document.documentElement.removeAttribute('data-theme');
  }

  function setAccentColor(color: AccentColor) {
    setAccent(color);
    setCookie('ch_accent', color);
    if (color === 'green') {
      document.documentElement.removeAttribute('data-accent');
    } else {
      document.documentElement.setAttribute('data-accent', color);
    }
  }

  const otherLocale = locale === 'es' ? 'en' : 'es';
  const langLabel = locale === 'es' ? 'EN' : 'ES';

  // Build locale-aware href for the alternate locale
  function buildOtherLocaleHref(): string {
    const withoutLocale = pathname.replace(/^\/(es|en)/, '') || '/';
    return `/${otherLocale}${withoutLocale === '/' ? '' : withoutLocale}`;
  }

  const navLinks = [
    { href: `/${locale}/#work`, label: t('work') },
    { href: `/${locale}/#about`, label: t('about') },
    { href: `/${locale}/#process`, label: t('process') },
    { href: `/${locale}/#cv`, label: t('cv') },
    { href: `/${locale}/#contact`, label: t('contact') },
  ];

  return (
    <>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav__inner">
          <Link href={`/${locale}`} className="nav__brand">
            <div className="nav__mark" aria-hidden="true">CH</div>
            <span className="nav__name">César Heredero</span>
          </Link>
          <span className="nav__divider" aria-hidden="true" />
          <span className="nav__role">Senior Product Owner</span>

          <ul className="nav__list" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            {mounted && (
              <>
                <div className="seg" role="group" aria-label="Language">
                  <Link
                    href={buildOtherLocaleHref()}
                    className="seg__btn"
                    aria-label={t('langToggle')}
                  >
                    {langLabel}
                  </Link>
                </div>
                <button
                  className="icon-btn"
                  onClick={toggleTheme}
                  aria-label={t('themeToggle')}
                  title={t('themeToggle')}
                >
                  {theme === 'dark' ? '☀' : '◑'}
                </button>
              </>
            )}
            <button
              className="icon-btn nav__menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('menuOpen')}
              aria-expanded={drawerOpen}
              aria-controls="nav-drawer"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="nav-drawer"
        className={`nav__drawer${drawerOpen ? ' nav__drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div
          className="nav__drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        />
        <div className="nav__drawer-panel">
          <button
            className="icon-btn nav__drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('menuClose')}
          >
            ✕
          </button>
          <ul className="nav__drawer-list" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setDrawerOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav__drawer-actions">
            {mounted && (
              <>
                <Link
                  href={buildOtherLocaleHref()}
                  className="btn btn--ghost"
                  onClick={() => setDrawerOpen(false)}
                >
                  {langLabel}
                </Link>
                <button
                  className="btn btn--ghost"
                  onClick={() => { toggleTheme(); setDrawerOpen(false); }}
                >
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
              </>
            )}
          </div>
          {mounted && (
            <div className="theme-picker" aria-label="Accent color">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.key}
                  className={`theme-picker__dot${accent === c.key ? ' theme-picker__dot--active' : ''}`}
                  style={{ background: c.bg }}
                  onClick={() => setAccentColor(c.key)}
                  aria-label={`Accent: ${c.key}`}
                  aria-pressed={accent === c.key}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
