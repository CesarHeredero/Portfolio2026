import { getRequestConfig } from 'next-intl/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { routing } from './routing';

type LocaleString = { es?: string; en?: string };
type SiteContent = {
  content?: {
    hero?: {
      pretitle?: string;
      title?: LocaleString;
      sub?: LocaleString;
      idName?: string;
      roleValue?: string;
      expValue?: string;
      locationValue?: string;
      cta1?: string;
      cta2?: string;
      cta3?: string;
    };
    bento?: {
      roleValue?: string;
      roleCompany?: string;
      seekingRoles?: string;
      kpiValue?: string;
      kpiLabel?: string;
      clientsValue?: string;
      awardValue?: string;
      capabilities?: string;
    };
    about?: {
      name?: string;
      roleTag?: string;
      bio?: LocaleString;
      expValue?: string;
      locationValue?: string;
      langValue?: string;
      companyValue?: string;
      q1Title?: string; q1Desc?: string;
      q2Title?: string; q2Desc?: string;
      q3Title?: string; q3Desc?: string;
      q4Title?: string; q4Desc?: string;
    };
    process?: {
      step1Title?: string; step1Desc?: string;
      step2Title?: string; step2Desc?: string;
      step3Title?: string; step3Desc?: string;
      step4Title?: string; step4Desc?: string;
      step5Title?: string; step5Desc?: string;
    };
    contact?: {
      title?: string;
      intro?: string;
      email?: string;
      linkedin?: string;
      cal?: string;
    };
    footer?: { pitch?: string };
    statusBar?: { role?: string };
  };
};

function applyStr(msg: Record<string, string>, key: string, val: string | undefined) {
  if (val) msg[key] = val;
}

function applyLocale(msg: Record<string, string>, key: string, val: LocaleString | undefined, locale: string) {
  const v = val?.[locale as keyof LocaleString];
  if (v) msg[key] = v;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale;
  }

  // Clone to avoid mutating the cached module object (import() is cached in Node.js)
  const base = (await import(`../../messages/${locale}.json`)).default as Record<string, Record<string, string>>;
  const messages: Record<string, Record<string, string>> = {
    ...base,
    hero: { ...base.hero },
    bento: { ...base.bento },
    about: { ...base.about },
    process: { ...base.process },
    contact: { ...base.contact },
    footer: { ...base.footer },
    statusBar: { ...base.statusBar },
  };

  // Merge editable overrides from content/site.json (only non-empty values)
  try {
    const raw = await readFile(path.join(process.cwd(), 'content', 'site.json'), 'utf-8');
    const site = JSON.parse(raw) as SiteContent;
    const ov = site.content;
    if (ov) {
      // hero
      applyStr(messages.hero, 'pretitle', ov.hero?.pretitle);
      applyLocale(messages.hero, 'title', ov.hero?.title, locale);
      applyLocale(messages.hero, 'sub', ov.hero?.sub, locale);
      applyStr(messages.hero, 'idName', ov.hero?.idName);
      applyStr(messages.hero, 'roleValue', ov.hero?.roleValue);
      applyStr(messages.hero, 'expValue', ov.hero?.expValue);
      applyStr(messages.hero, 'locationValue', ov.hero?.locationValue);
      applyStr(messages.hero, 'cta1', ov.hero?.cta1);
      applyStr(messages.hero, 'cta2', ov.hero?.cta2);
      applyStr(messages.hero, 'cta3', ov.hero?.cta3);
      // bento
      applyStr(messages.bento, 'roleValue', ov.bento?.roleValue);
      applyStr(messages.bento, 'roleCompany', ov.bento?.roleCompany);
      applyStr(messages.bento, 'seekingRoles', ov.bento?.seekingRoles);
      applyStr(messages.bento, 'kpiValue', ov.bento?.kpiValue);
      applyStr(messages.bento, 'kpiLabel', ov.bento?.kpiLabel);
      applyStr(messages.bento, 'clientsValue', ov.bento?.clientsValue);
      applyStr(messages.bento, 'awardValue', ov.bento?.awardValue);
      applyStr(messages.bento, 'capabilities', ov.bento?.capabilities);
      // about
      applyStr(messages.about, 'name', ov.about?.name);
      applyStr(messages.about, 'roleTag', ov.about?.roleTag);
      applyLocale(messages.about, 'bio', ov.about?.bio, locale);
      applyStr(messages.about, 'expValue', ov.about?.expValue);
      applyStr(messages.about, 'locationValue', ov.about?.locationValue);
      applyStr(messages.about, 'langValue', ov.about?.langValue);
      applyStr(messages.about, 'companyValue', ov.about?.companyValue);
      for (const k of ['q1Title', 'q1Desc', 'q2Title', 'q2Desc', 'q3Title', 'q3Desc', 'q4Title', 'q4Desc'] as const) {
        applyStr(messages.about, k, ov.about?.[k]);
      }
      // process
      for (const k of ['step1Title', 'step1Desc', 'step2Title', 'step2Desc', 'step3Title', 'step3Desc', 'step4Title', 'step4Desc', 'step5Title', 'step5Desc'] as const) {
        applyStr(messages.process, k, ov.process?.[k]);
      }
      // contact
      applyStr(messages.contact, 'title', ov.contact?.title);
      applyStr(messages.contact, 'intro', ov.contact?.intro);
      applyStr(messages.contact, 'email', ov.contact?.email);
      applyStr(messages.contact, 'linkedin', ov.contact?.linkedin);
      applyStr(messages.contact, 'cal', ov.contact?.cal);
      // footer
      applyStr(messages.footer, 'pitch', ov.footer?.pitch);
      // statusBar
      applyStr(messages.statusBar, 'role', ov.statusBar?.role);
    }
  } catch {
    /* no overrides */
  }

  return { locale, messages };
});
