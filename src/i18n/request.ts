import { getRequestConfig } from 'next-intl/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { routing } from './routing';

type SiteContent = {
  content?: {
    hero?: { title?: Record<string, string>; sub?: Record<string, string> };
    about?: { bio?: Record<string, string> };
    contact?: { email?: string; linkedin?: string; cal?: string };
  };
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale;
  }
  // Clone to avoid mutating the cached module object (import() is cached in Node.js)
  const base = (await import(`../../messages/${locale}.json`)).default as Record<
    string,
    Record<string, string>
  >;
  const messages: Record<string, Record<string, string>> = {
    ...base,
    hero: { ...base.hero },
    about: { ...base.about },
    contact: { ...base.contact },
  };

  // Merge editable overrides from content/site.json (only non-empty values)
  try {
    const raw = await readFile(path.join(process.cwd(), 'content', 'site.json'), 'utf-8');
    const site = JSON.parse(raw) as SiteContent;
    const ov = site.content;
    if (ov) {
      if (ov.hero?.title?.[locale]) messages.hero.title = ov.hero.title[locale];
      if (ov.hero?.sub?.[locale]) messages.hero.sub = ov.hero.sub[locale];
      if (ov.about?.bio?.[locale]) messages.about.bio = ov.about.bio[locale];
      if (ov.contact?.email) messages.contact.email = ov.contact.email;
      if (ov.contact?.linkedin) messages.contact.linkedin = ov.contact.linkedin;
      if (ov.contact?.cal) messages.contact.cal = ov.contact.cal;
    }
  } catch {
    /* no overrides */
  }

  return { locale, messages };
});
