import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/lib/content';
import { loadCases, getCaseBySlugStore, getRelatedCasesStore } from '@/lib/content-store';
import { CaseDetail } from '@/components/case-detail';
import { Footer } from '@/components/footer';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const cases = await loadCases();
  return cases
    .filter((c) => (c.status ?? 'published') === 'published')
    .map((c) => ({ locale: 'en', slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = await getCaseBySlugStore(slug);

  if (!c) return { title: 'Case not found' };

  const l = locale as Locale;
  const title = c.title[l];
  const description = c.teaser[l];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://cesarheredero.com/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'es' ? 'Trabajo' : 'Work',
        item: `https://cesarheredero.com/${locale}/#work`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `https://cesarheredero.com/${locale}/work/${slug}`,
      },
    ],
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    other: {
      'application/ld+json': JSON.stringify(breadcrumbJsonLd),
    },
  };
}

export default async function CaseDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const c = await getCaseBySlugStore(slug);

  if (!c) notFound();
  const safeCase = c as NonNullable<typeof c>;

  const isDraft = (safeCase.status ?? 'published') === 'draft';
  if (isDraft) {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('ch_admin')?.value === 'authenticated';
    if (!isAdmin) notFound();
  }

  const l = locale as Locale;
  const related = await getRelatedCasesStore(safeCase.id);
  const t = await getTranslations({ locale, namespace: 'case' });
  const tw = await getTranslations({ locale, namespace: 'work' });

  const caseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: safeCase.title[l],
    description: safeCase.teaser[l],
    author: {
      '@type': 'Person',
      name: 'César Heredero',
    },
    dateCreated: safeCase.year,
    keywords: safeCase.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseJsonLd) }}
      />
      <CaseDetail
        case_={safeCase}
        locale={l}
        related={related}
        backLabel={t('back')}
        problemLabel={t('problem')}
        actionLabel={t('action')}
        impactLabel={t('impact')}
        tagsLabel={t('tags')}
        relatedLabel={t('relatedCases')}
        readCaseLabel={tw('readCase')}
        featuredLabel={tw('featured')}
        isDraft={isDraft}
      />
      <Footer />
    </>
  );
}
