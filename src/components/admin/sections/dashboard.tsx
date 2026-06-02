'use client';

import { AdmIcon } from '../icons';
import type { AdminSection } from '../admin-app';
import { CASES } from '@/lib/content';

type Props = { setSection: (s: AdminSection) => void };

export function DashboardSection({ setSection }: Props) {
  return (
    <>
      <div className="adm__panel" style={{ marginBottom: 24 }}>
        <div className="adm__panel-body" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🚀</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>
            Portfolio recién lanzado
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', maxWidth: 420, margin: '0 auto 24px' }}>
            Las estadísticas de visitas y conversión empezarán a acumularse en cuanto lleguen las primeras visitas. Conecta Google Analytics o GTM Server-Side para ver datos reales aquí.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              Google Analytics →
            </a>
          </div>
        </div>
      </div>

      <div className="adm__row">
        <div className="adm__panel">
          <div className="adm__panel-head">
            <span className="adm__panel-title">Casos publicados</span>
            <button className="btn btn--ghost" onClick={() => setSection('cases')}>
              Gestionar <AdmIcon.arrow />
            </button>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Caso</th>
                <th style={{ width: 90 }}>Año</th>
                <th style={{ width: 120 }}>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {CASES.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td>{c.title.es}</td>
                  <td className="num">{c.year}</td>
                  <td style={{ color: 'var(--ink-500)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{c.category.es}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm__panel">
          <div className="adm__panel-head">
            <span className="adm__panel-title">Accesos rápidos</span>
          </div>
          <div className="adm__panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn--ghost" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setSection('cases')}>
              <AdmIcon.edit /> Gestionar casos
            </button>
            <button className="btn btn--ghost" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setSection('profile')}>
              <AdmIcon.eye /> Editar perfil y estado
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn--ghost" style={{ justifyContent: 'flex-start', width: '100%' }}>
              <AdmIcon.eye /> Ver portfolio →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
