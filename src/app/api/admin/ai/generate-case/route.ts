import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

// ── Shared types ──────────────────────────────────────────────────────────────

type CaseLink = { label: string; url: string; platform?: string };

type FullCaseData = {
  titleEs: string; titleEn: string;
  teaserEs: string; teaserEn: string;
  categoryEs: string; categoryEn: string;
  year: string; tags: string[]; impactType: string;
  piaProblem: string; piaAction: string; piaImpact: string;
  piaProblemEn: string; piaActionEn: string; piaImpactEn: string;
  kpis: { value: string; labelEs: string; labelEn: string }[];
  links: CaseLink[];
  analysisEs: string;
  analysisEn: string;
};

type GenerateFromBriefBody = { phase: 'generateFromBrief'; brief: string };
type RefineBody = { phase: 'refine'; currentCase: FullCaseData; message: string };
type RequestBody = GenerateFromBriefBody | RefineBody;

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      error: 'ANTHROPIC_API_KEY no configurada. Añade la clave al .env del VPS.',
    }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.phase === 'generateFromBrief') {
    return generateFromBrief(client, body.brief);
  }
  if (body.phase === 'refine') {
    return refine(client, body.currentCase, body.message);
  }

  return NextResponse.json({ error: 'Fase desconocida' }, { status: 400 });
}

// ── Generate everything from a free-form brief ────────────────────────────────

async function generateFromBrief(client: Anthropic, brief: string) {
  const prompt = `Eres el redactor del portfolio de César Heredero (Senior Product Owner & UX Strategist, Lead UX/UI en Grupo Flexicar). Tu tarea es generar un caso de portfolio completo a partir de un briefing libre.

BRIEFING DEL PROYECTO:
${brief}

Genera el caso completo en este JSON. Adapta los campos AL TIPO DE PROYECTO — no uses siempre los mismos KPIs ni la misma estructura:

{
  "titleEs": "Título en español orientado al reto o resultado (máx 80 chars)",
  "titleEn": "Title in English, challenge or result oriented (max 80 chars)",
  "teaserEs": "2-3 frases que resumen el caso: contexto → qué se construyó → resultado clave.",
  "teaserEn": "2-3 sentences: context → what was built → key result.",
  "categoryEs": "Una de: PRODUCTO & APP MÓVIL, PRODUCTO & CONTENIDO, SEO, DATOS, UX, RENDIMIENTO",
  "categoryEn": "One of: PRODUCT & MOBILE APP, PRODUCT & CONTENT, SEO, DATA, UX, PERFORMANCE",
  "year": "Año extraído del briefing o año actual",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "impactType": "product|seo|data|ux|performance|content",
  "kpis": [
    { "value": "X", "labelEs": "Etiqueta adaptada al proyecto", "labelEn": "Adapted label" }
  ],
  "piaProblem": "El problema de negocio en 1-2 frases concretas (ES).",
  "piaAction": "Lo que se hizo en 1-2 frases concretas (ES).",
  "piaImpact": "El impacto medible en 1-2 frases (ES).",
  "piaProblemEn": "Business problem in 1-2 concrete sentences (EN).",
  "piaActionEn": "What was done in 1-2 concrete sentences (EN).",
  "piaImpactEn": "Measurable impact in 1-2 sentences (EN).",
  "links": [],
  "analysisEs": "Análisis largo en Markdown (400-600 palabras, ES). Ver estructura abajo.",
  "analysisEn": "Long-form analysis in Markdown (400-600 words, EN). See structure below."
}

REGLAS DE KPIs — adáptalos al tipo de proyecto:
- App de consumo: tiendas publicadas, idiomas, coste de lanzamiento, funciones clave
- Proyecto de negocio: % mejora, tiempo ahorrado, ingresos, usuarios impactados
- Proyecto técnico: tiempo de respuesta, reducción de deuda técnica, cobertura
- Máximo 4 KPIs. Valores concretos con números. Si son estimaciones, añade asterisco.

REGLAS DE LINKS — extráelos del briefing si los menciona:
- Si hay URL de App Store → { "label": "Descargar en iOS", "url": "...", "platform": "ios" }
- Si hay URL de Google Play → { "label": "Google Play", "url": "...", "platform": "android" }
- Si hay web → { "label": "Ver proyecto", "url": "...", "platform": "web" }
- Si no hay links en el briefing → array vacío []

ESTRUCTURA DEL ANÁLISIS (ES y EN):
## [Título sección: El origen / Why]
Contexto y problema. Por qué nació este proyecto.

## [Título sección: Qué se construyó / What was built]
Funciones clave y decisiones de producto más importantes.

## Stack técnico (SOLO si el proyecto es técnico y el stack es relevante)

## [Título sección: Resultado / Results]
Impacto medible + aprendizaje principal.

Responde ÚNICAMENTE con el JSON válido (sin markdown wrapper, sin texto adicional).`;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
    const generated = JSON.parse(raw) as FullCaseData;
    return NextResponse.json({ generated });
  } catch (err) {
    console.error('generateFromBrief error:', err);
    return NextResponse.json({ error: 'Error al generar el caso. Inténtalo de nuevo.' }, { status: 500 });
  }
}

// ── Refine via chat ───────────────────────────────────────────────────────────

async function refine(client: Anthropic, current: FullCaseData, message: string) {
  const prompt = `Eres el editor del portfolio de César Heredero. Tienes el borrador actual de un caso y el usuario quiere cambiarlo.

CASO ACTUAL:
${JSON.stringify(current, null, 2)}

EL USUARIO DICE: "${message}"

Aplica SOLO lo que pide. No cambies lo que no se menciona. Si pide cambiar el título, actualiza titleEs y titleEn manteniendo coherencia. Si pide añadir un enlace, añádelo a links[]. Si pide modificar el análisis, actualiza la sección relevante de analysisEs y analysisEn. Si pide quitar los KPIs y poner otra cosa, reemplázalos. Adapta siempre ES y EN juntos para mantener coherencia.

Devuelve el caso completo actualizado MÁS un campo extra "reply" con una frase confirmando el cambio:

{
  "titleEs": "...",
  "titleEn": "...",
  "teaserEs": "...",
  "teaserEn": "...",
  "categoryEs": "...",
  "categoryEn": "...",
  "year": "...",
  "tags": ["..."],
  "impactType": "...",
  "kpis": [{ "value": "...", "labelEs": "...", "labelEn": "..." }],
  "piaProblem": "...",
  "piaAction": "...",
  "piaImpact": "...",
  "piaProblemEn": "...",
  "piaActionEn": "...",
  "piaImpactEn": "...",
  "links": [{ "label": "...", "url": "...", "platform": "..." }],
  "analysisEs": "...",
  "analysisEn": "...",
  "reply": "Listo, he [descripción breve del cambio]."
}

Responde ÚNICAMENTE con el JSON válido.`;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
    const result = JSON.parse(raw) as FullCaseData & { reply: string };
    const { reply, ...updated } = result;
    return NextResponse.json({ updated, reply });
  } catch (err) {
    console.error('refine error:', err);
    return NextResponse.json({ error: 'Error al procesar el cambio. Inténtalo de nuevo.' }, { status: 500 });
  }
}
