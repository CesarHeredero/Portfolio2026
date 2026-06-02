'use client';

const STATS = [
  { l: 'Visitas únicas (30d)', v: '4.218', trend: '+18.2%' },
  { l: 'Sesiones (30d)', v: '6.842', trend: '+22.4%' },
  { l: 'Engagement rate', v: '68%', trend: '+4.1pp' },
  { l: 'Conversión contacto', v: '1.12%', trend: '+0.4pp' },
];

const SOURCES = [
  { name: 'LinkedIn', visits: 1842, pct: 44, color: 'var(--accent)' },
  { name: 'Direct', visits: 982, pct: 23, color: 'var(--info)' },
  { name: 'Google', visits: 624, pct: 15, color: 'var(--warn)' },
  { name: 'Read.cv', visits: 412, pct: 10, color: 'var(--bad)' },
  { name: 'Otros', visits: 358, pct: 8, color: 'var(--ink-300)' },
];

const COUNTRIES = [
  { c: 'España', v: 2014, pct: 48 },
  { c: 'Reino Unido', v: 612, pct: 15 },
  { c: 'Países Bajos', v: 421, pct: 10 },
  { c: 'Alemania', v: 372, pct: 9 },
  { c: 'EEUU', v: 287, pct: 7 },
  { c: 'Resto', v: 512, pct: 11 },
];

const EVENTS = [
  { e: 'CV descargado', total: 128, today: 4 },
  { e: 'Click email', total: 47, today: 2 },
  { e: 'Click LinkedIn', total: 89, today: 3 },
  { e: 'Click cal.com', total: 21, today: 1 },
  { e: 'Abrir caso', total: 3142, today: 88 },
  { e: 'Filtrar casos', total: 412, today: 12 },
  { e: 'Cambio idioma → EN', total: 184, today: 6 },
];

export function AnalyticsSection() {
  return (
    <>
      <div className="adm__stats">
        {STATS.map((s, i) => (
          <div key={i} className="adm__stat">
            <div className="adm__stat-l">
              <span>{s.l}</span>
              <span className="adm__stat-trend adm__stat-trend--up">↑ {s.trend}</span>
            </div>
            <div className="adm__stat-v">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="adm__row">
        <div className="adm__panel">
          <div className="adm__panel-head">
            <span className="adm__panel-title">Fuentes de tráfico</span>
            <span className="mono-up" style={{ color: 'var(--ink-500)' }}>30D</span>
          </div>
          <div className="adm__panel-body">
            <div style={{ display: 'flex', height: 24, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              {SOURCES.map((s, i) => (
                <div key={i} style={{ width: `${s.pct}%`, background: s.color }} title={`${s.name} · ${s.pct}%`} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SOURCES.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto auto', gap: 10, alignItems: 'center', fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, background: s.color, borderRadius: 2 }} />
                  <span>{s.name}</span>
                  <span className="num" style={{ color: 'var(--ink-500)' }}>{s.visits.toLocaleString('es-ES')}</span>
                  <span className="num" style={{ width: 40, textAlign: 'right' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="adm__panel">
          <div className="adm__panel-head">
            <span className="adm__panel-title">Geografía</span>
          </div>
          <div className="adm__panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COUNTRIES.map((c, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{c.c}</span>
                    <span className="num" style={{ color: 'var(--ink-500)' }}>{c.v.toLocaleString('es-ES')} · {c.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.pct * 2}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="adm__panel">
        <div className="adm__panel-head">
          <span className="adm__panel-title">Eventos clave</span>
          <span className="mono-up" style={{ color: 'var(--ink-500)' }}>SERVER-SIDE GTM · FIRST-PARTY</span>
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th style={{ width: 120 }}>Hoy</th>
              <th style={{ width: 140 }}>Total 30d</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e, i) => (
              <tr key={i}>
                <td>{e.e}</td>
                <td className="num">{e.today}</td>
                <td className="num">{e.total.toLocaleString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, padding: 14, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-3)', fontSize: 12, color: 'var(--accent-2)' }}>
        <b>Privacy-first.</b> Datos servidos vía GTM Server-Side desde first-party. Sin trackers de terceros. Consent Mode v2 activo.
      </div>
    </>
  );
}
