'use client';

import { useState } from 'react';
import { AdminSidebar } from './sidebar';
import { DashboardSection } from './sections/dashboard';
import { CasesSection } from './sections/cases';
import { ProfileSection } from './sections/profile';
import { AnalyticsSection } from './sections/analytics';
import { SettingsSection } from './sections/settings';

export type AdminSection =
  | 'dashboard'
  | 'cases'
  | 'case-edit'
  | 'profile'
  | 'analytics'
  | 'settings';

const META: Record<Exclude<AdminSection, 'case-edit'>, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Resumen de actividad y métricas del portfolio.' },
  cases: { title: 'Casos', sub: 'Gestiona los casos de estudio publicados y borradores.' },
  profile: { title: 'Perfil', sub: 'Edita hero, sobre mí, CV y datos de contacto.' },
  analytics: { title: 'Analytics', sub: 'Tráfico, fuentes y eventos · medición server-side.' },
  settings: { title: 'Configuración', sub: 'Ajustes generales, diseño, integraciones y privacidad.' },
};

export function AdminApp() {
  const [section, setSection] = useState<AdminSection>('dashboard');

  const metaKey = section === 'case-edit' ? 'cases' : section;
  const meta = META[metaKey];

  return (
    <div className="adm">
      <AdminSidebar section={section} setSection={setSection} />
      <div className="adm__main">
        <div className="adm__topbar">
          <div className="adm__crumb">
            <span>ADMIN</span>
            <span className="is-current">{meta.title.toUpperCase()}</span>
          </div>
          <div className="adm__topbar-r">
            <div className="adm__search">
              <span>Buscar…</span>
              <kbd>⌘K</kbd>
            </div>
          </div>
        </div>

        <div className="adm__content">
          <div className="adm__page-head">
            <div>
              <h1 className="adm__page-title">{meta.title}</h1>
              <p className="adm__page-sub">{meta.sub}</p>
            </div>
          </div>

          {section === 'dashboard' && <DashboardSection setSection={setSection} />}
          {(section === 'cases' || section === 'case-edit') && <CasesSection />}
          {section === 'profile' && <ProfileSection />}
          {section === 'analytics' && <AnalyticsSection />}
          {section === 'settings' && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}
