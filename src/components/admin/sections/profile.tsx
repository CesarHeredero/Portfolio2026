'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

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

type SiteData = {
  content?: {
    hero?: {
      pretitle?: string;
      title?: { es?: string; en?: string };
      sub?: { es?: string; en?: string };
      idName?: string;
      roleValue?: string;
      expValue?: string;
      locationValue?: string;
      cta1?: string; cta2?: string; cta3?: string;
    };
    bento?: {
      roleValue?: string; roleCompany?: string; seekingRoles?: string;
      kpiValue?: string; kpiLabel?: string;
      clientsValue?: string; awardValue?: string; capabilities?: string;
    };
    about?: {
      name?: string; roleTag?: string;
      bio?: { es?: string; en?: string };
      expValue?: string; locationValue?: string; langValue?: string; companyValue?: string;
      q1Title?: string; q1Desc?: string;
      q2Title?: string; q2Desc?: string;
      q3Title?: string; q3Desc?: string;
      q4Title?: string; q4Desc?: string;
    };
    process?: {
      step1Title?: string; step1Desc?: string;
      step2Title?: string; step2Desc?: string;
      step3Title?: string; step3Desc?: string;
      step4Title?: string; step4Desc?: string;
      step5Title?: string; step5Desc?: string;
      step6Title?: string; step6Desc?: string;
      step7Title?: string; step7Desc?: string;
      step8Title?: string; step8Desc?: string;
    };
    contact?: { title?: string; intro?: string; email?: string; linkedin?: string; cal?: string };
    footer?: { pitch?: string };
    statusBar?: { role?: string };
  };
  availability?: { status?: string };
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

// ── Deep merge ────────────────────────────────────────────────────────────────

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;
  for (const key in source) {
    const sv = source[key];
    const tv = target[key as keyof T];
    if (sv !== null && sv !== undefined && typeof sv === 'object' && !Array.isArray(sv) && typeof tv === 'object' && tv !== null) {
      (result as Record<string, unknown>)[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      );
    } else if (sv !== undefined) {
      (result as Record<string, unknown>)[key] = sv;
    }
  }
  return result;
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 24px' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--line)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── StatusEditor ──────────────────────────────────────────────────────────────

function StatusEditor({ current }: { current: string }) {
  const [status, setStatus] = useState(current);
  useEffect(() => { setStatus(current); }, [current]);

  async function change(next: string) {
    setStatus(next);
    await fetch('/api/admin/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availability: { status: next } }),
    });
    document.cookie = `ch_status=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new CustomEvent('ch:status', { detail: { status: next } }));
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
      {STATUS_OPTIONS.map((o) => {
        const on = o.id === status;
        const dot = o.tone === 'live' ? 'var(--accent)' : o.tone === 'soft' ? 'var(--warn)' : o.tone === 'off' ? 'transparent' : 'var(--ink-400)';
        return (
          <button key={o.id} onClick={() => void change(o.id)} style={{
            display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
            border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
            background: on ? 'var(--accent-bg)' : 'var(--surface)', borderRadius: 'var(--r-2)',
          }}>
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

// ── SitePreview ───────────────────────────────────────────────────────────────

function SitePreview({ site }: { site: SiteData }) {
  const c = site.content ?? {};
  const steps = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
    const key = `step${n}Title` as keyof NonNullable<typeof c.process>;
    return { n, title: c.process?.[key] ?? '' };
  }).filter((s) => s.title);

  return (
    <div className="wiz__preview">
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', marginBottom: 6 }}>HERO</p>
        {c.hero?.pretitle && <p style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{c.hero.pretitle}</p>}
        {c.hero?.title?.es && <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{c.hero.title.es}</p>}
        {c.hero?.sub?.es && <p style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5 }}>{c.hero.sub.es}</p>}
      </div>

      {c.about?.bio?.es && (
        <div style={{ marginBottom: 16, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', marginBottom: 6 }}>SOBRE MÍ</p>
          <p style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.6 }}>
            {c.about.bio.es.slice(0, 150)}{c.about.bio.es.length > 150 ? '…' : ''}
          </p>
        </div>
      )}

      {steps.length > 0 && (
        <div style={{ marginBottom: 16, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', marginBottom: 6 }}>PROCESO</p>
          <ol style={{ margin: 0, paddingLeft: 16, listStyle: 'decimal' }}>
            {steps.map((s) => (
              <li key={s.n} style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--ink-700)' }}>{s.title}</li>
            ))}
          </ol>
        </div>
      )}

      {(c.contact?.email || c.contact?.linkedin) && (
        <div style={{ marginBottom: 16, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', marginBottom: 6 }}>CONTACTO</p>
          {c.contact?.email && <p style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 2 }}>{c.contact.email}</p>}
          {c.contact?.linkedin && <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>{c.contact.linkedin}</p>}
        </div>
      )}

      {c.footer?.pitch && (
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', marginBottom: 6 }}>FOOTER</p>
          <p style={{ fontSize: 12, color: 'var(--ink-500)', fontStyle: 'italic' }}>{c.footer.pitch}</p>
        </div>
      )}
    </div>
  );
}

// ── ProfileSection ─────────────────────────────────────────────────────────────

export function ProfileSection() {
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [saving, setSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadSite = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site');
      const data = (await res.json()) as SiteData;
      setSite(data);
      setMessages([{
        role: 'assistant',
        content: 'Hola César. Puedo modificar cualquier sección del portfolio: el hero, el sobre mí, los pasos del proceso, el contacto, el footer, el bento… Solo dime qué quieres cambiar.',
      }]);
    } catch {
      setSite({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSite();
  }, [loadSite]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleChat() {
    if (!chatInput.trim() || !site || isRefining) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setIsRefining(true);

    try {
      const res = await fetch('/api/admin/ai/edit-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSite: site, message: userMsg }),
      });
      const data = (await res.json()) as { updatedFields?: Partial<SiteData['content']>; reply?: string; error?: string };

      if (!res.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: data.error ?? 'No pude procesar ese cambio. Inténtalo de nuevo.' }]);
      } else {
        // Deep merge updatedFields into site.content
        const mergedContent = deepMerge(
          (site.content ?? {}) as Record<string, unknown>,
          (data.updatedFields ?? {}) as Record<string, unknown>,
        );
        const updatedSite: SiteData = { ...site, content: mergedContent as SiteData['content'] };
        setSite(updatedSite);
        setMessages((m) => [...m, { role: 'assistant', content: data.reply ?? 'Listo, he aplicado el cambio.' }]);

        // Auto-save
        setSaving(true);
        try {
          await fetch('/api/admin/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: mergedContent }),
          });
        } finally {
          setSaving(false);
        }
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sin conexión. Comprueba la red.' }]);
    } finally {
      setIsRefining(false);
    }
  }

  if (loading) {
    return (
      <div className="adm__panel">
        <div className="adm__panel-body">
          <Spinner label="Cargando perfil…" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Availability status */}
      <div className="adm__panel" style={{ marginBottom: 16 }}>
        <div className="adm__panel-head">
          <span className="adm__panel-title">Estado de disponibilidad</span>
        </div>
        <div className="adm__panel-body">
          <StatusEditor current={site?.availability?.status ?? 'open'} />
          <div className="adm__field-hint" style={{ marginTop: 8 }}>Los cambios se aplican al instante en el header y el hero.</div>
        </div>
      </div>

      {/* Chat + Preview */}
      <div className="wiz__layout">
        {/* Left: Chat (55%) */}
        <div className="wiz__chat">
          <div className="wiz__messages">
            {messages.map((m, i) => (
              <div key={i} className={`wiz__msg wiz__msg--${m.role}`}>
                <span style={{ fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                  {m.role === 'user' ? 'Tú' : 'Claude'}
                </span>
                <p
                  style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}
                  dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
            ))}
            {isRefining && (
              <div className="wiz__msg wiz__msg--assistant">
                <span style={{ fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Claude</span>
                <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>Procesando…</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="wiz__input-row">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleChat(); } }}
              placeholder="Dime qué cambiar… (Enter para enviar, Shift+Enter para nueva línea)"
              disabled={isRefining}
              style={{ flex: 1, minHeight: 48, maxHeight: 96, resize: 'none', fontFamily: 'inherit', fontSize: 13 }}
            />
            <button
              className="btn btn--accent"
              onClick={() => void handleChat()}
              disabled={isRefining || !chatInput.trim()}
              style={{ alignSelf: 'flex-end', flexShrink: 0 }}
            >
              →
            </button>
          </div>

          {saving && (
            <p style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>Guardando…</p>
          )}
        </div>

        {/* Right: Preview (45%) */}
        <div className="wiz__preview-col">
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', marginBottom: 8 }}>Vista previa del contenido</p>
          {site && <SitePreview site={site} />}
        </div>
      </div>
    </>
  );
}
