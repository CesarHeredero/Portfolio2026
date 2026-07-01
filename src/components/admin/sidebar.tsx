'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdmIcon } from './icons';
import type { AdminSection } from './admin-app';

type Props = {
  section: AdminSection;
  setSection: (s: AdminSection) => void;
};

const ITEMS: { id: AdminSection; label: string; icon: keyof typeof AdmIcon; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'cases', label: 'Casos', icon: 'cases', badge: '8' },
  { id: 'profile', label: 'Perfil', icon: 'profile' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics' },
];

export function AdminSidebar({ section, setSection }: Props) {
  const router = useRouter();

  function handleLogout() {
    document.cookie = 'ch_admin=;path=/;max-age=0';
    router.push('/admin/login');
  }

  return (
    <aside className="adm__side">
      <Link href="/es" className="adm__brand">
        <span className="adm__brand-mark">CH</span>
        <span className="adm__brand-text">
          <span className="adm__brand-name">César Heredero</span>
          <span className="adm__brand-sub">INTRANET · v2.0</span>
        </span>
      </Link>

      <div className="adm__user">
        <div className="adm__user-avatar">CH</div>
        <div className="adm__user-info">
          <div className="adm__user-name">César H.</div>
          <div className="adm__user-role">Owner</div>
        </div>
        <div className="adm__user-status" title="Online" />
      </div>

      <nav className="adm__nav" aria-label="Admin">
        <div className="adm__nav-group">PRINCIPAL</div>
        {ITEMS.map((it) => {
          const Icon = AdmIcon[it.icon];
          const active = section === it.id || (it.id === 'cases' && section === 'case-edit');
          return (
            <button
              key={it.id}
              className={`adm__nav-item ${active ? 'is-active' : ''}`}
              onClick={() => setSection(it.id)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon />
              <span>{it.label}</span>
              {it.badge && <span className="adm__nav-badge">{it.badge}</span>}
            </button>
          );
        })}

        <div className="adm__nav-group">SISTEMA</div>
        <button
          className={`adm__nav-item ${section === 'settings' ? 'is-active' : ''}`}
          onClick={() => setSection('settings')}
          aria-current={section === 'settings' ? 'page' : undefined}
        >
          <AdmIcon.settings />
          <span>Configuración</span>
        </button>
      </nav>

      <div className="adm__side-bottom">
        <Link href="/es" className="adm__nav-item">
          <AdmIcon.external />
          <span>Ver portfolio</span>
        </Link>
        <button className="adm__nav-item" style={{ color: 'var(--ink-500)' }} onClick={handleLogout}>
          <AdmIcon.logout />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
