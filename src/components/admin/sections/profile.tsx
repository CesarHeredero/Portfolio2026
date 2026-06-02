'use client';

import { useState } from 'react';
import { AdmIcon } from '../icons';

type Tab = 'hero' | 'about' | 'cv' | 'contact';

const STATUS_OPTIONS = [
  { id: 'searching', l: 'En búsqueda activa', d: 'Cambio activo de empresa', tone: 'live' },
  { id: 'open', l: 'Abierto a ofertas', d: 'Disponible para escuchar propuestas', tone: 'live' },
  { id: 'freelance', l: 'Freelance disponible', d: 'Aceptando proyectos puntuales', tone: 'live' },
  { id: 'consulting', l: 'Acepto consultorías', d: 'Asesoría de producto / UX por horas', tone: 'live' },
  { id: 'collab', l: 'Abierto a colaboraciones', d: 'Side projects, mentoring, charlas', tone: 'live' },
  { id: 'selective', l: 'Escuchando ofertas selectas', d: 'Sólo posiciones muy alineadas', tone: 'soft' },
  { id: 'busy', l: 'No disponible', d: 'Sin capacidad para nuevas oportunidades', tone: 'mute' },
  { id: 'hidden', l: 'Ocultar badge', d: 'No mostrar estado en el portfolio', tone: 'off' },
];

function StatusEditor() {
  const [status, setStatus] = useState('open');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
      {STATUS_OPTIONS.map((o) => {
        const on = o.id === status;
        const dot = o.tone === 'live' ? 'var(--accent)' : o.tone === 'soft' ? 'var(--warn)' : o.tone === 'off' ? 'transparent' : 'var(--ink-400)';
        return (
          <button
            key={o.id}
            onClick={() => setStatus(o.id)}
            style={{
              display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
              border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
              background: on ? 'var(--accent-bg)' : 'var(--surface)', borderRadius: 'var(--r-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, border: o.tone === 'off' ? '1px dashed var(--line-3)' : 'none' }} />
              <strong style={{ fontWeight: 500, fontSize: 13 }}>{o.l}</strong>
            </div>
            <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{o.d}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProfileSection() {
  const [tab, setTab] = useState<Tab>('hero');

  return (
    <>
      <div className="adm__tabs">
        {([['hero', 'Hero'], ['about', 'Sobre mí'], ['cv', 'CV'], ['contact', 'Contacto']] as const).map(([id, l]) => (
          <button key={id} className={`adm__tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      <div className="adm__panel">
        <div className="adm__panel-body">
          {tab === 'hero' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>ESTADO DE DISPONIBILIDAD · BADGE</label>
                <StatusEditor />
                <div className="adm__field-hint">Aparece en la barra superior y en el hero. Los cambios se aplican al instante.</div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field"><label>NOMBRE</label><input defaultValue="César Heredero Herranz" /></div>
                <div className="adm__field"><label>ROL CORTO</label><input defaultValue="Senior PO · UX Strategist" /></div>
              </div>
              <div className="adm__field">
                <label>TÍTULO HERO · ES</label>
                <textarea defaultValue="Convierto producto en palancas de negocio medibles." />
              </div>
              <div className="adm__field">
                <label>SUBTÍTULO · ES</label>
                <textarea defaultValue="Senior Product Owner & UX Strategist en Flexicar. Diez años puenteando diseño, datos y negocio en un ecommerce de automoción con +30.000 fichas y presencia en España y Portugal." style={{ minHeight: 90 }} />
              </div>
              <div className="adm__field-row">
                <div className="adm__field"><label>UBICACIÓN</label><input defaultValue="Madrid · Remoto OK" /></div>
                <div className="adm__field"><label>DISPONIBILIDAD</label><input defaultValue="Q2 2026" /></div>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>BIO · ES (un párrafo por línea)</label>
                <textarea defaultValue={'Diez años en diseño y producto digital. Empecé como diseñador UX/UI consultando para Toyota, Hyundai, Sacyl, Interflora y SHAI Tajo en Devoteam.\n\nDesde 2019 en Flexicar como Senior Product Owner, donde lidero proyectos transversales entre producto, UX, SEO técnico y datos.'} style={{ minHeight: 160 }} />
              </div>
            </div>
          )}

          {tab === 'cv' && (
            <div className="adm__form">
              <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>El CV se edita en el repositorio (content/cv.json) y se sincroniza vía Git-as-CMS.</p>
              <div className="adm__field">
                <label>CV PDF</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-700)' }}>cesar-heredero-cv.pdf · 218KB · v2.3.1</span>
                  <button className="btn btn--ghost"><AdmIcon.upload /> Reemplazar</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="adm__form">
              <div className="adm__field"><label>EMAIL</label><input defaultValue="hola@cesarheredero.com" /></div>
              <div className="adm__field"><label>LINKEDIN</label><input defaultValue="linkedin.com/in/cesarheredero" /></div>
              <div className="adm__field"><label>CALENDARIO</label><input defaultValue="cal.com/cesarheredero" /></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
