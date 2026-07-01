'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdmIcon } from '../icons';
import type { Case, ImpactType, KPI } from '@/lib/content';
import { CaseWizard } from './case-wizard';

type Status = 'published' | 'draft';
type Filter = 'all' | Status;

const IMPACT_TYPES: ImpactType[] = ['content', 'data', 'seo', 'ux', 'product', 'performance'];

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

type EditState = {
  slug: string;
  categoryEs: string;
  categoryEn: string;
  year: string;
  titleEs: string;
  titleEn: string;
  teaserEs: string;
  teaserEn: string;
  tags: string;
  impactType: ImpactType;
  featured: boolean;
  status: Status;
  piaProblem: string;
  piaAction: string;
  piaImpact: string;
  piaProblemEn: string;
  piaActionEn: string;
  piaImpactEn: string;
  kpis: { value: string; labelEs: string; labelEn: string }[];
  coverImage: string;
  images: string[];
  analysisDoc: string;
};

type AiEditResult = {
  titleEs: string; titleEn: string;
  teaserEs: string; teaserEn: string;
  categoryEs: string; categoryEn: string;
  year: string; tags: string[]; impactType: string;
  piaProblem: string; piaAction: string; piaImpact: string;
  piaProblemEn: string; piaActionEn: string; piaImpactEn: string;
  kpis: { value: string; labelEs: string; labelEn: string }[];
};

function seedState(c: Case): EditState {
  return {
    slug: c.slug,
    categoryEs: c.category.es,
    categoryEn: c.category.en,
    year: c.year,
    titleEs: c.title.es,
    titleEn: c.title.en,
    teaserEs: c.teaser.es,
    teaserEn: c.teaser.en,
    tags: c.tags.join(', '),
    impactType: c.impactType,
    featured: c.featured ?? false,
    status: c.status ?? 'published',
    piaProblem: c.pia?.es.problem ?? '',
    piaAction: c.pia?.es.action ?? '',
    piaImpact: c.pia?.es.impact ?? '',
    piaProblemEn: c.pia?.en.problem ?? '',
    piaActionEn: c.pia?.en.action ?? '',
    piaImpactEn: c.pia?.en.impact ?? '',
    kpis: c.kpis.map((k) => ({ value: k.value, labelEs: k.label.es, labelEn: k.label.en })),
    coverImage: c.coverImage ?? '',
    images: c.images ?? [],
    analysisDoc: c.analysisDoc ?? '',
  };
}

