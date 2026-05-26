import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  pathnames: {
    '/': '/',
    '/work/[slug]': {
      es: '/trabajo/[slug]',
      en: '/work/[slug]',
    },
  },
});

export type Locale = (typeof routing.locales)[number];
