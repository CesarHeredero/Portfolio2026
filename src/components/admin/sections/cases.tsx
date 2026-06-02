'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdmIcon } from '../icons';
import { CASES, type Locale } from '@/lib/content';

type Status = 'published' | 'draft';
type Filter = 'all' | Status;

type CaseWithStatus = typeof CASES[number] & { status: Status; order: number };

export function CasesSection() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/status');
      const data = await res.json() as Record<string, Status>;
      setStatuses(data);
    } catch {
      // defaults to published for all
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStatuses(); }, [loadStatuses]);

  const items: CaseWithStatus[] = CASES.map((c, i) => ({
    ...c,
    status: statuses[c.id] ?? 'published',
    order: i + 1,
  }));

  const shown = filter === 'all' ? items : items.filter((c) => c.status === filter);
  const counts = {
    all: items.length,
    published: items.filter((c) => c.status === 'published').length,
    draft: items.filter((c) => c.status === 'draft').length,
  };

  async function toggleStatus(id: string, current: Status) {
    const next: Status = current === 'published' ? 'draft' : 'published';
    setSaving(id);
    try {
      const res = await fetch('/api/admin/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) {
        setStatuses((prev) => ({ ...prev, [id]: next }));
      }
    } finally {
      setSaving(null);
    }
  }

  if (editingId) {
    return <CaseEditor id={editingId} status={statuses[editingId] ?? 'published'} onBack={() => setEditingId(null)} onStatusChange={(id, s) => setStatuses(prev => ({ ...prev, [id]: s }))} />;
  }

  return (
    <div className="adm__panel">
      <div className="adm__panel-head">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="adm__panel-title">{items.length} casos</span>
          <div className="seg" style={{ marginLeft: 8 }}>
            <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>TODOS · {counts.all}</button>
            <button aria-pressed={filter === 'published'} onClick={() => setFilter('published')}>PUBLICADOS · {counts.published}</button>
            <button aria-pressed={filter === 'draft'} onClick={() => setFilter('draft')}>BORRADOR · {counts.draft}</button>
          </div>
        </div>
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
              <th style={{ width: 80 }} aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id}>
                <td className="num" style={{ color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{String(c.order).padStart(2, '0')}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.title.es}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{c.id}</div>
                </td>
                <td style={{ color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em' }}>{c.category.es}</td>
                <td className="num">{c.year}</td>
                <td>
                  <button
                    className={`adm-status adm-status--${c.status}`}
                    onClick={() => void toggleStatus(c.id, c.status)}
                    disabled={saving === c.id}
                    style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                    title={c.status === 'published' ? 'Clic para despublicar' : 'Clic para publicar'}
                  >
                    {saving === c.id ? '…' : c.status === 'published' ? 'PUBLICADO' : 'BORRADOR'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="icon-btn" onClick={() => setEditingId(c.id)} title="Editar"><AdmIcon.edit /></button>
                    <a className="icon-btn" href={`/es/trabajo/${c.slug}`} target="_blank" rel="noreferrer" title="Ver"><AdmIcon.eye /></a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CaseEditor({ id, status, onBack, onStatusChange }: { id: string; status: Status; onBack: () => void; onStatusChange: (id: string, s: Status) => void }) {
  const c = CASES.find((x) => x.id === id) ?? CASES[0];
  const [tab, setTab] = useState<'content' | 'kpis' | 'meta'>('content');
  const [saving, setSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status>(status);
  const l: Locale = 'es';

  async function handleStatusChange(next: Status) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, status: next }),
      });
      if (res.ok) {
        setCurrentStatus(next);
        onStatusChange(c.id, next);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" onClick={onBack}>← Volver a casos</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`adm-status adm-status--${currentStatus}`}>
            {currentStatus === 'published' ? 'PUBLICADO' : 'BORRADOR'}
          </span>
          {currentStatus === 'published' ? (
            <button className="btn btn--ghost" onClick={() => void handleStatusChange('draft')} disabled={saving}>
              Despublicar
            </button>
          ) : (
            <button className="btn btn--accent" onClick={() => void handleStatusChange('published')} disabled={saving}>
              {saving ? 'Guardando…' : 'Publicar'}
            </button>
          )}
        </div>
      </div>

      <div className="adm__tabs">
        {(['content', 'kpis', 'meta'] as const).map((t) => (
          <button key={t} className={`adm__tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t === 'content' ? 'Contenido' : t === 'kpis' ? 'KPIs' : 'Metadata'}
          </button>
        ))}
      </div>

      <div className="adm__panel">
        <div className="adm__panel-body">
          {tab === 'content' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>SLUG</label>
                <input value={c.slug} readOnly />
                <div className="adm__field-hint">URL: cesarheredero.com/trabajo/{c.slug}</div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>CATEGORÍA · ES</label>
                  <input defaultValue={c.category.es} readOnly />
                </div>
                <div className="adm__field">
                  <label>AÑO</label>
                  <input defaultValue={c.year} readOnly />
                </div>
              </div>
              <div className="adm__field">
                <label>TÍTULO · ES</label>
                <input defaultValue={c.title.es} readOnly />
              </div>
              <div className="adm__field">
                <label>TEASER · ES</label>
                <textarea defaultValue={c.teaser[l]} readOnly />
              </div>
              <div className="adm__field">
                <label>TAGS (separados por coma)</label>
                <input defaultValue={c.tags.join(', ')} readOnly />
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                Los campos de contenido se editan directamente en el repositorio (content.ts). La función de edición in-line está en desarrollo.
              </p>
            </div>
          )}

          {tab === 'kpis' && (
            <div className="adm__form">
              <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Hasta 4 KPIs por caso. Se muestran en la tarjeta y en el detalle.</p>
              <div className="adm__kpi-list">
                {c.kpis.map((k, i) => (
                  <div key={i} className="adm__kpi-row">
                    <input defaultValue={k.value} readOnly placeholder="Valor" />
                    <input defaultValue={k.label.es} readOnly placeholder="Etiqueta ES" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'meta' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>ESTADO</label>
                <select
                  value={currentStatus}
                  onChange={(e) => void handleStatusChange(e.target.value as Status)}
                  disabled={saving}
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>
              <div className="adm__field">
                <label>META TITLE</label>
                <input defaultValue={c.title.es} readOnly />
              </div>
              <div className="adm__field">
                <label>META DESCRIPTION</label>
                <textarea defaultValue={c.teaser.es} readOnly />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
