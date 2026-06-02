'use client';

export function AnalyticsSection() {
  return (
    <div className="adm__panel">
      <div className="adm__panel-body" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>
          Sin datos todavía
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-500)', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
          El portfolio acaba de lanzarse. Los datos de visitas, fuentes y eventos se mostrarán aquí una vez que el tracking esté configurado y lleguen las primeras sesiones.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            Configurar GA4 →
          </a>
          <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            GTM Server-Side →
          </a>
        </div>
        <p style={{ marginTop: 24, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Privacy-first · GTM Server-Side · Consent Mode v2
        </p>
      </div>
    </div>
  );
}
