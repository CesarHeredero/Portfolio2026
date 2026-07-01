import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

type InitialData = {
  title: string;
  company: string;
  role: string;
  date: string;
  description: string;
  tags?: string;
};

type Question = {
  id: string;
  question: string;
  why: string;
  placeholder: string;
};

type AnalyzeBody = { phase: 'analyze'; initialData: InitialData };
type GenerateBody = { phase: 'generate'; initialData: InitialData; answers?: Record<string, string> };
type RequestBody = AnalyzeBody | GenerateBody;

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      error: 'ANTHROPIC_API_KEY no configurada. Añade la clave al archivo .env del VPS y reinicia el servidor.',
    }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.phase === 'analyze') {
    return analyze(client, body.initialData);
  }
  if (body.phase === 'generate') {
    return generate(client, body.initialData, body.answers);
  }

  return NextResponse.json({ error: 'Fase desconocida' }, { status: 400 });
}

// ── Phase 1: Analyze if we need more info ──────────────────────────────────

async function analyze(client: Anthropic, data: InitialData) {
  const prompt = `Analiza esta información de un caso de portfolio de Product Owner/UX y determina si tienes suficiente información para escribir un caso profesional, o si necesitas más datos.

Información del proyecto:
- Título: ${data.title}
- Empresa/Cliente: ${data.company}
- Rol en el proyecto: ${data.role}
- Período: ${data.date}
- Descripción del usuario: ${data.description}
${data.tags ? `- Tags sugeridos: ${data.tags}` : ''}

Para un caso de portfolio de calidad se necesita:
1. Un problema de negocio concreto y cuantificable
2. Las decisiones y acciones específicas tomadas
3. Resultados medibles con números (%, tiempo, dinero, usuarios, conversiones...)

Evalúa si la descripción incluye estos tres elementos con suficiente detalle. Si falta alguno, haz preguntas concretas para obtenerlo.

Responde ÚNICAMENTE con este JSON (sin markdown, sin explicaciones):
{
  "hasEnoughInfo": true,
  "questions": []
}

O si necesitas más datos:
{
  "hasEnoughInfo": false,
  "questions": [
    {
      "id": "q1",
      "question": "¿Cuál era el problema de negocio concreto antes de este proyecto?",
      "why": "Necesito entender el punto de partida para definir el impacto",
      "placeholder": "Por ejemplo: el 30% de usuarios abandonaban el formulario de contacto"
    }
  ]
}

Máximo 4 preguntas. Sé específico y directo.`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
    const result = JSON.parse(raw) as { hasEnoughInfo: boolean; questions: Question[] };
    return NextResponse.json(result);
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ error: 'Error al analizar la información' }, { status: 500 });
  }
}

// ── Phase 2: Generate the full case ───────────────────────────────────────

async function generate(client: Anthropic, data: InitialData, answers?: Record<string, string>) {
  const answersText = answers && Object.keys(answers).length > 0
    ? '\n\nRespuestas adicionales del autor:\n' + Object.entries(answers).map(([, v]) => `- ${v}`).join('\n')
    : '';

  const prompt = `Eres el redactor del portfolio de César Heredero, Senior Product Owner & UX Strategist en Flexicar (ecommerce de automoción con +30.000 fichas en España y Portugal). Tu tarea es escribir un caso de estudio profesional basado en la información que César te da.

ESTILO DEL PORTFOLIO:
- Conciso y orientado a negocio. Sin relleno.
- Cada caso tiene un problema de negocio real → acción concreta → impacto medible con números.
- Tono: directo, profesional, sin jerga corporativa vacía.
- Los títulos describen el resultado o el reto, no el nombre del proyecto.

INFORMACIÓN DEL CASO:
- Título/Nombre: ${data.title}
- Empresa: ${data.company}
- Rol de César: ${data.role}
- Período: ${data.date}
- Descripción: ${data.description}
${data.tags ? `- Tags mencionados: ${data.tags}` : ''}${answersText}

GENERA el caso completo en este JSON exacto (sin markdown, sin texto fuera del JSON):
{
  "title": {
    "es": "Título en español, orientado al problema o resultado (máx 80 chars)",
    "en": "Title in English, problem or result oriented (max 80 chars)"
  },
  "teaser": {
    "es": "2-3 frases que resumen el caso: contexto → acción → resultado.",
    "en": "2-3 sentences: context → action → result."
  },
  "category": {
    "es": "UNA de: PRODUCTO, SEO, DATOS, UX, RENDIMIENTO, CONTENIDO",
    "en": "ONE of: PRODUCT, SEO, DATA, UX, PERFORMANCE, CONTENT"
  },
  "impactType": "uno de: product, seo, data, ux, performance, content",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "kpis": [
    {"value": "X%", "label": {"es": "Métrica en español", "en": "Metric in English"}},
    {"value": "Nº", "label": {"es": "Otra métrica", "en": "Another metric"}}
  ],
  "pia": {
    "es": {
      "problem": "El problema de negocio en 1-2 frases concretas.",
      "action": "Lo que se hizo en 1-2 frases concretas.",
      "impact": "El impacto medible con números en 1-2 frases."
    },
    "en": {
      "problem": "The business problem in 1-2 concrete sentences.",
      "action": "What was done in 1-2 concrete sentences.",
      "impact": "The measurable impact with numbers in 1-2 sentences."
    }
  }
}

REGLAS IMPORTANTES:
- Los KPIs DEBEN tener valores concretos con números (porcentajes, tiempos, cantidades). Si no los tienes, infiere razonables desde la descripción y ponles un "*" al final del label.
- La pia.impact DEBE mencionar al menos un número.
- Incluye 3-6 tags técnicos o metodológicos relevantes.
- Responde SOLO con el JSON válido.`;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
    const generated = JSON.parse(raw);
    return NextResponse.json({ generated });
  } catch (err) {
    console.error('generate error:', err);
    return NextResponse.json({ error: 'Error al generar el caso. Inténtalo de nuevo.' }, { status: 500 });
  }
}
