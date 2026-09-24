import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import path from 'path';

export const runtime = 'nodejs';

const SITE_PATH = path.join(process.cwd(), 'content', 'site.json');

type Json = Record<string, unknown>;

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

function isObject(v: unknown): v is Json {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Deep-ish merge: recursively merges plain objects, replaces everything else.
function deepMerge(target: Json, source: Json): Json {
  const out: Json = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (isObject(sv) && isObject(tv)) {
      out[key] = deepMerge(tv, sv);
    } else {
      out[key] = sv;
    }
  }
  return out;
}

export async function GET() {
  try {
    const raw = await readFile(SITE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const patch = (await request.json()) as Json;
  let current: Json = {};
  try {
    const raw = await readFile(SITE_PATH, 'utf-8');
    current = JSON.parse(raw) as Json;
  } catch {
    /* start fresh */
  }
  const merged = deepMerge(current, patch);
  await writeFile(SITE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  revalidatePath('/es');
  revalidatePath('/en');
  revalidatePath('/(es)', 'layout');
  revalidatePath('/(en)', 'layout');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
