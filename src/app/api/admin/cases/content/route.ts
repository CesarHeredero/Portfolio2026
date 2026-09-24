import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

const casesDir = () => path.join(process.cwd(), 'content', 'cases');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const read = async (lang: 'es' | 'en') => {
    try {
      return await readFile(path.join(casesDir(), `${slug}.${lang}.mdx`), 'utf-8');
    } catch {
      return '';
    }
  };

  const [es, en] = await Promise.all([read('es'), read('en')]);
  return NextResponse.json({ es, en });
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = (await request.json()) as { slug?: string; es?: string; en?: string };
  if (!body.slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const dir = casesDir();
  await mkdir(dir, { recursive: true });

  await Promise.all([
    writeFile(path.join(dir, `${body.slug}.es.mdx`), body.es ?? '', 'utf-8'),
    writeFile(path.join(dir, `${body.slug}.en.mdx`), body.en ?? '', 'utf-8'),
  ]);

  return NextResponse.json({ ok: true });
}
