import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { loadCases, saveCases } from '@/lib/content-store';
import type { Case, ImpactType, KPI, PIASummary } from '@/lib/content';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

function revalidate() {
  revalidatePath('/es');
  revalidatePath('/en');
}

export async function GET() {
  const cases = await loadCases();
  return NextResponse.json(cases);
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const incoming = (await request.json()) as Case;
  if (!incoming?.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const cases = await loadCases();
  const idx = cases.findIndex((c) => c.id === incoming.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  cases[idx] = { ...cases[idx], ...incoming };
  await saveCases(cases);
  revalidate();
  return NextResponse.json({ ok: true });
}

type NewCaseBody = {
  slug?: string;
  title?: { es?: string; en?: string };
  category?: { es?: string; en?: string };
  year?: string;
  teaser?: { es?: string; en?: string };
  kpis?: KPI[];
  tags?: string[];
  impactType?: ImpactType;
  status?: 'published' | 'draft';
  featured?: boolean;
  pia?: { es?: PIASummary; en?: PIASummary };
};

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as NewCaseBody;
  const titleEs = body.title?.es?.trim();
  let slug = body.slug?.trim();
  if (!titleEs || !slug) {
    return NextResponse.json({ error: 'title.es y slug son obligatorios' }, { status: 400 });
  }

  const cases = await loadCases();
  // Ensure slug/id unique
  const baseSlug = slug;
  let n = 1;
  while (cases.some((c) => c.slug === slug || c.id === slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  const id = slug;

  const emptyPia: PIASummary = { problem: '', action: '', impact: '' };
  const piaEs = body.pia?.es ?? emptyPia;
  const piaEn = body.pia?.en ?? piaEs;

  const created: Case = {
    id,
    slug,
    category: {
      es: body.category?.es ?? '',
      en: body.category?.en ?? body.category?.es ?? '',
    },
    year: body.year ?? String(new Date().getFullYear()),
    title: {
      es: titleEs,
      en: body.title?.en ?? titleEs,
    },
    teaser: {
      es: body.teaser?.es ?? '',
      en: body.teaser?.en ?? body.teaser?.es ?? '',
    },
    kpis: body.kpis ?? [],
    tags: body.tags ?? [],
    impactType: body.impactType ?? 'product',
    featured: body.featured ?? false,
    status: body.status ?? 'draft',
    pia: { es: piaEs, en: piaEn },
  };

  cases.push(created);
  await saveCases(cases);
  revalidate();
  return NextResponse.json(created);
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
  revalidate();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const cases = await loadCases();
  const next = cases.filter((c) => c.id !== body.id);
  await saveCases(next);
  revalidate();
  return NextResponse.json({ ok: true });
}
