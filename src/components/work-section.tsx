import { readFile } from 'fs/promises';
import path from 'path';
import { CASES, type Case } from '@/lib/content';
import { WorkSectionClient } from './work-section-client';

export async function WorkSection() {
  let statuses: Record<string, string> = {};
  try {
    const statusPath = path.join(process.cwd(), 'content', 'status.json');
    const raw = await readFile(statusPath, 'utf-8');
    statuses = JSON.parse(raw) as Record<string, string>;
  } catch {
    // default: all published
  }

  const publishedCases: Case[] = CASES.filter(
    (c) => (statuses[c.id] ?? 'published') === 'published'
  );

  return <WorkSectionClient cases={publishedCases} />;
}
