'use client';

import { AdmIcon } from '../icons';
import type { AdminSection } from '../admin-app';

type Props = { setSection: (s: AdminSection) => void };

const STATS = [
  { l: 'Visitas (30d)', v: '4.218', trend: '+18%', up: true, spark: [12, 15, 11, 18, 22, 19, 25, 28, 26, 30, 32, 34] },
  { l: 'Tiempo medio', v: '3:24', trend: '+0:42', up: true, spark: [8, 10, 12, 14, 13, 16, 18, 17, 20, 22, 21, 23] },
  { l: 'Click contacto', v: '47', trend: '+12', up: true, spark: [2, 3, 4, 3, 5, 6, 5, 7, 8, 9, 11, 12] },
  { l: 'CV descargado', v: '128', trend: '−4%', up: false, spark: [20, 22, 25, 28, 26, 24, 22, 20, 18, 19, 17, 16] },
];

const TOP_CASES = [
  { id: 'blog-headless', title: 'Migración de blog a CMS headless', views: 1248, time: '4:12', click: 18 },
  { id: 'sgtm', title: 'Server-side tracking · 28%', views: 982, time: '3:45', click: 14 },
  { id: 'whatsapp', title: 'WhatsApp en funnel de tasación', views: 754, time: '2:58', click: 9 },
  { id: 'autocaravanas', title: 'Nueva línea: autocaravanas', views: 612, time: '3:20', click: 6 },
  { id: 'wpo', title: 'Auditorías de rendimiento', views: 421, time: '2:14', click: 4 },
];

const ACTIVITY = [
  { icon: 'eye', t: <><b>Recruiter (LinkedIn)</b> visitó <b>Migración de blog</b></>, w: 'hace 3 min' },
  { icon: 'upload', t: <>Publicado caso <b>Server-side GTM</b></>, w: 'hace 2 h' },
  { icon: 'edit', t: <>Actualizado <b>Hero · Subtítulo</b></>, w: 'ayer · 18:42' },
  { icon: 'eye', t: <>5 visitas desde <b>Stripe Careers</b></>, w: 'ayer · 14:20' },
  { icon: 'edit', t: <>Nueva traducción EN en <b>Sobre mí</b></>, w: '21 may · 09:15' },
  { icon: 'upload', t: <>CV subido a v2.3.1</>, w: '20 may · 11:00' },
] as const;

function spark(points: number[]) {
  return points.map((v, i) => `${(i / (points.length - 1)) * 100},${32 - (v / 35) * 28}`).join(' ');
}

export function DashboardSection({ setSection }: Props) {
  return (
    <>
      <div className="adm__stats">
        {STATS.map((s, i) => (
          <div key={i} className="adm__stat">
            <div className="adm__stat-l">
              <span>{s.l}</span>
              <span className={`adm__stat-trend ${s.up ? 'adm__stat-trend--up' : 'adm__stat-trend--down'}`}>
                {s.up ? '↑' : '↓'} {s.trend}
              </span>
            </div>
            <div className="adm__stat-v">{s.v}</div>
            <svg className="adm__stat-spark" viewBox="0 0 100 32" preserveAspectRatio="none">
              <polyline fill="none" stroke="var(--accent)" strokeWidth="1.5" points={spark(s.spark)} />
              <polyline fill="var(--accent)" opacity="0.08" stroke="none" points={`0,32 ${spark(s.spark)} 100,32`} />
            </svg>
          </div>
        ))}
      </div>

      <div className="adm__row">
        <div className="adm__panel">
          <div className="adm__panel-head">
            <span className="adm__panel-title">Casos más vistos · 30d</span>
            <button className="btn btn--ghost" onClick={() => setSection('cases')}>
              Ver todos <AdmIcon.arrow />
            </button>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Caso</th>
                <th style={{ width: 90 }}>Vistas</th>
                <th style={{ width: 90 }}>T. medio</th>
                <th style={{ width: 70, textAlign: 'right' }}>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CASES.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td className="num">{c.views.toLocaleString('es-ES')}</td>
                  <td className="num" style={{ color: 'var(--ink-500)' }}>{c.time}</td>
                  <td className="num" style={{ textAlign: 'right' }}>{c.click}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm__panel">
          <div className="adm__panel-head">
            <span className="adm__panel-title">Actividad reciente</span>
            <span className="mono-up" style={{ color: 'var(--ink-500)' }}>LIVE</span>
          </div>
          <div className="adm__feed">
            {ACTIVITY.map((a, i) => {
              const Icon = AdmIcon[a.icon];
              return (
                <div key={i} className="adm__feed-item">
                  <div className="adm__feed-icon"><Icon /></div>
                  <div className="adm__feed-body">{a.t}</div>
                  <div className="adm__feed-when">{a.w}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="adm__panel">
        <div className="adm__panel-head">
          <span className="adm__panel-title">Visitas por día · últimos 12 días</span>
          <div className="seg">
            <button aria-pressed="true">12d</button>
            <button>30d</button>
            <button>90d</button>
          </div>
        </div>
        <div className="adm__panel-body" style={{ paddingBottom: 36 }}>
          <div className="adm__chart">
            {[42, 58, 49, 61, 78, 71, 90, 84, 102, 118, 125, 142].map((v, i) => {
              const labels = ['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
              return (
                <div
                  key={i}
                  className="adm__chart-bar"
                  style={{ height: `${(v / 150) * 100}%`, background: i === 11 ? 'var(--accent)' : undefined }}
                  data-label={labels[i]}
                  title={`${v} visitas`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
