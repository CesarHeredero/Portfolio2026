'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/cases', label: 'Casos', icon: '📋' },
  { href: '/admin/profile', label: 'Perfil', icon: '👤' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { href: '/admin/settings', label: 'Configuración', icon: '⚙' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    document.cookie = 'ch_admin=;path=/;max-age=0';
    router.push('/admin/login');
  }

  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar__head">
        <Link href="/admin" className="admin-sidebar__logo" aria-label="Admin home">
          <div className="admin-sidebar__mark" aria-hidden="true">CH</div>
          <span className="admin-sidebar__title">Admin</span>
        </Link>
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar" aria-hidden="true">CH</div>
          <div className="admin-sidebar__user-info">
            <p className="admin-sidebar__user-name">César Heredero</p>
            <p className="admin-sidebar__user-role">Senior PO</p>
          </div>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Admin menu">
        <ul className="admin-nav__list" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`admin-nav__item${isActive ? ' admin-nav__item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="admin-nav__icon" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar__footer">
        <button
          className="admin-nav__item"
          onClick={handleLogout}
          style={{ color: 'var(--bad)' }}
        >
          <span className="admin-nav__icon" aria-hidden="true">↩</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
