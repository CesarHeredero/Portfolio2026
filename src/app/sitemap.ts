import type { MetadataRoute } from 'next';
import { loadPublishedCases } from '@/lib/content-store';

const BASE = 'https://cesarheredero.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const cases = await loadPublishedCases();

  const staticEs: MetadataRoute.Sitemap = [
    { url: `${BASE}/es`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/es/#work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];

  const staticEn: MetadataRoute.Sitemap = [
    { url: `${BASE}/en`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/en/#work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];

  const casesEs: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${BASE}/es/trabajo/${c.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  const casesEn: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${BASE}/en/work/${c.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  return [...staticEs, ...staticEn, ...casesEs, ...casesEn];
}
