'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CvData, CvExperience } from '@/components/cv-section';

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

type SiteData = {
  content?: {
    hero?: { title?: { es?: string }; sub?: { es?: string } };
    about?: { bio?: { es?: string } };
    contact?: { email?: string; linkedin?: string; cal?: string };
  };
  availability?: { status?: string };
};

async function putSite(patch: unknown): Promise<boolean> {
  const res = await fetch('/api/admin/site', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return res.ok;
}

function StatusEditor({ current }: { current: string }) {
  const [status, setStatus] = useState(current);

  useEffect(() => {
    setStatus(current);
  }, [current]);

  async function change(next: string) {
    setStatus(next);
    await putSite({ availability: { status: next } });
    document.cookie = `ch_status=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new CustomEvent('ch:status', { detail: { status: next } }));
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
      {STATUS_OPTIONS.map((o) => {
        const on = o.id === status;
        const dot = o.tone === 'live' ? 'var(--accent)' : o.tone === 'soft' ? 'var(--warn)' : o.tone === 'off' ? 'transparent' : 'var(--ink-400)';
        return (
          <button
            key={o.id}
            onClick={() => void change(o.id)}
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

function SaveBar({ saving, success, onSave }: { saving: boolean; success: boolean; onSave: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
      <button className="btn btn--accent" onClick={onSave} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      {success && <span style={{ fontSize: 12, color: 'var(--accent)' }}>✓ Guardado</span>}
    </div>
  );
}

export function ProfileSection() {
  const [tab, setTab] = useState<Tab>('hero');
  const [site, setSite] = useState<SiteData | null>(null);
  const [cv, setCv] = useState<CvData | null>(null);

  // Form state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [cal, setCal] = useState('');

  const [savingTab, setSavingTab] = useState<Tab | null>(null);
  const [successTab, setSuccessTab] = useState<Tab | null>(null);

  const loadSite = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site');
      const data = (await res.json()) as SiteData;
      setSite(data);
      setHeroTitle(data.content?.hero?.title?.es ?? '');
      setHeroSub(data.content?.hero?.sub?.es ?? '');
      setBio(data.content?.about?.bio?.es ?? '');
      setEmail(data.content?.contact?.email ?? '');
      setLinkedin(data.content?.contact?.linkedin ?? '');
      setCal(data.content?.contact?.cal ?? '');
    } catch {
      setSite({});
    }
  }, []);

  const loadCv = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cv');
      const data = (await res.json()) as CvData;
      setCv(data);
    } catch {
      setCv(null);
    }
  }, []);

  useEffect(() => {
    void loadSite();
    void loadCv();
  }, [loadSite, loadCv]);

  async function save(t: Tab, patch: unknown) {
    setSavingTab(t);
    setSuccessTab(null);
    try {
      const ok = await putSite(patch);
      if (ok) setSuccessTab(t);
    } finally {
      setSavingTab(null);
    }
  }

  function updateExperience(i: number, field: 'role' | 'company' | 'year' | 'descEs', value: string) {
    setCv((prev) => {
      if (!prev) return prev;
      const experience = prev.experience.map((e, idx) => {
        if (idx !== i) return e;
        if (field === 'descEs') {
          return { ...e, description: { ...e.description, es: value } };
        }
        return { ...e, [field]: value };
      });
      return { ...prev, experience };
    });
  }

  async function saveCv() {
    if (!cv) return;
    setSavingTab('cv');
    setSuccessTab(null);
    try {
      const res = await fetch('/api/admin/cv', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cv),
      });
      if (res.ok) setSuccessTab('cv');
    } finally {
      setSavingTab(null);
    }
  }

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
                <StatusEditor current={site?.availability?.status ?? 'open'} />
                <div className="adm__field-hint">Aparece en la barra superior y en el hero. Los cambios se aplican al instante.</div>
              </div>
              <div className="adm__field">
                <label>TÍTULO HERO · ES</label>
                <textarea value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Dejar vacío para usar el valor por defecto" />
              </div>
              <div className="adm__field">
                <label>SUBTÍTULO · ES</label>
                <textarea value={heroSub} onChange={(e) => setHeroSub(e.target.value)} style={{ minHeight: 90 }} placeholder="Dejar vacío para usar el valor por defecto" />
              </div>
              <SaveBar
                saving={savingTab === 'hero'}
                success={successTab === 'hero'}
                onSave={() => void save('hero', { content: { hero: { title: { es: heroTitle }, sub: { es: heroSub } } } })}
              />
            </div>
          )}

          {tab === 'about' && (
            <div className="adm__form">
              <div className="adm__field">
                <label>BIO · ES (un párrafo por línea)</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ minHeight: 160 }} placeholder="Dejar vacío para usar el valor por defecto" />
              </div>
              <SaveBar
                saving={savingTab === 'about'}
                success={successTab === 'about'}
                onSave={() => void save('about', { content: { about: { bio: { es: bio } } } })}
              />
            </div>
          )}

          {tab === 'cv' && (
            <div className="adm__form">
              {!cv ? (
                <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Cargando CV…</p>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Experiencia profesional. Los skills y formación se mantienen sin cambios.</p>
                  {cv.experience.map((exp: CvExperience, i) => (
                    <div key={exp.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-2)', padding: 12, marginBottom: 8 }}>
                      <div className="adm__field-row">
                        <div className="adm__field">
                          <label>ROL</label>
                          <input value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} />
                        </div>
                        <div className="adm__field">
                          <label>AÑO</label>
                          <input value={exp.year} onChange={(e) => updateExperience(i, 'year', e.target.value)} />
                        </div>
                      </div>
                      <div className="adm__field">
                        <label>EMPRESA</label>
                        <input value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
                      </div>
                      <div className="adm__field">
                        <label>DESCRIPCIÓN · ES</label>
                        <textarea value={exp.description.es} onChange={(e) => updateExperience(i, 'descEs', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <SaveBar saving={savingTab === 'cv'} success={successTab === 'cv'} onSave={() => void saveCv()} />
                </>
              )}
            </div>
          )}

          {tab === 'contact' && (
            <div className="adm__form">
              <div className="adm__field"><label>EMAIL</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Dejar vacío para usar el valor por defecto" /></div>
              <div className="adm__field"><label>LINKEDIN</label><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="Dejar vacío para usar el valor por defecto" /></div>
              <div className="adm__field"><label>CALENDARIO</label><input value={cal} onChange={(e) => setCal(e.target.value)} placeholder="Dejar vacío para usar el valor por defecto" /></div>
              <SaveBar
                saving={savingTab === 'contact'}
                success={successTab === 'contact'}
                onSave={() => void save('contact', { content: { contact: { email, linkedin, cal } } })}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
