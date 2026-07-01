import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { loadCases, saveCases } from '@/lib/content-store';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

export async function GET() {
  const cases = await loadCases();
  const map: Record<string, string> = {};
  for (const c of cases) map[c.id] = c.status ?? 'published';
  return NextResponse.json(map);
}

export async function PATCH(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as { id?: string; status?: string };
  const { id, status } = body;
  if (!id || !['published', 'draft'].includes(status ?? '')) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const cases = await loadCases();
  const target = cases.find((c) => c.id === id);
  if (!target) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  target.status = status as 'published' | 'draft';
  await saveCases(cases);
  revalidatePath('/es');
  revalidatePath('/en');
  return NextResponse.json({ ok: true });
}