function CaseEditor({ case_, onBack, onSaved }: { case_: Case; onBack: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<'content' | 'kpis' | 'meta' | 'images' | 'analysis'>('content');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState<EditState>(() => seedState(case_));
  const [status, setStatus] = useState<Status>(case_.status ?? 'published');
  const [instruction, setInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [imageUploading, setImageUploading] = useState<string | null>(null);
  const [analysisEs, setAnalysisEs] = useState('');
  const [analysisEn, setAnalysisEn] = useState('');
  const [contentLoaded, setContentLoaded] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  useEffect(() => {
    if (tab === 'analysis' && !contentLoaded) {
      void fetch(`/api/admin/cases/content?slug=${case_.slug}`)
        .then((r) => r.json() as Promise<{ es: string; en: string }>)
        .then((data) => {
          setAnalysisEs(data.es);
          setAnalysisEn(data.en);
          setContentLoaded(true);
        });
    }
  }, [tab, contentLoaded, case_.slug]);

  function update<K extends keyof EditState>(key: K, value: EditState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setSuccess(false);
    setError('');
  }

  function buildCase(s: EditState = state): Case {
    const kpis: KPI[] = s.kpis
      .filter((k) => k.value.trim() || k.labelEs.trim())
      .map((k) => ({
        value: k.value,
        label: { es: k.labelEs, en: k.labelEn || k.labelEs },
      }));
    return {
      ...case_,
      slug: s.slug,
      category: { es: s.categoryEs, en: s.categoryEn || s.categoryEs },
      year: s.year,
      title: { es: s.titleEs, en: s.titleEn || s.titleEs },
      teaser: { es: s.teaserEs, en: s.teaserEn || s.teaserEs },
      tags: s.tags.split(',').map((t) => t.trim()).filter(Boolean),
      impactType: s.impactType,
      featured: s.featured,
      status,
      kpis,
      pia: {
        es: { problem: s.piaProblem, action: s.piaAction, impact: s.piaImpact },
        en: {
          problem: s.piaProblemEn || s.piaProblem,
          action: s.piaActionEn || s.piaAction,
          impact: s.piaImpactEn || s.piaImpact,
        },
      },
      coverImage: s.coverImage || undefined,
      images: s.images.length > 0 ? s.images : undefined,
      analysisDoc: s.analysisDoc || undefined,
    };
  }

  async function autoSave(newState: EditState) {
    await fetch('/api/admin/cases', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildCase(newState)),
    });
    onSaved();
  }

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
        const ns = { ...state, coverImage: url };
        setState(ns);
        await autoSave(ns);
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
        const ns = { ...state, images: [...state.images, ...urls] };
        setState(ns);
        await autoSave(ns);
      }
    } catch { /* ignored */ } finally {
      setImageUploading(null);
    }
  }

  function removeImage(idx: number) {
    const ns = { ...state, images: state.images.filter((_, i) => i !== idx) };
    setState(ns);
    void autoSave(ns);
  }

  function removeCover() {
    const ns = { ...state, coverImage: '' };
    setState(ns);
    void autoSave(ns);
  }

  async function handlePdfUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setPdfUploading(true);
    try {
      const url = await uploadFile(files[0], 'doc');
      if (url) {
        const ns = { ...state, analysisDoc: url };
        setState(ns);
        await autoSave(ns);
      }
    } catch { /* ignored */ } finally {
      setPdfUploading(false);
    }
  }

  function removePdf() {
    const ns = { ...state, analysisDoc: '' };
    setState(ns);
    void autoSave(ns);
  }

  async function saveContent() {
    setContentSaving(true);
    try {
      await fetch('/api/admin/cases/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: case_.slug, es: analysisEs, en: analysisEn }),
      });
    } finally {
      setContentSaving(false);
    }
  }

  async function applyInstruction() {
    if (!instruction.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/admin/ai/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'edit',
          currentCase: {
            titleEs: state.titleEs, titleEn: state.titleEn,
            teaserEs: state.teaserEs, teaserEn: state.teaserEn,
            categoryEs: state.categoryEs, categoryEn: state.categoryEn,
            year: state.year,
            tags: state.tags.split(',').map((t) => t.trim()).filter(Boolean),
            impactType: state.impactType,
            piaProblem: state.piaProblem, piaAction: state.piaAction, piaImpact: state.piaImpact,
            piaProblemEn: state.piaProblemEn, piaActionEn: state.piaActionEn, piaImpactEn: state.piaImpactEn,
            kpis: state.kpis,
          },
          instruction: instruction.trim(),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { updated: AiEditResult };
        const u = data.updated;
        setState((s) => ({
          ...s,
          titleEs: u.titleEs ?? s.titleEs,
          titleEn: u.titleEn ?? s.titleEn,
          teaserEs: u.teaserEs ?? s.teaserEs,
          teaserEn: u.teaserEn ?? s.teaserEn,
          categoryEs: u.categoryEs ?? s.categoryEs,
          categoryEn: u.categoryEn ?? s.categoryEn,
          year: u.year ?? s.year,
          tags: u.tags ? u.tags.join(', ') : s.tags,
          impactType: (IMPACT_TYPES as readonly string[]).includes(u.impactType)
            ? (u.impactType as ImpactType)
            : s.impactType,
          piaProblem: u.piaProblem ?? s.piaProblem,
          piaAction: u.piaAction ?? s.piaAction,
          piaImpact: u.piaImpact ?? s.piaImpact,
          piaProblemEn: u.piaProblemEn ?? s.piaProblemEn,
          piaActionEn: u.piaActionEn ?? s.piaActionEn,
          piaImpactEn: u.piaImpactEn ?? s.piaImpactEn,
          kpis: u.kpis ?? s.kpis,
        }));
        setInstruction('');
        setSuccess(false);
      } else {
        const errBody = (await res.json()) as { error?: string };
        setAiError(errBody.error ?? `Error ${res.status}`);
      }
    } catch {
      setAiError('Sin conexión. Comprueba la red e inténtalo de nuevo.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const res = await fetch('/api/admin/cases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCase()),
      });
      if (res.ok) {
        setSuccess(true);
        onSaved();
      } else {
        const body = await res.json() as { error?: string };
        setError(res.status === 401 ? 'Sesión expirada — vuelve a entrar' : (body.error ?? `Error ${res.status}`));
      }
    } catch {
      setError('Sin conexión. Comprueba la red e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(next: Status) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: case_.id, status: next }),
      });
      if (res.ok) {
        setStatus(next);
        onSaved();
      } else {
        const body = await res.json() as { error?: string };
        setError(res.status === 401 ? 'Sesión expirada — vuelve a entrar' : (body.error ?? `Error ${res.status}`));
      }
    } catch {
      setError('Sin conexión.');
    } finally {
      setSaving(false);
    }
  }

  function setKpi(i: number, field: 'value' | 'labelEs' | 'labelEn', value: string) {
    setState((s) => ({
      ...s,
      kpis: s.kpis.map((k, idx) => (idx === i ? { ...k, [field]: value } : k)),
    }));
    setSuccess(false);
  }

  function addKpi() {
    if (state.kpis.length >= 4) return;
    update('kpis', [...state.kpis, { value: '', labelEs: '', labelEn: '' }]);
  }

  function removeKpi(i: number) {
    update('kpis', state.kpis.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" onClick={onBack}>← Volver a casos</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`adm-status adm-status--${status}`}>
            {status === 'published' ? 'PUBLICADO' : 'BORRADOR'}
          </span>
          {status === 'published' ? (
            <button className="btn btn--ghost" onClick={() => void handleStatusChange('draft')} disabled={saving}>
              Despublicar
            </button>
          ) : (
            <button className="btn btn--accent" onClick={() => void handleStatusChange('published')} disabled={saving}>
              Publicar
            </button>
          )}
        </div>
      </div>

      <div className="adm__panel" style={{ marginBottom: 16 }}>
        <div className="adm__panel-body">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
            ✨ Editar con IA
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 10 }}>
            Dile qué cambiar: &quot;cambia el título por…&quot;, &quot;añade un KPI de satisfacción al 92%&quot;, &quot;quita el tag Mobile App&quot;, &quot;actualiza el impacto con estos datos…&quot;
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void applyInstruction(); }}
              placeholder="Escribe aquí tu instrucción para la IA…"
              style={{ flex: 1, minHeight: 72, resize: 'vertical' }}
              disabled={aiLoading}
            />
            <button
              className="btn btn--accent"
              onClick={() => void applyInstruction()}
              disabled={aiLoading || !instruction.trim()}
              style={{ minWidth: 150, whiteSpace: 'nowrap', alignSelf: 'flex-end' }}
            >
              {aiLoading ? 'Aplicando…' : '✨ Aplicar cambio'}
            </button>
          </div>
          {aiError && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--bad)' }}>⚠ {aiError}</div>
          )}
        </div>
      </div>

      <div className="adm__tabs">
        {(['content', 'kpis', 'meta', 'images', 'analysis'] as const).map((tk) => (
          <button key={tk} className={`adm__tab ${tab === tk ? 'on' : ''}`} onClick={() => setTab(tk)}>
            {tk === 'content' ? 'Contenido'
              : tk === 'kpis' ? 'KPIs'
              : tk === 'meta' ? 'Metadata'
              : tk === 'images' ? 'Imágenes'
              : 'Análisis'}
          </button>
        ))}
      </div>

      <div className="adm__panel">
        <div className="adm__panel-body">
          {tab === 'content' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>SLUG</label>
                <input value={state.slug} onChange={(e) => update('slug', e.target.value)} readOnly />
                <div className="adm__field-hint">URL: cesarheredero.com/trabajo/{state.slug}</div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>TÍTULO · ES</label>
                  <input value={state.titleEs} onChange={(e) => update('titleEs', e.target.value)} />
                </div>
                <div className="adm__field">
                  <label>TÍTULO · EN</label>
                  <input value={state.titleEn} onChange={(e) => update('titleEn', e.target.value)} />
                </div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>TEASER · ES</label>
                  <textarea value={state.teaserEs} onChange={(e) => update('teaserEs', e.target.value)} />
                </div>
                <div className="adm__field">
                  <label>TEASER · EN</label>
                  <textarea value={state.teaserEn} onChange={(e) => update('teaserEn', e.target.value)} />
                </div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>CATEGORÍA · ES</label>
                  <input value={state.categoryEs} onChange={(e) => update('categoryEs', e.target.value)} />
                </div>
                <div className="adm__field">
                  <label>CATEGORÍA · EN</label>
                  <input value={state.categoryEn} onChange={(e) => update('categoryEn', e.target.value)} />
                </div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>AÑO</label>
                  <input value={state.year} onChange={(e) => update('year', e.target.value)} />
                </div>
                <div className="adm__field">
                  <label>TAGS (separados por coma)</label>
                  <input value={state.tags} onChange={(e) => update('tags', e.target.value)} />
                </div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>PIA · PROBLEMA (ES)</label>
                  <textarea value={state.piaProblem} onChange={(e) => update('piaProblem', e.target.value)} />
                </div>
                <div className="adm__field">
                  <label>PIA · PROBLEMA (EN)</label>
                  <textarea value={state.piaProblemEn} onChange={(e) => update('piaProblemEn', e.target.value)} />
                </div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>PIA · ACCIÓN (ES)</label>
                  <textarea value={state.piaAction} onChange={(e) => update('piaAction', e.target.value)} />
                </div>
                <div className="adm__field">
                  <label>PIA · ACCIÓN (EN)</label>
                  <textarea value={state.piaActionEn} onChange={(e) => update('piaActionEn', e.target.value)} />
                </div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>PIA · IMPACTO (ES)</label>
                  <textarea value={state.piaImpact} onChange={(e) => update('piaImpact', e.target.value)} />
                </div>
                <div className="adm__field">
                  <label>PIA · IMPACTO (EN)</label>
                  <textarea value={state.piaImpactEn} onChange={(e) => update('piaImpactEn', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'kpis' && (
            <div className="adm__form">
              <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Hasta 4 KPIs por caso. Se muestran en la tarjeta y en el detalle.</p>
              <div className="adm__kpi-list">
                {state.kpis.map((k, i) => (
                  <div key={i} className="adm__kpi-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={k.value} onChange={(e) => setKpi(i, 'value', e.target.value)} placeholder="Valor" style={{ maxWidth: 90 }} />
                    <input value={k.labelEs} onChange={(e) => setKpi(i, 'labelEs', e.target.value)} placeholder="Etiqueta ES" />
                    <input value={k.labelEn} onChange={(e) => setKpi(i, 'labelEn', e.target.value)} placeholder="Etiqueta EN" />
                    <button className="icon-btn" onClick={() => removeKpi(i)} title="Eliminar KPI">✕</button>
                  </div>
                ))}
              </div>
              {state.kpis.length < 4 && (
                <button className="btn btn--ghost" onClick={addKpi}>+ Añadir KPI</button>
              )}
            </div>
          )}

          {tab === 'meta' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>ESTADO</label>
                <select value={status} onChange={(e) => void handleStatusChange(e.target.value as Status)} disabled={saving}>
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>
              <div className="adm__field">
                <label>TIPO DE IMPACTO</label>
                <select value={state.impactType} onChange={(e) => update('impactType', e.target.value as ImpactType)}>
                  {IMPACT_TYPES.map((it) => (
                    <option key={it} value={it}>{it}</option>
                  ))}
                </select>
              </div>
              <div className="adm__field">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={state.featured} onChange={(e) => update('featured', e.target.checked)} style={{ width: 'auto' }} />
                  Destacado (featured)
                </label>
              </div>
            </div>
          )}

          {tab === 'images' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>IMAGEN DE PORTADA</label>
                {state.coverImage ? (
                  <div style={{ marginBottom: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={state.coverImage} alt="Portada" style={{ maxWidth: 320, maxHeight: 200, objectFit: 'cover', borderRadius: 4, display: 'block', marginBottom: 6 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <label className="btn btn--ghost" style={{ cursor: 'pointer' }}>
                        Cambiar
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void handleCoverUpload(e.target.files)} disabled={!!imageUploading} />
                      </label>
                      <button className="btn btn--ghost" onClick={removeCover} disabled={!!imageUploading}>Quitar portada</button>
                    </div>
                  </div>
                ) : (
                  <label className="btn btn--ghost" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    {imageUploading === 'cover' ? 'Subiendo…' : '+ Subir portada'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void handleCoverUpload(e.target.files)} disabled={!!imageUploading} />
                  </label>
                )}
              </div>

              <div className="adm__field">
                <label>GALERÍA DE IMÁGENES</label>
                {state.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 10 }}>
                    {state.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Imagen ${i + 1}`} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                        <button
                          onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, lineHeight: '22px', textAlign: 'center', padding: 0 }}
                          title="Quitar imagen"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="btn btn--ghost" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  {imageUploading === 'gallery' ? 'Subiendo…' : '+ Añadir imágenes'}
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => void handleGalleryUpload(e.target.files)} disabled={!!imageUploading} />
                </label>
                <div className="adm__field-hint">Puedes seleccionar varias a la vez. JPG, PNG o WebP, máx 10MB por imagen.</div>
              </div>
            </div>
          )}

          {tab === 'analysis' && (
            <div className="adm__form">
              {!contentLoaded ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-400)', fontSize: 13 }}>Cargando contenido…</div>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 12 }}>
                    Contenido largo del caso en Markdown. Se muestra en la página de detalle del proyecto.
                  </p>
                  <div className="adm__field-row">
                    <div className="adm__field">
                      <label>ANÁLISIS · ES (Markdown)</label>
                      <textarea
                        value={analysisEs}
                        onChange={(e) => setAnalysisEs(e.target.value)}
                        style={{ minHeight: 320, fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
                        placeholder="# Contexto&#10;&#10;Describe aquí el caso en detalle…"
                      />
                    </div>
                    <div className="adm__field">
                      <label>ANÁLISIS · EN (Markdown)</label>
                      <textarea
                        value={analysisEn}
                        onChange={(e) => setAnalysisEn(e.target.value)}
                        style={{ minHeight: 320, fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
                        placeholder="# Context&#10;&#10;Describe the case in detail here…"
                      />
                    </div>
                  </div>
                  <button className="btn btn--accent" onClick={() => void saveContent()} disabled={contentSaving}>
                    {contentSaving ? 'Guardando…' : 'Guardar análisis'}
                  </button>
                </>
              )}

              <div className="adm__field" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--ink-200)' }}>
                <label>DOCUMENTO PDF</label>
                {state.analysisDoc ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <a href={state.analysisDoc} target="_blank" rel="noreferrer" className="btn btn--ghost">Ver PDF</a>
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
                <div className="adm__field-hint">Máx 20MB. Se almacena como documento descargable del caso.</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn--accent" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {success && (
              <span style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                ✓ Guardado · los cambios aparecen en el portfolio en unos segundos
              </span>
            )}
            {error && <span style={{ fontSize: 12, color: 'var(--bad)' }}>⚠ {error}</span>}
          </div>
        </div>
      </div>
    </>
  );
}
