import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import path from 'path';

const STATUS_PATH = path.join(process.cwd(), 'content', 'status.json');

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

export async function GET() {
  try {
    const raw = await readFile(STATUS_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({});
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json() as { id?: string; status?: string };
  const { id, status } = body;
  if (!id || !['published', 'draft'].includes(status ?? '')) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  let current: Record<string, string> = {};
  try {
    const raw = await readFile(STATUS_PATH, 'utf-8');
    current = JSON.parse(raw) as Record<string, string>;
  } catch {
    // start fresh
  }
  current[id] = status!;
  await writeFile(STATUS_PATH, JSON.stringify(current, null, 2), 'utf-8');
  revalidatePath('/es');
  revalidatePath('/en');
  return NextResponse.json({ ok: true });
}
