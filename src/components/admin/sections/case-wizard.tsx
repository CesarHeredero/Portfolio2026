'use client';

import { useState, useRef, useEffect } from 'react';
import type { Case, ImpactType, KPI, CaseLink } from '@/lib/content';

type WizardStep = 'brief' | 'generating' | 'chat' | 'saving';

type FullCaseData = {
  titleEs: string; titleEn: string;
  teaserEs: string; teaserEn: string;
  categoryEs: string; categoryEn: string;
  year: string; tags: string[]; impactType: ImpactType;
  piaProblem: string; piaAction: string; piaImpact: string;
  piaProblemEn: string; piaActionEn: string; piaImpactEn: string;
  kpis: { value: string; labelEs: string; labelEn: string }[];
  links: CaseLink[];
  analysisEs: string;
  analysisEn: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function PlatformIcon({ platform }: { platform?: string }) {
  if (platform === 'ios') return <span title="iOS">🍎</span>;
  if (platform === 'android') return <span title="Android">🤖</span>;
  if (platform === 'github') return <span title="GitHub">⌨️</span>;
  if (platform === 'web') return <span title="Web">🌐</span>;
  return <span>🔗</span>;
}

function CasePreview({ c, locale }: { c: FullCaseData; locale: 'es' | 'en' }) {
  const title = locale === 'es' ? c.titleEs : c.titleEn;
  const teaser = locale === 'es' ? c.teaserEs : c.teaserEn;
  const category = locale === 'es' ? c.categoryEs : c.categoryEn;
  const problem = locale === 'es' ? c.piaProblem : c.piaProblemEn;
  const action = locale === 'es' ? c.piaAction : c.piaActionEn;
  const impact = locale === 'es' ? c.piaImpact : c.piaImpactEn;
  const analysis = locale === 'es' ? c.analysisEs : c.analysisEn;

  return (
    <div className="wiz__preview">
      <div className="wiz__preview-lang">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Vista previa · {locale.toUpperCase()}
        </span>
      </div>
      <p style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{category}</p>
      <h2 style={{ fontSize: 'var(--fs-20)', fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.6, marginBottom: 16 }}>{teaser}</p>

      {c.kpis.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {c.kpis.map((k, i) => (
            <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-2)', padding: '8px 12px', textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{k.value}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-500)', lineHeight: 1.3 }}>{locale === 'es' ? k.labelEs : k.labelEn}</div>
            </div>
          ))}
        </div>
      )}

      {c.links.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {c.links.map((l, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-2)', fontSize: 11, color: 'var(--ink-500)' }}>
              <PlatformIcon platform={l.platform} /> {l.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--ink-500)', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <p style={{ marginBottom: 4 }}><strong style={{ color: 'var(--ink-700)' }}>Problema:</strong> {problem}</p>
        <p style={{ marginBottom: 4 }}><strong style={{ color: 'var(--ink-700)' }}>Acción:</strong> {action}</p>
        <p><strong style={{ color: 'var(--ink-700)' }}>Impacto:</strong> {impact}</p>
      </div>

      {analysis && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <p style={{ fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Análisis generado</p>
          <pre style={{ fontSize: 11, color: 'var(--ink-500)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', maxHeight: 200, overflow: 'auto', lineHeight: 1.6 }}>{analysis.slice(0, 600)}{analysis.length > 600 ? '…' : ''}</pre>
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {c.tags.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    </div>
  );
}

// ── Main Wizard ─────────────────────────────────────────────────────────────────

export function CaseWizard({ onBack, onCreated }: { onBack: () => void; onCreated: (id: string) => void }) {
  const [step, setStep] = useState<WizardStep>('brief');
  const [error, setError] = useState('');
  const [brief, setBrief] = useState('');
  const [fullCase, setFullCase] = useState<FullCaseData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [previewLang, setPreviewLang] = useState<'es' | 'en'>('es');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Step 1: Generate from brief ─────────────────────────────────────────────
  async function handleGenerate() {
    if (!brief.trim() || brief.trim().length < 50) {
      setError('Escribe al menos un párrafo describiendo el proyecto.');
      return;
    }
    setError('');
    setStep('generating');
    try {
      const res = await fetch('/api/admin/ai/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'generateFromBrief', brief }),
      });
      const data = (await res.json()) as { generated?: FullCaseData; error?: string };
      if (!res.ok || !data.generated) {
        setError(data.error ?? 'Error al generar el caso');
        setStep('brief');
        return;
      }
      setFullCase(data.generated);
      setMessages([{
        role: 'assistant',
        content: `He generado el caso **"${data.generated.titleEs}"**. Revisa la vista previa a la derecha.\n\nPuedes pedirme cambios: "cambia el título", "quita los KPIs", "añade el enlace de iOS", "el análisis es muy técnico, simplifícalo"...`,
      }]);
      setStep('chat');
    } catch {
      setError('Sin conexión. Comprueba la red.');
      setStep('brief');
    }
  }

  // ── Chat: Refine the case ───────────────────────────────────────────────────
  async function handleChat() {
    if (!chatInput.trim() || !fullCase || isRefining) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setIsRefining(true);
    try {
      const res = await fetch('/api/admin/ai/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'refine', currentCase: fullCase, message: userMsg }),
      });
      const data = (await res.json()) as { updated?: FullCaseData; reply?: string; error?: string };
      if (!res.ok || !data.updated) {
        setMessages((m) => [...m, { role: 'assistant', content: data.error ?? 'No pude procesar ese cambio. Inténtalo de nuevo.' }]);
      } else {
        setFullCase(data.updated);
        setMessages((m) => [...m, { role: 'assistant', content: data.reply ?? 'Listo, he aplicado el cambio.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sin conexión. Comprueba la red.' }]);
    } finally {
      setIsRefining(false);
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave(publish: boolean) {
    if (!fullCase) return;
    setStep('saving');
    setError('');

    const slug = fullCase.titleEs
      .toLowerCase()
      .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i').replace(/[óò]/g, 'o').replace(/[úù]/g, 'u')
      .replace(/[ñ]/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
      + `-${Date.now()}`;

    const kpis: KPI[] = fullCase.kpis
      .filter((k) => k.value.trim())
      .map((k) => ({ value: k.value, label: { es: k.labelEs, en: k.labelEn } }));

    const newCase: Omit<Case, 'id'> & { id: string } = {
      id: slug,
      slug,
      category: { es: fullCase.categoryEs, en: fullCase.categoryEn },
      year: fullCase.year,
      title: { es: fullCase.titleEs, en: fullCase.titleEn },
      teaser: { es: fullCase.teaserEs, en: fullCase.teaserEn },
      kpis,
      tags: fullCase.tags,
      impactType: fullCase.impactType,
      featured: false,
      status: publish ? 'published' : 'draft',
      pia: {
        es: { problem: fullCase.piaProblem, action: fullCase.piaAction, impact: fullCase.piaImpact },
        en: { problem: fullCase.piaProblemEn, action: fullCase.piaActionEn, impact: fullCase.piaImpactEn },
      },
      links: fullCase.links.length > 0 ? fullCase.links : undefined,
    };

    try {
      const res = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        setError(body.error ?? `Error ${res.status}`);
        setStep('chat');
        return;
      }
      const created = (await res.json()) as { id: string };
      const savedSlug = created.id ?? slug;
      if (fullCase.analysisEs || fullCase.analysisEn) {
        await fetch('/api/admin/cases/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: savedSlug, es: fullCase.analysisEs, en: fullCase.analysisEn }),
        });
      }
      onCreated(savedSlug);
    } catch {
      setError('Sin conexión al guardar.');
      setStep('chat');
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" onClick={onBack} disabled={step === 'generating' || step === 'saving'}>
          ← Volver a casos
        </button>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {step === 'brief' ? 'NUEVO CASO CON IA' : step === 'generating' ? 'GENERANDO…' : step === 'chat' ? 'REVISANDO CON IA' : 'GUARDANDO…'}
        </span>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--bad-bg, #fef2f2)', border: '1px solid var(--bad)', borderRadius: 'var(--r-2)', fontSize: 12, color: 'var(--bad)', marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── BRIEF ── */}
      {step === 'brief' && (
        <div className="adm__panel">
          <div className="adm__panel-body">
            <div className="adm__form">
              <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 12, lineHeight: 1.6 }}>
                Cuéntame el proyecto con tus palabras — como si se lo explicaras a alguien. Cuanto más detalle, mejor resultado: qué es, para quién, qué problema resuelve, qué hiciste, resultados, tecnología usada, si tiene enlace de descarga…
              </p>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={`Ejemplo:\n\nPROYECTO: App de listas de la compra compartidas\n\nQué es: app móvil iOS/Android para compartir listas en tiempo real...\nEl problema: las apps existentes requieren cuenta antes de poder usar nada...\nLo que hice: desarrollé la app desde cero con React Native...\nResultado: publicada en App Store y Google Play con 115€ de coste total...\nEnlace iOS: https://apps.apple.com/...`}
                style={{ minHeight: 280, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7 }}
                autoFocus
              />
              <div style={{ marginTop: 12 }}>
                <button className="btn btn--accent" onClick={() => void handleGenerate()}>
                  ✨ Generar caso completo →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATING ── */}
      {step === 'generating' && (
        <div className="adm__panel">
          <div className="adm__panel-body">
            <Spinner label="Claude está leyendo el briefing y montando el caso completo… (20-30 s)" />
          </div>
        </div>
      )}

      {/* ── CHAT + PREVIEW ── */}
      {(step === 'chat' || step === 'saving') && fullCase && (
        <div className="wiz__layout">
          {/* Left: Chat */}
          <div className="wiz__chat">
            <div className="wiz__messages">
              {messages.map((m, i) => (
                <div key={i} className={`wiz__msg wiz__msg--${m.role}`}>
                  <span style={{ fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                    {m.role === 'user' ? 'Tú' : 'Claude'}
                  </span>
                  <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}
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
                placeholder="Pídeme un cambio… (Enter para enviar, Shift+Enter para nueva línea)"
                disabled={isRefining || step === 'saving'}
                style={{ flex: 1, minHeight: 48, maxHeight: 96, resize: 'none', fontFamily: 'inherit', fontSize: 13 }}
              />
              <button
                className="btn btn--accent"
                onClick={() => void handleChat()}
                disabled={isRefining || !chatInput.trim() || step === 'saving'}
                style={{ alignSelf: 'flex-end', flexShrink: 0 }}
              >
                →
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button className="btn btn--accent" onClick={() => void handleSave(false)} disabled={step === 'saving' || isRefining}>
                {step === 'saving' ? 'Guardando…' : 'Guardar borrador'}
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => void handleSave(true)}
                disabled={step === 'saving' || isRefining}
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                Guardar y publicar
              </button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="wiz__preview-col">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {(['es', 'en'] as const).map((l) => (
                <button key={l} className={`adm__tab ${previewLang === l ? 'on' : ''}`} onClick={() => setPreviewLang(l)} style={{ fontSize: 11 }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <CasePreview c={fullCase} locale={previewLang} />
          </div>
        </div>
      )}
    </>
  );
}
