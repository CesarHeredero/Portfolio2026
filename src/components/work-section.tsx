import { loadPublishedCases } from '@/lib/content-store';
import { WorkSectionClient } from './work-section-client';

export async function WorkSection() {
  const cases = await loadPublishedCases();
  return <WorkSectionClient cases={cases} />;
}
