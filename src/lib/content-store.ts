import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { CASES, PIA_SUMMARY, type Case } from './content';

const CASES_PATH = path.join(process.cwd(), 'content', 'cases.json');

function seed(): Case[] {
  return CASES.map((c) => ({
    ...c,
    status: c.id === 'seo-30k' ? ('draft' as const) : ('published' as const),
    pia: PIA_SUMMARY[c.id],
  }));
}

export async function loadCases(): Promise<Case[]> {
  try {
    const raw = await readFile(CASES_PATH, 'utf-8');
    return JSON.parse(raw) as Case[];
  } catch {
    return seed();
  }
}

export async function saveCases(cases: Case[]): Promise<void> {
  await writeFile(CASES_PATH, JSON.stringify(cases, null, 2), 'utf-8');
}

export async function loadPublishedCases(): Promise<Case[]> {
  const all = await loadCases();
  return all.filter((c) => (c.status ?? 'published') === 'published');
}

export async function getCaseBySlugStore(slug: string): Promise<Case | undefined> {
  const all = await loadCases();
  return all.find((c) => c.slug === slug);
}

export async function getRelatedCasesStore(caseId: string, limit = 3): Promise<Case[]> {
  const all = await loadPublishedCases();
  const current = all.find((c) => c.id === caseId);
  if (!current) return [];
  return all
    .filter((c) => c.id !== caseId && c.impactType === current.impactType)
    .slice(0, limit);
}
