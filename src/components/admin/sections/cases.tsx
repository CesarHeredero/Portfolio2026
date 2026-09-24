'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdmIcon } from '../icons';
import type { Case, ImpactType, KPI, CaseLink } from '@/lib/content';
import { CaseWizard } from './case-wizard';

type Status = 'published' | 'draft';
type Filter = 'all' | Status;

// ── Shared ────────────────────────────────────────────────────────────────────

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

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function caseToFullData(c: Case, analysisEs: string, analysisEn: string): FullCaseData {
  return {
    titleEs: c.title.es,
    titleEn: c.title.en,
    teaserEs: c.teaser.es,
    teaserEn: c.teaser.en,
    categoryEs: c.category.es,
    categoryEn: c.category.en,
    year: c.year,
    tags: c.tags,
    impactType: c.impactType,
    piaProblem: c.pia?.es.problem ?? '',
    piaAction: c.pia?.es.action ?? '',
    piaImpact: c.pia?.es.impact ?? '',
    piaProblemEn: c.pia?.en.problem ?? '',
    piaActionEn: c.pia?.en.action ?? '',
    piaImpactEn: c.pia?.en.impact ?? '',
    kpis: c.kpis.map((k) => ({ value: k.value, labelEs: k.label.es, labelEn: k.label.en })),
    links: c.links ?? [],
    analysisEs,
    analysisEn,
  };
}

