'use client';

import { CASES } from '@/lib/content';

const ACTIVITY = [
  { text: 'Caso "Blog Directus" actualizado', time: 'Hace 2h', color: 'var(--ok)' },
  { text: 'Nuevo caso añadido: Tag Gateway', time: 'Hace 1d', color: 'var(--accent)' },
  { text: 'Perfil actualizado', time: 'Hace 3d', color: 'var(--info)' },
  { text: 'Tema cambiado a oscuro', time: 'Hace 5d', color: 'var(--warn)' },
  { text: 'Caso "sGTM" publicado', time: 'Hace 1s', color: 'var(--ok)' },
];

export function Dashboard() {
  const totalCases = CASES.length;
  const publishedCases = CASES.length;
  const featuredCases = CASES.filter((c) => c.featured).length;
  const lastUpdated = '26 May 2026';

  const stats = [
    { label: 'Total casos', value: String(totalCases), hint: 'Todos los documentados' },
    { label: 'Publicados', value: String(publishedCases), hint: 'En producción' },
    { label: 'Destacados', value: String(featuredCases), hint: 'En portada' },
    { label: 'Última actualización', value: lastUpdated, hint: 'Portfolio 2026' },
  ];

  return (
    <div className="admin-content">
      <div className="admin-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-stat">
            <p className="admin-stat__label">{stat.label}</p>
            <p className="admin-stat__value">{stat.value}</p>
            <p className="admin-stat__hint">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-head">
          <span className="admin-table-title">Casos</span>
          <span
            className="badge badge--accent"
            aria-label={`${totalCases} total`}
          >
            {totalCases}
          </span>
        </div>
        <table className="admin-table" aria-label="Cases list">
          <thead>
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Categoría</th>
              <th scope="col">Año</th>
              <th scope="col">Impacto</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500, color: 'var(--ink-900)' }}>
                  {c.title.es}
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-11)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {c.category.es}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{c.year}</td>
                <td>{c.impactType}</td>
                <td>
                  <span className="badge badge--accent">Publicado</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-activity">
        <div className="admin-activity__head">
          <span className="admin-activity__title">Actividad reciente</span>
        </div>
        <ul className="admin-activity__list" role="list">
          {ACTIVITY.map((item, i) => (
            <li key={i} className="admin-activity__item">
              <span
                className="admin-activity__dot"
                style={{ background: item.color }}
                aria-hidden="true"
              />
              <span className="admin-activity__text">{item.text}</span>
              <time className="admin-activity__time">{item.time}</time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
