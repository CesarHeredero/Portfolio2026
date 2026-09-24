'use client';

import { useTranslations, useLocale } from 'next-intl';

type Locale = 'es' | 'en';

type LocalizedText = { es: string; en: string };

export type CvExperience = {
  id: string;
  year: string;
  yearEn: string;
  role: string;
  roleEn?: string;
  company: string;
  companyEn?: string;
  description: LocalizedText;
  tags?: string[];
  award?: LocalizedText;
};

export type CvOtherRole = {
  year: string;
  role: string;
  roleEn: string;
  company: string;
};

export type CvSkillGroup = {
  group: string;
  items: string[];
};

export type CvData = {
  experience: CvExperience[];
  otherRoles: CvOtherRole[];
  skills: CvSkillGroup[];
  education: CvSkillGroup[];
};

export function CVSection({ cv }: { cv: CvData }) {
  const t = useTranslations('cv');
  const locale = useLocale() as Locale;

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
            {cv.experience.map((item) => {
              const role = locale === 'en' && 'roleEn' in item && item.roleEn ? item.roleEn : item.role;
              const company = locale === 'en' && 'companyEn' in item && item.companyEn ? item.companyEn : item.company;
              const period = locale === 'en' ? item.yearEn : item.year;
              const desc = item.description[locale];
              const award = 'award' in item && item.award ? item.award[locale] : null;
              return (
                <li key={item.id} className="cv__item">
                  <div className="cv__item-head">
                    <span className="cv__item-title">{role}</span>
                    <span className="cv__item-period">{period}</span>
                  </div>
                  <p className="cv__item-company">{company}</p>
                  {desc && <p className="cv__item-desc">{desc}</p>}
                  {award && <p className="cv__item-award">🏆 {award}</p>}
                  {item.tags && (
                    <div className="cv__item-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="tag tag--sm">{tag}</span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="cv__section-label">{t('otherRoles')}</p>
          <ul className="cv__list cv__list--compact">
            {cv.otherRoles.map((item, i) => {
              const role = locale === 'en' ? item.roleEn : item.role;
              return (
                <li key={i} className="cv__item cv__item--compact">
                  <div className="cv__item-head">
                    <span className="cv__item-title">{role}</span>
                    <span className="cv__item-period">{item.year}</span>
                  </div>
                  <p className="cv__item-company">{item.company}</p>
                </li>
              );
            })}
          </ul>

          <a href="/cv.pdf" className="btn btn--ghost" aria-label={t('downloadCV')} download>
            ↓ {t('downloadCV')}
          </a>
        </div>

        <aside className="cv__skills" aria-label={t('skills')}>
          <p className="cv__section-label" style={{ marginBottom: 'var(--s-5)' }}>{t('skills')}</p>
          {cv.skills.map((group) => (
            <div key={group.group} className="cv__skill-group">
              <p className="cv__skill-group-label">{group.group}</p>
              <div className="cv__skill-tags">
                {group.items.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}

          <p className="cv__section-label" style={{ margin: 'var(--s-6) 0 var(--s-5)' }}>{t('education')}</p>
          {cv.education.map((group) => (
            <div key={group.group} className="cv__skill-group">
              <p className="cv__skill-group-label">{group.group}</p>
              <ul className="cv__edu-list" role="list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
