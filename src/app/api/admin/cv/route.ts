import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import path from 'path';

export const runtime = 'nodejs';

const CV_PATH = path.join(process.cwd(), 'content', 'cv.json');

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

export async function GET() {
  try {
    const raw = await readFile(CV_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as unknown;
  await writeFile(CV_PATH, JSON.stringify(body, null, 2), 'utf-8');
  revalidatePath('/es');
  revalidatePath('/en');
  return NextResponse.json({ ok: true });
}
