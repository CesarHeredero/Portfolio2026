import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Datos de formulario inválidos' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const slug = formData.get('slug') as string | null;
  const type = formData.get('type') as string | null;

  if (!file || !slug || !type) {
    return NextResponse.json({ error: 'Faltan campos: file, slug, type' }, { status: 400 });
  }
  if (!['cover', 'image', 'doc'].includes(type)) {
    return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 });
  }

  const maxSize = type === 'doc' ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `Archivo demasiado grande (máx ${type === 'doc' ? '20' : '10'}MB)` },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeSlug = path.basename(slug);
  const dir = path.join(process.cwd(), 'public', 'cases', safeSlug);
  await mkdir(dir, { recursive: true });

  let filename: string;
  if (type === 'cover') {
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
    filename = `cover.${ext}`;
  } else if (type === 'doc') {
    filename = 'analysis.pdf';
  } else {
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
    filename = `img-${Date.now()}.${ext}`;
  }

  await writeFile(path.join(dir, filename), buffer);
  return NextResponse.json({ url: `/cases/${safeSlug}/${filename}` });
}
