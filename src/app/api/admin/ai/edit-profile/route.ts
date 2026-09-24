import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

type EditProfileBody = {
  currentSite: Record<string, unknown>;
  message: string;
};

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no configurada. Añade la clave al .env del VPS.' },
      { status: 500 },
    );
  }

  let body: EditProfileBody;
  try {
    body = (await request.json()) as EditProfileBody;
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const { currentSite, message } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'El campo message es obligatorio' }, { status: 400 });
  }

  const contentJson = JSON.stringify(currentSite?.content ?? {}, null, 2);

  const systemPrompt = `Eres el asistente de edición del portfolio de César Heredero. Tu trabajo es modificar los campos del portfolio según las instrucciones del usuario.

Se te dará el JSON actual del contenido del portfolio y una instrucción del usuario. Debes devolver ÚNICAMENTE los campos que cambian (deep partial con la misma estructura anidada) más un campo "reply" con una frase corta confirmando el cambio.

Reglas:
- Devuelve SOLO los campos modificados, no el JSON completo
- Mantén la estructura anidada: { "hero": { "title": { "es": "..." } } }
- Si el usuario pide un cambio en ES y tiene sentido en EN, adapta también el EN proporcionalmente
- Entiende referencias naturales: "el hero" → hero, "sobre mí" / "bio" → about, "proceso" / "pasos" → process, "contacto" → contact, "footer" → footer, "bento" → bento, "estado" / "disponibilidad" → availability
- Entiende referencias a pasos: "el paso 3" → step3Title / step3Desc
- El campo "reply" debe ser una frase corta y natural en español confirmando qué se cambió
- Responde SIEMPRE con JSON válido, sin texto adicional antes ni después

Estructura del content:
{
  hero: { pretitle, title: {es, en}, sub: {es, en}, idName, roleValue, expValue, locationValue, cta1, cta2, cta3 },
  bento: { roleValue, roleCompany, seekingRoles, kpiValue, kpiLabel, clientsValue, awardValue, capabilities },
  about: { name, roleTag, bio: {es, en}, expValue, locationValue, langValue, companyValue, q1Title, q1Desc, q2Title, q2Desc, q3Title, q3Desc, q4Title, q4Desc },
  process: { step1Title, step1Desc, step2Title, step2Desc, ..., step8Title, step8Desc },
  contact: { title, intro, email, linkedin, cal },
  footer: { pitch },
  statusBar: { role }
}

Responde con este formato exacto:
{
  "updatedFields": { ...solo los campos que cambian con la estructura anidada completa... },
  "reply": "Frase corta confirmando el cambio."
}`;

  const userPrompt = `Contenido actual del portfolio:
${contentJson}

Instrucción del usuario:
${message.trim()}`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // Parse JSON — strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(clean) as { updatedFields?: unknown; reply?: string };

    return NextResponse.json({
      updatedFields: parsed.updatedFields ?? {},
      reply: parsed.reply ?? 'Listo, he aplicado el cambio.',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Error de la IA: ${msg}` }, { status: 500 });
  }
}
