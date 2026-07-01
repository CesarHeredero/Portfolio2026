'use client';

import { useState } from 'react';
import type { Case, ImpactType, KPI } from '@/lib/content';

type WizardStep = 'input' | 'analyzing' | 'questions' | 'generating' | 'review' | 'saving';

type InitialData = {
  title: string;
  company: string;
  role: string;
  date: string;
  description: string;
  tags: string;
};

type Question = {
  id: string;
  question: string;
  why: string;
  placeholder: string;
};

type GeneratedCase = {
  title: { es: string; en: string };
  teaser: { es: string; en: string };
  category: { es: string; en: string };
  impactType: ImpactType;
  tags: string[];
  kpis: { value: string; label: { es: string; en: string } }[];
  pia: {
    es: { problem: string; action: string; impact: string };
    en: { problem: string; action: string; impact: string };
  };
};

type ReviewState = {
  titleEs: string; titleEn: string;
  teaserEs: string; teaserEn: string;
  categoryEs: string; categoryEn: string;
  impactType: ImpactType;
  tags: string;
  kpis: { value: string; labelEs: string; labelEn: string }[];
  problemEs: string; actionEs: string; impactEs: string;
  problemEn: string; actionEn: string; impactEn: string;
  year: string;
};

function seedReview(g: GeneratedCase, year: string): ReviewState {
  return {
    titleEs: g.title.es, titleEn: g.title.en,
    teaserEs: g.teaser.es, teaserEn: g.teaser.en,
    categoryEs: g.category.es, categoryEn: g.category.en,
    impactType: g.impactType,
    tags: g.tags.join(', '),
    kpis: g.kpis.map((k) => ({ value: k.value, labelEs: k.label.es, labelEn: k.label.en })),
    problemEs: g.pia.es.problem, actionEs: g.pia.es.action, impactEs: g.pia.es.impact,
    problemEn: g.pia.en.problem, actionEn: g.pia.en.action, impactEn: g.pia.en.impact,
    year,
  };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="adm__field">
      <label>{label}</label>
      {children}
      {hint && <div className="adm__field-hint">{hint}</div>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="adm__field-row">{children}</div>;
}

function StepBadge({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: active ? 1 : 0.4 }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--accent)' : 'var(--line)', color: active ? '#fff' : 'var(--ink-500)',
        fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', color: active ? 'var(--ink)' : 'var(--ink-500)' }}>{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 24px' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--line)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
        Analizando con IA…
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function GeneratingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 24px' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--line)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
        Generando el caso de estudio…
      </span>
      <p style={{ fontSize: 11, color: 'var(--ink-500)', textAlign: 'center', maxWidth: 320 }}>
        Claude está analizando la información, redactando el contenido en español e inglés y calculando los KPIs. Puede tardar 15-30 segundos.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export function CaseWizard({ onBack, onCreated }: { onBack: () => void; onCreated: (id: string) => void }) {
  const [step, setStep] = useState<WizardStep>('input');
  const [error, setError] = useState('');

  // Step 1 data
  const [initial, setInitial] = useState<InitialData>({
    title: '', company: '', role: 'Senior Product Owner · UX Strategist', date: '', description: '', tags: '',
  });

  // Step 2 data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Step 3 data
  const [review, setReview] = useState<ReviewState | null>(null);
  const [reviewTab, setReviewTab] = useState<'content' | 'kpis' | 'meta'>('content');

  // ── Step 1 → analyze ────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!initial.title.trim() || !initial.company.trim() || !initial.description.trim()) {
      setError('Rellena al menos el título, la empresa y la descripción.');
      return;
    }
    setError('');
    setStep('analyzing');

    try {
      const res = await fetch('/api/admin/ai/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'analyze', initialData: initial }),
      });
      const data = (await res.json()) as { hasEnoughInfo?: boolean; questions?: Question[]; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Error del servidor');
        setStep('input');
        return;
      }

      if (data.hasEnoughInfo) {
        await runGenerate({});
      } else {
        setQuestions(data.questions ?? []);
        const a: Record<string, string> = {};
        (data.questions ?? []).forEach((q) => { a[q.id] = ''; });
        setAnswers(a);
        setStep('questions');
      }
    } catch {
      setError('Sin conexión. Comprueba la red.');
      setStep('input');
    }
  }

  // ── Step 2 → generate ───────────────────────────────────────────────────────
  async function handleGenerate() {
    const unanswered = questions.filter((q) => !(answers[q.id]?.trim()));
    if (unanswered.length > 0) {
      setError('Por favor responde todas las preguntas para que la IA tenga suficiente información.');
      return;
    }
    setError('');
    await runGenerate(answers);
  }

  async function runGenerate(ans: Record<string, string>) {
    setStep('generating');
    try {
      const res = await fetch('/api/admin/ai/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'generate', initialData: initial, answers: ans }),
      });
      const data = (await res.json()) as { generated?: GeneratedCase; error?: string };

      if (!res.ok || !data.generated) {
        setError(data.error ?? 'Error al generar el caso');
        setStep(Object.keys(ans).length > 0 ? 'questions' : 'input');
        return;
      }

      const year = initial.date.match(/\d{4}/)?.[0] ?? new Date().getFullYear().toString();
      setReview(seedReview(data.generated, year));
      setStep('review');
    } catch {
      setError('Sin conexión. Comprueba la red.');
      setStep('input');
    }
  }

  // ── Step 3 → save ───────────────────────────────────────────────────────────
  async function handleSave(publish: boolean) {
    if (!review) return;
    setStep('saving');
    setError('');

    const slug = review.titleEs
      .toLowerCase()
      .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i').replace(/[óò]/g, 'o').replace(/[úù]/g, 'u')
      .replace(/[ñ]/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
      + `-${Date.now()}`;

    const kpis: KPI[] = review.kpis
      .filter((k) => k.value.trim())
      .map((k) => ({ value: k.value, label: { es: k.labelEs, en: k.labelEn } }));

    const newCase: Omit<Case, 'id'> & { id: string } = {
      id: slug,
      slug,
      category: { es: review.categoryEs, en: review.categoryEn },
      year: review.year,
      title: { es: review.titleEs, en: review.titleEn },
      teaser: { es: review.teaserEs, en: review.teaserEn },
      kpis,
      tags: review.tags.split(',').map((t) => t.trim()).filter(Boolean),
      impactType: review.impactType,
      featured: false,
      status: publish ? 'published' : 'draft',
      pia: {
        es: { problem: review.problemEs, action: review.actionEs, impact: review.impactEs },
        en: { problem: review.problemEn, action: review.actionEn, impact: review.impactEn },
      },
    };

    try {
      const res = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      if (res.ok) {
        const created = (await res.json()) as { id: string };
        onCreated(created.id ?? slug);
      } else {
        const body = await res.json() as { error?: string };
        setError(body.error ?? `Error ${res.status}`);
        setStep('review');
      }
    } catch {
      setError('Sin conexión al guardar.');
      setStep('review');
    }
  }

  // ── Review helpers ─────────────────────────────────────────────────────────
  function updateReview<K extends keyof ReviewState>(key: K, value: ReviewState[K]) {
    setReview((r) => r ? { ...r, [key]: value } : r);
  }
  function setKpi(i: number, field: 'value' | 'labelEs' | 'labelEn', value: string) {
    setReview((r) => {
      if (!r) return r;
      return { ...r, kpis: r.kpis.map((k, idx) => idx === i ? { ...k, [field]: value } : k) };
    });
  }

  const stepIndex = step === 'input' || step === 'analyzing' ? 0 : step === 'questions' || step === 'generating' ? 1 : 2;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" onClick={onBack} disabled={step === 'analyzing' || step === 'generating' || step === 'saving'}>
          ← Volver a casos
        </button>
        <div style={{ display: 'flex', gap: 20 }}>
          <StepBadge n={1} label="CUÉNTAME EL PROYECTO" active={stepIndex === 0} />
          <StepBadge n={2} label="MÁS INFO" active={stepIndex === 1} />
          <StepBadge n={3} label="REVISAR Y GUARDAR" active={stepIndex === 2} />
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--bad-bg, #fef2f2)', border: '1px solid var(--bad)', borderRadius: 'var(--r-2)', fontSize: 12, color: 'var(--bad)', marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── STEP 1: Input ── */}
      {(step === 'input') && (
        <div className="adm__panel">
          <div className="adm__panel-body">
            <div className="adm__form">
              <p style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 4 }}>
                Cuéntame el proyecto con tus palabras. No te preocupes por el formato — yo lo estructuro.
              </p>
              <Row>
                <Field label="TÍTULO DEL PROYECTO">
                  <input
                    value={initial.title}
                    onChange={(e) => setInitial((s) => ({ ...s, title: e.target.value }))}
                    placeholder="ej. Migración del blog a CMS headless"
                    autoFocus
                  />
                </Field>
                <Field label="EMPRESA / CLIENTE">
                  <input
                    value={initial.company}
                    onChange={(e) => setInitial((s) => ({ ...s, company: e.target.value }))}
                    placeholder="ej. Flexicar"
                  />
                </Field>
              </Row>
              <Row>
                <Field label="TU ROL EN EL PROYECTO">
                  <input
                    value={initial.role}
                    onChange={(e) => setInitial((s) => ({ ...s, role: e.target.value }))}
                    placeholder="ej. Product Owner, responsable de diseño…"
                  />
                </Field>
                <Field label="AÑO / PERÍODO">
                  <input
                    value={initial.date}
                    onChange={(e) => setInitial((s) => ({ ...s, date: e.target.value }))}
                    placeholder="ej. 2024 o 2023-2024"
                  />
                </Field>
              </Row>
              <Field label="DESCRIPCIÓN LIBRE — qué hiciste, qué problema resolvías, qué impacto tuvo">
                <textarea
                  value={initial.description}
                  onChange={(e) => setInitial((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Ej: El blog estaba en un subdominio separado y Google lo trataba como otro sitio, lo que diluía toda la autoridad SEO. Decidimos migrarlo al dominio principal con un CMS headless. Migré 1.092 artículos, mantuve el 100% del tráfico orgánico y marketing ganó autonomía para publicar sin depender de dev."
                  style={{ minHeight: 140 }}
                />
              </Field>
              <Field label="TAGS SUGERIDOS (opcional)" hint="La IA los puede inferir, pero si los tienes claros ponlos aquí.">
                <input
                  value={initial.tags}
                  onChange={(e) => setInitial((s) => ({ ...s, tags: e.target.value }))}
                  placeholder="ej. GTM Server-Side, BigQuery, RGPD"
                />
              </Field>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  className="btn btn--accent"
                  onClick={() => void handleAnalyze()}
                >
                  Analizar con IA →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1 loading ── */}
      {step === 'analyzing' && (
        <div className="adm__panel">
          <div className="adm__panel-body">
            <Spinner />
          </div>
        </div>
      )}

      {/* ── STEP 2: Questions ── */}
      {step === 'questions' && (
        <div className="adm__panel">
          <div className="adm__panel-body">
            <div className="adm__form">
              <div style={{ padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 'var(--r-2)', marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: 'var(--accent-2)', margin: 0 }}>
                  <strong>La IA necesita más información</strong> para escribir un caso con impacto medible. Responde estas preguntas y generará el caso completo.
                </p>
              </div>
              {questions.map((q) => (
                <div key={q.id} style={{ marginBottom: 20 }}>
                  <div className="adm__field">
                    <label>{q.question}</label>
                    <div className="adm__field-hint" style={{ marginBottom: 6 }}>{q.why}</div>
                    <textarea
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder={q.placeholder}
                      style={{ minHeight: 72 }}
                    />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn--accent" onClick={() => void handleGenerate()}>
                  Generar caso completo →
                </button>
                <button className="btn btn--ghost" onClick={() => setStep('input')}>
                  ← Volver a editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2 loading ── */}
      {step === 'generating' && (
        <div className="adm__panel">
          <div className="adm__panel-body">
            <GeneratingSpinner />
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {(step === 'review' || step === 'saving') && review && (
        <>
          <div style={{ padding: '10px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 'var(--r-2)', marginBottom: 12, fontSize: 12, color: 'var(--accent-2)' }}>
            ✓ Caso generado. Revisa y edita lo que necesites antes de guardar.
          </div>

          <div className="adm__tabs">
            {(['content', 'kpis', 'meta'] as const).map((tk) => (
              <button key={tk} className={`adm__tab ${reviewTab === tk ? 'on' : ''}`} onClick={() => setReviewTab(tk)}>
                {tk === 'content' ? 'Contenido' : tk === 'kpis' ? 'KPIs' : 'Metadata'}
              </button>
            ))}
          </div>

          <div className="adm__panel">
            <div className="adm__panel-body">
              <div className="adm__form">

                {reviewTab === 'content' && (
                  <>
                    <Row>
                      <Field label="TÍTULO · ES">
                        <input value={review.titleEs} onChange={(e) => updateReview('titleEs', e.target.value)} />
                      </Field>
                      <Field label="TÍTULO · EN">
                        <input value={review.titleEn} onChange={(e) => updateReview('titleEn', e.target.value)} />
                      </Field>
                    </Row>
                    <Row>
                      <Field label="TEASER · ES">
                        <textarea value={review.teaserEs} onChange={(e) => updateReview('teaserEs', e.target.value)} style={{ minHeight: 80 }} />
                      </Field>
                      <Field label="TEASER · EN">
                        <textarea value={review.teaserEn} onChange={(e) => updateReview('teaserEn', e.target.value)} style={{ minHeight: 80 }} />
                      </Field>
                    </Row>
                    <p style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>PIA — Problema / Acción / Impacto</p>
                    <Row>
                      <Field label="PROBLEMA · ES"><textarea value={review.problemEs} onChange={(e) => updateReview('problemEs', e.target.value)} /></Field>
                      <Field label="PROBLEMA · EN"><textarea value={review.problemEn} onChange={(e) => updateReview('problemEn', e.target.value)} /></Field>
                    </Row>
                    <Row>
                      <Field label="ACCIÓN · ES"><textarea value={review.actionEs} onChange={(e) => updateReview('actionEs', e.target.value)} /></Field>
                      <Field label="ACCIÓN · EN"><textarea value={review.actionEn} onChange={(e) => updateReview('actionEn', e.target.value)} /></Field>
                    </Row>
                    <Row>
                      <Field label="IMPACTO · ES"><textarea value={review.impactEs} onChange={(e) => updateReview('impactEs', e.target.value)} /></Field>
                      <Field label="IMPACTO · EN"><textarea value={review.impactEn} onChange={(e) => updateReview('impactEn', e.target.value)} /></Field>
                    </Row>
                  </>
                )}

                {reviewTab === 'kpis' && (
                  <>
                    <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Hasta 4 KPIs. Los marcados con * son estimaciones de la IA — verifica los números.</p>
                    {review.kpis.map((k, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <input value={k.value} onChange={(e) => setKpi(i, 'value', e.target.value)} placeholder="Valor" style={{ width: 90, flexShrink: 0 }} />
                        <input value={k.labelEs} onChange={(e) => setKpi(i, 'labelEs', e.target.value)} placeholder="Etiqueta ES" />
                        <input value={k.labelEn} onChange={(e) => setKpi(i, 'labelEn', e.target.value)} placeholder="Label EN" />
                        <button className="icon-btn" onClick={() => setReview((r) => r ? { ...r, kpis: r.kpis.filter((_, idx) => idx !== i) } : r)} title="Eliminar">✕</button>
                      </div>
                    ))}
                    {review.kpis.length < 4 && (
                      <button className="btn btn--ghost" onClick={() => setReview((r) => r ? { ...r, kpis: [...r.kpis, { value: '', labelEs: '', labelEn: '' }] } : r)}>
                        + Añadir KPI
                      </button>
                    )}
                  </>
                )}

                {reviewTab === 'meta' && (
                  <>
                    <Row>
                      <Field label="CATEGORÍA · ES">
                        <input value={review.categoryEs} onChange={(e) => updateReview('categoryEs', e.target.value)} />
                      </Field>
                      <Field label="CATEGORÍA · EN">
                        <input value={review.categoryEn} onChange={(e) => updateReview('categoryEn', e.target.value)} />
                      </Field>
                    </Row>
                    <Row>
                      <Field label="AÑO">
                        <input value={review.year} onChange={(e) => updateReview('year', e.target.value)} />
                      </Field>
                      <Field label="TIPO DE IMPACTO">
                        <select value={review.impactType} onChange={(e) => updateReview('impactType', e.target.value as ImpactType)}>
                          {(['product', 'seo', 'data', 'ux', 'performance', 'content'] as ImpactType[]).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </Field>
                    </Row>
                    <Field label="TAGS (separados por coma)">
                      <input value={review.tags} onChange={(e) => updateReview('tags', e.target.value)} />
                    </Field>
                  </>
                )}

              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn--accent"
              onClick={() => void handleSave(false)}
              disabled={step === 'saving'}
            >
              {step === 'saving' ? 'Guardando…' : 'Guardar como borrador'}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => void handleSave(true)}
              disabled={step === 'saving'}
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              Guardar y publicar
            </button>
            <button className="btn btn--ghost" onClick={() => setStep('input')} disabled={step === 'saving'}>
              ← Volver a editar
            </button>
          </div>
        </>
      )}
    </>
  );
}