function fullDataToCase(base: Case, fd: FullCaseData, status: Status): Case {
  const kpis: KPI[] = fd.kpis
    .filter((k) => k.value.trim())
    .map((k) => ({ value: k.value, label: { es: k.labelEs, en: k.labelEn || k.labelEs } }));
  return {
    ...base,
    title: { es: fd.titleEs, en: fd.titleEn || fd.titleEs },
    teaser: { es: fd.teaserEs, en: fd.teaserEn || fd.teaserEs },
    category: { es: fd.categoryEs, en: fd.categoryEn || fd.categoryEs },
    year: fd.year,
    tags: fd.tags,
    impactType: fd.impactType,
    status,
    kpis,
    pia: {
      es: { problem: fd.piaProblem, action: fd.piaAction, impact: fd.piaImpact },
      en: {
        problem: fd.piaProblemEn || fd.piaProblem,
        action: fd.piaActionEn || fd.piaAction,
        impact: fd.piaImpactEn || fd.piaImpact,
      },
    },
    links: fd.links.length > 0 ? fd.links : undefined,
  };
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

// ── PlatformIcon & CasePreview ────────────────────────────────────────────────

function PlatformIcon({ platform }: { platform?: string }) {
  if (platform === 'ios') return <span title="iOS">🍎</span>;
  if (platform === 'android') return <span title="Android">🤖</span>;
  if (platform === 'github') return <span title="GitHub">⌨️</span>;
  if (platform === 'web') return <span title="Web">🌐</span>;
  return <span>🔗</span>;
}

function CasePreview({ c, locale }: { c: FullCaseData; locale: 'es' | 'en' }) {
  const title    = locale === 'es' ? c.titleEs    : c.titleEn;
  const teaser   = locale === 'es' ? c.teaserEs   : c.teaserEn;
  const category = locale === 'es' ? c.categoryEs : c.categoryEn;
  const problem  = locale === 'es' ? c.piaProblem  : c.piaProblemEn;
  const action   = locale === 'es' ? c.piaAction   : c.piaActionEn;
  const impact   = locale === 'es' ? c.piaImpact   : c.piaImpactEn;
  const analysis = locale === 'es' ? c.analysisEs  : c.analysisEn;

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
          <p style={{ fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Análisis</p>
          <pre style={{ fontSize: 11, color: 'var(--ink-500)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', maxHeight: 200, overflow: 'auto', lineHeight: 1.6 }}>
            {analysis.slice(0, 600)}{analysis.length > 600 ? '…' : ''}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {c.tags.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    </div>
  );
}

// ── CasesSection ───────────────────────────────────────────────────────────────

export function CasesSection() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cases');
      const data = (await res.json()) as Case[];
      setCases(data);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  const shown =
    filter === 'all'
      ? cases
      : cases.filter((c) => (c.status ?? 'published') === filter);
  const counts = {
    all: cases.length,
    published: cases.filter((c) => (c.status ?? 'published') === 'published').length,
    draft: cases.filter((c) => (c.status ?? 'published') === 'draft').length,
  };

  async function toggleStatus(id: string, current: Status) {
    const next: Status = current === 'published' ? 'draft' : 'published';
    setSaving(id);
    try {
      const res = await fetch('/api/admin/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) {
        setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
      }
    } finally {
      setSaving(null);
    }
  }

  async function deleteCase(id: string, title: string) {
    if (!window.confirm(`¿Eliminar el caso "${title}"? Esta acción no se puede deshacer.`)) return;
    setSaving(id);
    try {
      const res = await fetch('/api/admin/cases', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCases((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setSaving(null);
    }
  }

  if (showWizard) {
    return (
      <CaseWizard
        onBack={() => setShowWizard(false)}
        onCreated={(id) => {
          void loadCases();
          setShowWizard(false);
          setEditingId(id);
        }}
      />
    );
  }

  if (editingId) {
    const editing = cases.find((c) => c.id === editingId);
    if (editing) {
      return (
        <CaseEditor
          case_={editing}
          onBack={() => setEditingId(null)}
          onSaved={() => void loadCases()}
        />
      );
    }
    setEditingId(null);
  }

  return (
    <div className="adm__panel">
      <div className="adm__panel-head">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="adm__panel-title">{cases.length} casos</span>
          <div className="seg" style={{ marginLeft: 8 }}>
            <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>TODOS · {counts.all}</button>
            <button aria-pressed={filter === 'published'} onClick={() => setFilter('published')}>PUBLICADOS · {counts.published}</button>
            <button aria-pressed={filter === 'draft'} onClick={() => setFilter('draft')}>BORRADOR · {counts.draft}</button>
          </div>
        </div>
        <button className="btn btn--accent" onClick={() => setShowWizard(true)}>
          ✨ Nuevo caso
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-400)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          Cargando…
        </div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Caso</th>
              <th style={{ width: 160 }}>Categoría</th>
              <th style={{ width: 70 }}>Año</th>
              <th style={{ width: 140 }}>Estado</th>
              <th style={{ width: 110 }} aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c, i) => {
              const status: Status = c.status ?? 'published';
              return (
                <tr key={c.id}>
                  <td className="num" style={{ color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.title.es}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{c.id}</div>
                  </td>
                  <td style={{ color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em' }}>{c.category.es}</td>
                  <td className="num">{c.year}</td>
                  <td>
                    <button
                      className={`adm-status adm-status--${status}`}
                      onClick={() => void toggleStatus(c.id, status)}
                      disabled={saving === c.id}
                      style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                      title={status === 'published' ? 'Clic para despublicar' : 'Clic para publicar'}
                    >
                      {saving === c.id ? '…' : status === 'published' ? 'PUBLICADO' : 'BORRADOR'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button className="icon-btn" onClick={() => setEditingId(c.id)} title="Editar"><AdmIcon.edit /></button>
                      <a className="icon-btn" href={`/es/trabajo/${c.slug}`} target="_blank" rel="noreferrer" title="Ver"><AdmIcon.eye /></a>
                      <button className="icon-btn" onClick={() => void deleteCase(c.id, c.title.es)} title="Eliminar" disabled={saving === c.id}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── CaseEditor ─────────────────────────────────────────────────────────────────

function CaseEditor({ case_, onBack, onSaved }: { case_: Case; onBack: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(true);
  const [fullCase, setFullCase] = useState<FullCaseData | null>(null);
  const [status, setStatus] = useState<Status>(case_.status ?? 'published');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState<string | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [coverImage, setCoverImage] = useState(case_.coverImage ?? '');
  const [images, setImages] = useState<string[]>(case_.images ?? []);
  const [analysisDoc, setAnalysisDoc] = useState(case_.analysisDoc ?? '');
  const [previewLang, setPreviewLang] = useState<'es' | 'en'>('es');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load MDX content on mount
  useEffect(() => {
    void fetch(`/api/admin/cases/content?slug=${case_.slug}`)
      .then((r) => r.json() as Promise<{ es: string; en: string }>)
      .then((data) => {
        const fd = caseToFullData(case_, data.es ?? '', data.en ?? '');
        setFullCase(fd);
        setMessages([{
          role: 'assistant',
          content: `Editando **"${fd.titleEs}"**. Puedes pedirme cambios: "actualiza el teaser", "añade un KPI de X", "el análisis es muy técnico, simplifícalo", "cambia la categoría a…"`,
        }]);
        setLoading(false);
      })
      .catch(() => {
        const fd = caseToFullData(case_, '', '');
        setFullCase(fd);
        setMessages([{
          role: 'assistant',
          content: `Editando **"${case_.title.es}"**. Puedes pedirme cambios en el caso.`,
        }]);
        setLoading(false);
      });
  }, [case_]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function autoSave(fd: FullCaseData) {
    setSaving(true);
    try {
      const updated = fullDataToCase(
        { ...case_, coverImage: coverImage || undefined, images: images.length > 0 ? images : undefined, analysisDoc: analysisDoc || undefined },
        fd,
        status,
      );
      await fetch('/api/admin/cases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (fd.analysisEs || fd.analysisEn) {
        await fetch('/api/admin/cases/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: case_.slug, es: fd.analysisEs, en: fd.analysisEn }),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

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
        void autoSave(data.updated);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sin conexión. Comprueba la red.' }]);
    } finally {
      setIsRefining(false);
    }
  }

  async function handleStatusChange(next: Status) {
    setStatusSaving(true);
    try {
      const res = await fetch('/api/admin/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: case_.id, status: next }),
      });
      if (res.ok) {
        setStatus(next);
        onSaved();
      }
    } finally {
      setStatusSaving(false);
    }
  }

  // ── Image upload helpers ──────────────────────────────────────────────────

  async function uploadFile(file: File, type: 'cover' | 'image' | 'doc'): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slug', case_.slug);
    fd.append('type', type);
    const res = await fetch('/api/admin/cases/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json() as { error?: string };
      throw new Error(body.error ?? `Error ${res.status}`);
    }
    const { url } = await res.json() as { url: string };
    return url;
  }

  async function handleCoverUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setImageUploading('cover');
    try {
      const url = await uploadFile(files[0], 'cover');
      if (url) {
        setCoverImage(url);
        if (fullCase) await autoSave(fullCase);
      }
    } catch { /* ignored */ } finally {
      setImageUploading(null);
    }
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImageUploading('gallery');
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, 'image');
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        setImages((prev) => {
          const next = [...prev, ...urls];
          if (fullCase) void autoSave(fullCase);
          return next;
        });
      }
    } catch { /* ignored */ } finally {
      setImageUploading(null);
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (fullCase) void autoSave(fullCase);
      return next;
    });
  }

  function removeCover() {
    setCoverImage('');
    if (fullCase) void autoSave(fullCase);
  }

  async function handlePdfUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setPdfUploading(true);
    try {
      const url = await uploadFile(files[0], 'doc');
      if (url) {
        setAnalysisDoc(url);
        if (fullCase) await autoSave(fullCase);
      }
    } catch { /* ignored */ } finally {
      setPdfUploading(false);
    }
  }

  function removePdf() {
    setAnalysisDoc('');
    if (fullCase) void autoSave(fullCase);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Top bar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <button className="btn btn--ghost" onClick={onBack}>← Volver a casos</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`adm-status adm-status--${status}`}>
            {status === 'published' ? 'PUBLICADO' : 'BORRADOR'}
          </span>
          {status === 'published' ? (
            <button className="btn btn--ghost" onClick={() => void handleStatusChange('draft')} disabled={statusSaving}>
              Despublicar
            </button>
          ) : (
            <button className="btn btn--accent" onClick={() => void handleStatusChange('published')} disabled={statusSaving}>
              Publicar
            </button>
          )}
          {saving && <span style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>guardando…</span>}
        </div>
      </div>

      {loading ? (
        <div className="adm__panel">
          <div className="adm__panel-body">
            <Spinner label="Cargando caso…" />
          </div>
        </div>
      ) : fullCase ? (
        <div className="wiz__layout">
          {/* Left: Chat */}
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
                placeholder="Pídeme un cambio… (Enter para enviar, Shift+Enter para nueva línea)"
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

            {/* Image upload collapsed section */}
            <details style={{ marginTop: 12, border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
              <summary style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                📷 Imágenes y documentos
              </summary>
              <div style={{ padding: '12px 12px 16px', borderTop: '1px solid var(--line)' }}>
                {/* Cover */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-500)', marginBottom: 8 }}>Imagen de portada</p>
                  {coverImage ? (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage} alt="Portada" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 4, display: 'block', marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <label className="btn btn--ghost" style={{ cursor: 'pointer' }}>
                          Cambiar
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void handleCoverUpload(e.target.files)} disabled={!!imageUploading} />
                        </label>
                        <button className="btn btn--ghost" onClick={removeCover} disabled={!!imageUploading}>Quitar</button>
                      </div>
                    </div>
                  ) : (
                    <label className="btn btn--ghost" style={{ cursor: 'pointer', display: 'inline-block' }}>
                      {imageUploading === 'cover' ? 'Subiendo…' : '+ Subir portada'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void handleCoverUpload(e.target.files)} disabled={!!imageUploading} />
                    </label>
                  )}
                </div>

                {/* Gallery */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-500)', marginBottom: 8 }}>Galería</p>
                  {images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6, marginBottom: 8 }}>
                      {images.map((img, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Imagen ${i + 1}`} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                          <button
                            onClick={() => removeImage(i)}
                            style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, lineHeight: '20px', textAlign: 'center', padding: 0 }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="btn btn--ghost" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    {imageUploading === 'gallery' ? 'Subiendo…' : '+ Añadir imágenes'}
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => void handleGalleryUpload(e.target.files)} disabled={!!imageUploading} />
                  </label>
                </div>

                {/* PDF */}
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-500)', marginBottom: 8 }}>Documento PDF</p>
                  {analysisDoc ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <a href={analysisDoc} target="_blank" rel="noreferrer" className="btn btn--ghost">Ver PDF</a>
                      <label className="btn btn--ghost" style={{ cursor: 'pointer' }}>
                        {pdfUploading ? 'Subiendo…' : 'Cambiar PDF'}
                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => void handlePdfUpload(e.target.files)} disabled={pdfUploading} />
                      </label>
                      <button className="btn btn--ghost" onClick={removePdf} disabled={pdfUploading}>Quitar</button>
                    </div>
                  ) : (
                    <label className="btn btn--ghost" style={{ cursor: 'pointer', display: 'inline-block' }}>
                      {pdfUploading ? 'Subiendo…' : '+ Subir PDF'}
                      <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => void handlePdfUpload(e.target.files)} disabled={pdfUploading} />
                    </label>
                  )}
                </div>
              </div>
            </details>
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
      ) : null}
    </>
  );
}
