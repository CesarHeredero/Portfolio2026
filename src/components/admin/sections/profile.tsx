'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CvData, CvExperience } from '@/components/cv-section';

type Tab = 'hero' | 'bento' | 'about' | 'process' | 'cv' | 'contact' | 'footer';

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
    };
    contact?: { title?: string; intro?: string; email?: string; linkedin?: string; cal?: string };
    footer?: { pitch?: string };
  };
  availability?: { status?: string };
};

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

function SaveBar({ saving, success, error, onSave }: { saving: boolean; success: boolean; error: string; onSave: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
      <button className="btn btn--accent" onClick={onSave} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
      {success && <span style={{ fontSize: 12, color: 'var(--accent)' }}>✓ Guardado · visible en el portfolio en unos segundos</span>}
      {error && <span style={{ fontSize: 12, color: 'var(--bad)' }}>⚠ {error}</span>}
    </div>
  );
}

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

export function ProfileSection() {
  const [tab, setTab] = useState<Tab>('hero');
  const [site, setSite] = useState<SiteData | null>(null);
  const [cv, setCv] = useState<CvData | null>(null);

  // ── Hero ──────────────────────────────────────────────────────────────────
  const [heroPretitle, setHeroPretitle] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroTitleEn, setHeroTitleEn] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [heroSubEn, setHeroSubEn] = useState('');
  const [heroIdName, setHeroIdName] = useState('');
  const [heroRole, setHeroRole] = useState('');
  const [heroExp, setHeroExp] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [heroCta1, setHeroCta1] = useState('');
  const [heroCta2, setHeroCta2] = useState('');
  const [heroCta3, setHeroCta3] = useState('');

  // ── Bento ─────────────────────────────────────────────────────────────────
  const [bentoRole, setBentoRole] = useState('');
  const [bentoCompany, setBentoCompany] = useState('');
  const [bentoSeeking, setBentoSeeking] = useState('');
  const [bentoKpiVal, setBentoKpiVal] = useState('');
  const [bentoKpiLabel, setBentoKpiLabel] = useState('');
  const [bentoClients, setBentoClients] = useState('');
  const [bentoAward, setBentoAward] = useState('');
  const [bentoCaps, setBentoCaps] = useState('');

  // ── About ─────────────────────────────────────────────────────────────────
  const [aboutName, setAboutName] = useState('');
  const [aboutRoleTag, setAboutRoleTag] = useState('');
  const [aboutExp, setAboutExp] = useState('');
  const [aboutLocation, setAboutLocation] = useState('');
  const [aboutLang, setAboutLang] = useState('');
  const [aboutCompany, setAboutCompany] = useState('');
  const [bio, setBio] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [q1Title, setQ1Title] = useState('');
  const [q1Desc, setQ1Desc] = useState('');
  const [q2Title, setQ2Title] = useState('');
  const [q2Desc, setQ2Desc] = useState('');
  const [q3Title, setQ3Title] = useState('');
  const [q3Desc, setQ3Desc] = useState('');
  const [q4Title, setQ4Title] = useState('');
  const [q4Desc, setQ4Desc] = useState('');

  // ── Process ───────────────────────────────────────────────────────────────
  const [s1t, setS1t] = useState(''); const [s1d, setS1d] = useState('');
  const [s2t, setS2t] = useState(''); const [s2d, setS2d] = useState('');
  const [s3t, setS3t] = useState(''); const [s3d, setS3d] = useState('');
  const [s4t, setS4t] = useState(''); const [s4d, setS4d] = useState('');
  const [s5t, setS5t] = useState(''); const [s5d, setS5d] = useState('');

  // ── Contact ───────────────────────────────────────────────────────────────
  const [contactTitle, setContactTitle] = useState('');
  const [contactIntro, setContactIntro] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [cal, setCal] = useState('');

  // ── Footer ────────────────────────────────────────────────────────────────
  const [footerPitch, setFooterPitch] = useState('');

  // ── Save state ────────────────────────────────────────────────────────────
  const [savingTab, setSavingTab] = useState<Tab | null>(null);
  const [successTab, setSuccessTab] = useState<Tab | null>(null);
  const [errorTab, setErrorTab] = useState<Partial<Record<Tab, string>>>({});

  const loadSite = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site');
      const data = (await res.json()) as SiteData;
      setSite(data);
      const c = data.content;
      setHeroPretitle(c?.hero?.pretitle ?? '');
      setHeroTitle(c?.hero?.title?.es ?? '');
      setHeroTitleEn(c?.hero?.title?.en ?? '');
      setHeroSub(c?.hero?.sub?.es ?? '');
      setHeroSubEn(c?.hero?.sub?.en ?? '');
      setHeroIdName(c?.hero?.idName ?? '');
      setHeroRole(c?.hero?.roleValue ?? '');
      setHeroExp(c?.hero?.expValue ?? '');
      setHeroLocation(c?.hero?.locationValue ?? '');
      setHeroCta1(c?.hero?.cta1 ?? '');
      setHeroCta2(c?.hero?.cta2 ?? '');
      setHeroCta3(c?.hero?.cta3 ?? '');
      setBentoRole(c?.bento?.roleValue ?? '');
      setBentoCompany(c?.bento?.roleCompany ?? '');
      setBentoSeeking(c?.bento?.seekingRoles ?? '');
      setBentoKpiVal(c?.bento?.kpiValue ?? '');
      setBentoKpiLabel(c?.bento?.kpiLabel ?? '');
      setBentoClients(c?.bento?.clientsValue ?? '');
      setBentoAward(c?.bento?.awardValue ?? '');
      setBentoCaps(c?.bento?.capabilities ?? '');
      setAboutName(c?.about?.name ?? '');
      setAboutRoleTag(c?.about?.roleTag ?? '');
      setAboutExp(c?.about?.expValue ?? '');
      setAboutLocation(c?.about?.locationValue ?? '');
      setAboutLang(c?.about?.langValue ?? '');
      setAboutCompany(c?.about?.companyValue ?? '');
      setBio(c?.about?.bio?.es ?? '');
      setBioEn(c?.about?.bio?.en ?? '');
      setQ1Title(c?.about?.q1Title ?? ''); setQ1Desc(c?.about?.q1Desc ?? '');
      setQ2Title(c?.about?.q2Title ?? ''); setQ2Desc(c?.about?.q2Desc ?? '');
      setQ3Title(c?.about?.q3Title ?? ''); setQ3Desc(c?.about?.q3Desc ?? '');
      setQ4Title(c?.about?.q4Title ?? ''); setQ4Desc(c?.about?.q4Desc ?? '');
      setS1t(c?.process?.step1Title ?? ''); setS1d(c?.process?.step1Desc ?? '');
      setS2t(c?.process?.step2Title ?? ''); setS2d(c?.process?.step2Desc ?? '');
      setS3t(c?.process?.step3Title ?? ''); setS3d(c?.process?.step3Desc ?? '');
      setS4t(c?.process?.step4Title ?? ''); setS4d(c?.process?.step4Desc ?? '');
      setS5t(c?.process?.step5Title ?? ''); setS5d(c?.process?.step5Desc ?? '');
      setContactTitle(c?.contact?.title ?? '');
      setContactIntro(c?.contact?.intro ?? '');
      setEmail(c?.contact?.email ?? '');
      setLinkedin(c?.contact?.linkedin ?? '');
      setCal(c?.contact?.cal ?? '');
      setFooterPitch(c?.footer?.pitch ?? '');
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
    setErrorTab((e) => ({ ...e, [t]: '' }));
    try {
      const res = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setSuccessTab(t);
      } else {
        const body = await res.json() as { error?: string };
        setErrorTab((e) => ({
          ...e,
          [t]: res.status === 401 ? 'Sesión expirada — vuelve a entrar' : (body.error ?? `Error ${res.status}`),
        }));
      }
    } catch {
      setErrorTab((e) => ({ ...e, [t]: 'Sin conexión. Comprueba la red.' }));
    } finally {
      setSavingTab(null);
    }
  }

  function updateExperience(i: number, field: 'role' | 'company' | 'year' | 'descEs', value: string) {
    setCv((prev) => {
      if (!prev) return prev;
      const experience = prev.experience.map((e, idx) => {
        if (idx !== i) return e;
        if (field === 'descEs') return { ...e, description: { ...e.description, es: value } };
        return { ...e, [field]: value };
      });
      return { ...prev, experience };
    });
  }

  async function saveCv() {
    if (!cv) return;
    setSavingTab('cv');
    setSuccessTab(null);
    setErrorTab((e) => ({ ...e, cv: '' }));
    try {
      const res = await fetch('/api/admin/cv', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cv),
      });
      if (res.ok) {
        setSuccessTab('cv');
      } else {
        const body = await res.json() as { error?: string };
        setErrorTab((e) => ({
          ...e,
          cv: res.status === 401 ? 'Sesión expirada — vuelve a entrar' : (body.error ?? `Error ${res.status}`),
        }));
      }
    } catch {
      setErrorTab((e) => ({ ...e, cv: 'Sin conexión.' }));
    } finally {
      setSavingTab(null);
    }
  }

  const TABS: [Tab, string][] = [
    ['hero', 'Hero'], ['bento', 'Bento'], ['about', 'Sobre mí'],
    ['process', 'Proceso'], ['cv', 'CV'], ['contact', 'Contacto'], ['footer', 'Footer'],
  ];
  const hint = 'Vacío = texto por defecto del código.';

  return (
    <>
      <div className="adm__tabs">
        {TABS.map(([id, l]) => (
          <button key={id} className={`adm__tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      <div className="adm__panel">
        <div className="adm__panel-body">

          {/* ── HERO ── */}
          {tab === 'hero' && (
            <div className="adm__form">
              <Field label="ESTADO DE DISPONIBILIDAD · BADGE">
                <StatusEditor current={site?.availability?.status ?? 'open'} />
                <div className="adm__field-hint">Aparece en la barra superior y en el hero. Los cambios se aplican al instante.</div>
              </Field>
              <Field label="PRETÍTULO" hint={hint}>
                <input value={heroPretitle} onChange={(e) => setHeroPretitle(e.target.value)} placeholder="PORTFOLIO · v2.0" />
              </Field>
              <Row>
                <Field label="TÍTULO · ES" hint={hint}>
                  <textarea value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Convierto producto en palancas de negocio medibles." />
                </Field>
                <Field label="TÍTULO · EN" hint={hint}>
                  <textarea value={heroTitleEn} onChange={(e) => setHeroTitleEn(e.target.value)} placeholder="I turn product into measurable business levers." />
                </Field>
              </Row>
              <Row>
                <Field label="SUBTÍTULO · ES" hint={hint}>
                  <textarea value={heroSub} onChange={(e) => setHeroSub(e.target.value)} style={{ minHeight: 90 }} />
                </Field>
                <Field label="SUBTÍTULO · EN" hint={hint}>
                  <textarea value={heroSubEn} onChange={(e) => setHeroSubEn(e.target.value)} style={{ minHeight: 90 }} />
                </Field>
              </Row>
              <Field label="NOMBRE COMPLETO (tarjeta de identidad)" hint={hint}>
                <input value={heroIdName} onChange={(e) => setHeroIdName(e.target.value)} placeholder="César Heredero Herranz" />
              </Field>
              <Row>
                <Field label="ROL (tarjeta)" hint={hint}>
                  <input value={heroRole} onChange={(e) => setHeroRole(e.target.value)} placeholder="Senior PO · UX Strategist" />
                </Field>
                <Field label="EXPERIENCIA (tarjeta)" hint={hint}>
                  <input value={heroExp} onChange={(e) => setHeroExp(e.target.value)} placeholder="10+ años" />
                </Field>
                <Field label="UBICACIÓN (tarjeta)" hint={hint}>
                  <input value={heroLocation} onChange={(e) => setHeroLocation(e.target.value)} placeholder="Madrid · Remoto OK" />
                </Field>
              </Row>
              <Row>
                <Field label="BOTÓN 1 · VER CASOS" hint={hint}>
                  <input value={heroCta1} onChange={(e) => setHeroCta1(e.target.value)} placeholder="Ver 8 casos" />
                </Field>
                <Field label="BOTÓN 2 · CONTACTAR" hint={hint}>
                  <input value={heroCta2} onChange={(e) => setHeroCta2(e.target.value)} placeholder="Contactar" />
                </Field>
                <Field label="BOTÓN 3 · CV" hint={hint}>
                  <input value={heroCta3} onChange={(e) => setHeroCta3(e.target.value)} placeholder="CV PDF" />
                </Field>
              </Row>
              <SaveBar
                saving={savingTab === 'hero'}
                success={successTab === 'hero'}
                error={errorTab.hero ?? ''}
                onSave={() => void save('hero', {
                  content: {
                    hero: {
                      pretitle: heroPretitle,
                      title: { es: heroTitle, en: heroTitleEn },
                      sub: { es: heroSub, en: heroSubEn },
                      idName: heroIdName, roleValue: heroRole,
                      expValue: heroExp, locationValue: heroLocation,
                      cta1: heroCta1, cta2: heroCta2, cta3: heroCta3,
                    },
                  },
                })}
              />
            </div>
          )}

          {/* ── BENTO ── */}
          {tab === 'bento' && (
            <div className="adm__form">
              <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Cuadrícula de métricas debajo del hero.</p>
              <Row>
                <Field label="ROL ACTUAL" hint={hint}>
                  <input value={bentoRole} onChange={(e) => setBentoRole(e.target.value)} placeholder="Senior Product Owner & UX Strategist" />
                </Field>
                <Field label="EMPRESA · PERÍODO" hint={hint}>
                  <input value={bentoCompany} onChange={(e) => setBentoCompany(e.target.value)} placeholder="Flexicar · 2019 — Hoy" />
                </Field>
              </Row>
              <Field label="ROLES QUE BUSCO (separados por coma)" hint={hint}>
                <textarea value={bentoSeeking} onChange={(e) => setBentoSeeking(e.target.value)} placeholder="Lead UX, Head of Design, Staff Product Designer, Product Owner, Product Manager" />
              </Field>
              <Row>
                <Field label="KPI · VALOR" hint={hint}>
                  <input value={bentoKpiVal} onChange={(e) => setBentoKpiVal(e.target.value)} placeholder="28%" />
                </Field>
                <Field label="KPI · ETIQUETA" hint={hint}>
                  <input value={bentoKpiLabel} onChange={(e) => setBentoKpiLabel(e.target.value)} placeholder="usuarios recuperados con medición server-side" />
                </Field>
              </Row>
              <Row>
                <Field label="CLIENTES PASADOS" hint={hint}>
                  <input value={bentoClients} onChange={(e) => setBentoClients(e.target.value)} placeholder="Toyota · Hyundai · Sacyl" />
                </Field>
                <Field label="RECONOCIMIENTO / PREMIO" hint={hint}>
                  <input value={bentoAward} onChange={(e) => setBentoAward(e.target.value)} placeholder="Cardio Xplore · Ganador europeo 2017" />
                </Field>
              </Row>
              <Field label="CAPACIDADES (separadas por coma)" hint={hint}>
                <textarea value={bentoCaps} onChange={(e) => setBentoCaps(e.target.value)} placeholder="Product Ownership, UX Strategy, SEO técnico, Server-side tracking, Design Systems" />
              </Field>
              <SaveBar
                saving={savingTab === 'bento'}
                success={successTab === 'bento'}
                error={errorTab.bento ?? ''}
                onSave={() => void save('bento', {
                  content: {
                    bento: {
                      roleValue: bentoRole, roleCompany: bentoCompany,
                      seekingRoles: bentoSeeking,
                      kpiValue: bentoKpiVal, kpiLabel: bentoKpiLabel,
                      clientsValue: bentoClients, awardValue: bentoAward,
                      capabilities: bentoCaps,
                    },
                  },
                })}
              />
            </div>
          )}

          {/* ── SOBRE MÍ ── */}
          {tab === 'about' && (
            <div className="adm__form">
              <Row>
                <Field label="NOMBRE COMPLETO" hint={hint}>
                  <input value={aboutName} onChange={(e) => setAboutName(e.target.value)} placeholder="César Heredero Herranz" />
                </Field>
                <Field label="ETIQUETA DE ROL" hint={hint}>
                  <input value={aboutRoleTag} onChange={(e) => setAboutRoleTag(e.target.value)} placeholder="Senior PO · UX Strategist" />
                </Field>
              </Row>
              <Row>
                <Field label="EXPERIENCIA" hint={hint}>
                  <input value={aboutExp} onChange={(e) => setAboutExp(e.target.value)} placeholder="10+ años" />
                </Field>
                <Field label="UBICACIÓN" hint={hint}>
                  <input value={aboutLocation} onChange={(e) => setAboutLocation(e.target.value)} placeholder="Madrid · Remoto OK" />
                </Field>
                <Field label="IDIOMAS" hint={hint}>
                  <input value={aboutLang} onChange={(e) => setAboutLang(e.target.value)} placeholder="Español" />
                </Field>
                <Field label="EMPRESA" hint={hint}>
                  <input value={aboutCompany} onChange={(e) => setAboutCompany(e.target.value)} placeholder="Flexicar" />
                </Field>
              </Row>
              <Row>
                <Field label="BIO · ES (párrafos separados por línea en blanco)" hint={hint}>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ minHeight: 160 }} />
                </Field>
                <Field label="BIO · EN" hint={hint}>
                  <textarea value={bioEn} onChange={(e) => setBioEn(e.target.value)} style={{ minHeight: 160 }} />
                </Field>
              </Row>
              <p style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cualidades</p>
              {([
                [q1Title, setQ1Title, q1Desc, setQ1Desc, '1'],
                [q2Title, setQ2Title, q2Desc, setQ2Desc, '2'],
                [q3Title, setQ3Title, q3Desc, setQ3Desc, '3'],
                [q4Title, setQ4Title, q4Desc, setQ4Desc, '4'],
              ] as [string, (v: string) => void, string, (v: string) => void, string][]).map(([t, setT, d, setD, n]) => (
                <Row key={n}>
                  <Field label={`Q${n} · TÍTULO`} hint={hint}>
                    <input value={t} onChange={(e) => setT(e.target.value)} />
                  </Field>
                  <Field label={`Q${n} · DESCRIPCIÓN`} hint={hint}>
                    <input value={d} onChange={(e) => setD(e.target.value)} />
                  </Field>
                </Row>
              ))}
              <SaveBar
                saving={savingTab === 'about'}
                success={successTab === 'about'}
                error={errorTab.about ?? ''}
                onSave={() => void save('about', {
                  content: {
                    about: {
                      name: aboutName, roleTag: aboutRoleTag,
                      expValue: aboutExp, locationValue: aboutLocation,
                      langValue: aboutLang, companyValue: aboutCompany,
                      bio: { es: bio, en: bioEn },
                      q1Title, q1Desc, q2Title, q2Desc,
                      q3Title, q3Desc, q4Title, q4Desc,
                    },
                  },
                })}
              />
            </div>
          )}

          {/* ── PROCESO ── */}
          {tab === 'process' && (
            <div className="adm__form">
              <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Los 5 pasos de la sección &ldquo;Cómo trabajo&rdquo;.</p>
              {([
                [s1t, setS1t, s1d, setS1d, '1'],
                [s2t, setS2t, s2d, setS2d, '2'],
                [s3t, setS3t, s3d, setS3d, '3'],
                [s4t, setS4t, s4d, setS4d, '4'],
                [s5t, setS5t, s5d, setS5d, '5'],
              ] as [string, (v: string) => void, string, (v: string) => void, string][]).map(([t, setT, d, setD, n]) => (
                <Row key={n}>
                  <Field label={`PASO ${n} · TÍTULO`} hint={hint}>
                    <input value={t} onChange={(e) => setT(e.target.value)} />
                  </Field>
                  <Field label={`PASO ${n} · DESCRIPCIÓN`} hint={hint}>
                    <textarea value={d} onChange={(e) => setD(e.target.value)} />
                  </Field>
                </Row>
              ))}
              <SaveBar
                saving={savingTab === 'process'}
                success={successTab === 'process'}
                error={errorTab.process ?? ''}
                onSave={() => void save('process', {
                  content: {
                    process: {
                      step1Title: s1t, step1Desc: s1d,
                      step2Title: s2t, step2Desc: s2d,
                      step3Title: s3t, step3Desc: s3d,
                      step4Title: s4t, step4Desc: s4d,
                      step5Title: s5t, step5Desc: s5d,
                    },
                  },
                })}
              />
            </div>
          )}

          {/* ── CV ── */}
          {tab === 'cv' && (
            <div className="adm__form">
              {!cv ? (
                <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Cargando CV…</p>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>Experiencia profesional. Los skills y formación se mantienen sin cambios.</p>
                  {cv.experience.map((exp: CvExperience, i) => (
                    <div key={exp.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-2)', padding: 12, marginBottom: 8 }}>
                      <Row>
                        <Field label="ROL">
                          <input value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} />
                        </Field>
                        <Field label="AÑO">
                          <input value={exp.year} onChange={(e) => updateExperience(i, 'year', e.target.value)} />
                        </Field>
                      </Row>
                      <Field label="EMPRESA">
                        <input value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
                      </Field>
                      <Field label="DESCRIPCIÓN · ES">
                        <textarea value={exp.description.es} onChange={(e) => updateExperience(i, 'descEs', e.target.value)} />
                      </Field>
                    </div>
                  ))}
                  <SaveBar saving={savingTab === 'cv'} success={successTab === 'cv'} error={errorTab.cv ?? ''} onSave={() => void saveCv()} />
                </>
              )}
            </div>
          )}

          {/* ── CONTACTO ── */}
          {tab === 'contact' && (
            <div className="adm__form">
              <Field label="TÍTULO DE SECCIÓN" hint={hint}>
                <input value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} placeholder="Hablemos" />
              </Field>
              <Field label="TEXTO INTRODUCTORIO" hint={hint}>
                <textarea value={contactIntro} onChange={(e) => setContactIntro(e.target.value)} style={{ minHeight: 80 }} />
              </Field>
              <Field label="EMAIL" hint={hint}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hola@cesarheredero.com" />
              </Field>
              <Field label="LINKEDIN (sin https://)" hint={hint}>
                <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/cesarheredero" />
              </Field>
              <Field label="CALENDARIO (cal.com)" hint={hint}>
                <input value={cal} onChange={(e) => setCal(e.target.value)} placeholder="cal.com/cesarheredero" />
              </Field>
              <SaveBar
                saving={savingTab === 'contact'}
                success={successTab === 'contact'}
                error={errorTab.contact ?? ''}
                onSave={() => void save('contact', {
                  content: { contact: { title: contactTitle, intro: contactIntro, email, linkedin, cal } },
                })}
              />
            </div>
          )}

          {/* ── FOOTER ── */}
          {tab === 'footer' && (
            <div className="adm__form">
              <Field label="FRASE DEL FOOTER" hint={hint}>
                <input value={footerPitch} onChange={(e) => setFooterPitch(e.target.value)} placeholder="Producto como palanca. Diseño con rigor. Decisiones con datos." />
              </Field>
              <SaveBar
                saving={savingTab === 'footer'}
                success={successTab === 'footer'}
                error={errorTab.footer ?? ''}
                onSave={() => void save('footer', { content: { footer: { pitch: footerPitch } } })}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
