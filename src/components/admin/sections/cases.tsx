'use client';

import { useState } from 'react';
import { AdmIcon } from '../icons';
import { CASES, type Locale } from '@/lib/content';

type Status = 'published' | 'draft';
type Filter = 'all' | Status;

const VIEWS = [1248, 982, 314, 754, 282, 612, 421, 0];

export function CasesSection() {
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = CASES.map((c, i) => ({
    ...c,
    status: (i === 7 ? 'draft' : 'published') as Status,
    order: i + 1,
    views: VIEWS[i] ?? 0,
  }));

  const shown = filter === 'all' ? items : items.filter((c) => c.status === filter);
  const counts = {
    all: items.length,
    published: items.filter((c) => c.status === 'published').length,
    draft: items.filter((c) => c.status === 'draft').length,
  };

  if (editingId) {
    return <CaseEditor id={editingId} onBack={() => setEditingId(null)} />;
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
        <button className="btn btn--accent"><AdmIcon.plus /> Nuevo caso</button>
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Caso</th>
            <th style={{ width: 160 }}>Categoría</th>
            <th style={{ width: 70 }}>Año</th>
            <th style={{ width: 120 }}>Estado</th>
            <th style={{ width: 80 }}>Vistas</th>
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
                <span className={`adm-status adm-status--${c.status}`}>
                  {c.status === 'published' ? 'PUBLICADO' : 'BORRADOR'}
                </span>
              </td>
              <td className="num">{c.views.toLocaleString('es-ES')}</td>
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
    </div>
  );
}

function CaseEditor({ id, onBack }: { id: string; onBack: () => void }) {
  const c = CASES.find((x) => x.id === id) ?? CASES[0];
  const [tab, setTab] = useState<'content' | 'kpis' | 'meta'>('content');
  const l: Locale = 'es';

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" onClick={onBack}>← Volver a casos</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost">Vista previa</button>
          <button className="btn btn--ghost">Guardar borrador</button>
          <button className="btn btn--accent">Publicar</button>
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
                <input value={c.slug} disabled />
                <div className="adm__field-hint">URL: cesarheredero.com/trabajo/{c.slug}</div>
              </div>
              <div className="adm__field-row">
                <div className="adm__field">
                  <label>CATEGORÍA · ES</label>
                  <input defaultValue={c.category.es} />
                </div>
                <div className="adm__field">
                  <label>AÑO</label>
                  <input defaultValue={c.year} />
                </div>
              </div>
              <div className="adm__field">
                <label>TÍTULO · ES</label>
                <input defaultValue={c.title.es} />
              </div>
              <div className="adm__field">
                <label>TEASER · ES</label>
                <textarea defaultValue={c.teaser[l]} />
              </div>
              <div className="adm__field">
                <label>TAGS (separados por coma)</label>
                <input defaultValue={c.tags.join(', ')} />
              </div>
            </div>
          )}

          {tab === 'kpis' && (
            <div className="adm__form">
              <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Hasta 4 KPIs por caso. Se muestran en la tarjeta y en el detalle.</p>
              <div className="adm__kpi-list">
                {c.kpis.map((k, i) => (
                  <div key={i} className="adm__kpi-row">
                    <input defaultValue={k.value} placeholder="Valor" />
                    <input defaultValue={k.label.es} placeholder="Etiqueta ES" />
                    <button className="icon-btn"><AdmIcon.trash /></button>
                  </div>
                ))}
              </div>
              <button className="btn btn--ghost" style={{ alignSelf: 'flex-start' }}><AdmIcon.plus /> Añadir KPI</button>
            </div>
          )}

          {tab === 'meta' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>ESTADO</label>
                <select defaultValue="published">
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              <div className="adm__field">
                <label>META TITLE</label>
                <input defaultValue={c.title.es} />
              </div>
              <div className="adm__field">
                <label>META DESCRIPTION</label>
                <textarea defaultValue={c.teaser.es} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
