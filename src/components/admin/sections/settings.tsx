'use client';

import { useState } from 'react';

type Tab = 'general' | 'design' | 'integrations' | 'privacy' | 'account';

const ACCENTS = [
  { id: 'green', c: '#2b6f4a', name: 'Verde mineral' },
  { id: 'blue', c: '#2563eb', name: 'Azul' },
  { id: 'terra', c: '#b45c39', name: 'Terracota' },
  { id: 'plum', c: '#7c3aed', name: 'Ciruela' },
  { id: 'ink', c: '#09090b', name: 'Tinta' },
];

const INTEGRATIONS = [
  { name: 'Google Analytics 4', desc: 'Server-side · first-party', status: 'connected', id: 'G-XXXXX' },
  { name: 'Google Tag Manager', desc: 'Server-side container', status: 'connected', id: 'GTM-XXXXX' },
  { name: 'GitHub (Git-as-CMS)', desc: 'Contenido vía Octokit', status: 'connected', id: 'CesarHeredero/Portfolio2026' },
  { name: 'Resend', desc: 'Magic link · Auth.js', status: 'connected', id: 'hola@cesarheredero.com' },
  { name: 'cal.com', desc: 'Programación de reviews', status: 'connected', id: 'cal.com/cesarheredero' },
  { name: 'Webhook · Slack', desc: 'Notificación de contactos', status: 'disconnected', id: '—' },
];

const PRIVACY = [
  { l: 'Consent Mode v2', d: 'RGPD · Sólo medición agregada sin consentimiento', on: true },
  { l: 'Anonimizar IPs', d: 'Eliminar último octeto antes de almacenar', on: true },
  { l: 'Do Not Track', d: 'Respetar la cabecera DNT del navegador', on: true },
  { l: 'Cookies first-party', d: 'Sin cookies de terceros · Vida máxima 24 meses', on: true },
  { l: 'Retención 30 días', d: 'Los datos brutos se borran tras 30 días', on: false },
];

export function SettingsSection() {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <>
      <div className="adm__tabs">
        {([['general', 'General'], ['design', 'Diseño'], ['integrations', 'Integraciones'], ['privacy', 'Privacidad'], ['account', 'Cuenta']] as const).map(([id, l]) => (
          <button key={id} className={`adm__tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      <div className="adm__panel">
        <div className="adm__panel-body">
          {tab === 'general' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>IDIOMA POR DEFECTO</label>
                <select defaultValue="es"><option value="es">Español</option><option value="en">English</option></select>
              </div>
              <div className="adm__field">
                <label>DOMINIO</label>
                <input defaultValue="cesarheredero.com" />
                <div className="adm__field-hint">Cambiar dominio requiere actualizar DNS.</div>
              </div>
              <div className="adm__field">
                <label>ZONA HORARIA</label>
                <select defaultValue="Europe/Madrid"><option>Europe/Madrid</option><option>Europe/London</option></select>
              </div>
            </div>
          )}

          {tab === 'design' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>COLOR DE ACENTO</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {ACCENTS.map((a) => (
                    <button key={a.id} title={a.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 8, border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface)', cursor: 'pointer' }}>
                      <div style={{ width: 32, height: 32, background: a.c, borderRadius: '50%' }} />
                      <span style={{ fontSize: 10, color: 'var(--ink-500)' }}>{a.name}</span>
                    </button>
                  ))}
                </div>
                <div className="adm__field-hint">El acento se cambia en vivo desde la barra de navegación del portfolio.</div>
              </div>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="adm__form">
              {INTEGRATIONS.map((i, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center', padding: 14, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{i.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{i.desc} · <span style={{ fontFamily: 'var(--font-mono)' }}>{i.id}</span></div>
                  </div>
                  <span className={`adm-status adm-status--${i.status === 'connected' ? 'published' : 'archived'}`}>
                    {i.status === 'connected' ? 'CONECTADO' : 'DESCONECTADO'}
                  </span>
                  <button className="btn btn--ghost">{i.status === 'connected' ? 'Configurar' : 'Conectar'}</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'privacy' && (
            <div className="adm__form">
              <div style={{ padding: 14, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 8, fontSize: 12, color: 'var(--accent-2)' }}>
                <b>Privacy-first.</b> Este portfolio usa medición server-side con consent mode v2. Sin trackers de terceros.
              </div>
              {PRIVACY.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{s.l}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{s.d}</div>
                  </div>
                  <span className={`adm__toggle ${s.on ? 'on' : ''}`} />
                </div>
              ))}
            </div>
          )}

          {tab === 'account' && (
            <div className="adm__form">
              <div className="adm__field-row">
                <div className="adm__field"><label>NOMBRE</label><input defaultValue="César Heredero Herranz" /></div>
                <div className="adm__field"><label>EMAIL</label><input defaultValue="hola@cesarheredero.com" /></div>
              </div>
              <div className="adm__field">
                <label>2FA</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="adm__toggle on" />
                  <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Autenticación de dos factores · TOTP</span>
                </div>
              </div>
            </div>
          )}

          <div className="adm__form-actions">
            <button className="btn btn--ghost">Descartar</button>
            <button className="btn btn--accent">Guardar cambios</button>
          </div>
        </div>
      </div>
    </>
  );
}
