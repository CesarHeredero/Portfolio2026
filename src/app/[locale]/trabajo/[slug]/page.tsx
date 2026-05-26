import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCaseBySlug, CASES, type Locale } from '@/lib/content';
import { CaseDetail } from '@/components/case-detail';
import { Footer } from '@/components/footer';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return CASES.flatMap((c) => [
    { locale: 'es', slug: c.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = getCaseBySlug(slug);

  if (!c) return { title: 'Caso no encontrado' };

  const l = locale as Locale;
  const title = c.title[l];
  const description = c.teaser[l];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function TrabajoDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const c = getCaseBySlug(slug);

  if (!c) notFound();

  const l = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'case' });
  const tw = await getTranslations({ locale, namespace: 'work' });

  const caseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: c.title[l],
    description: c.teaser[l],
    author: {
      '@type': 'Person',
      name: 'César Heredero',
    },
    dateCreated: c.year,
    keywords: c.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseJsonLd) }}
      />
      <CaseDetail
        case_={c}
        locale={l}
        backLabel={t('back')}
        problemLabel={t('problem')}
        actionLabel={t('action')}
        impactLabel={t('impact')}
        tagsLabel={t('tags')}
        relatedLabel={t('relatedCases')}
        readCaseLabel={tw('readCase')}
        featuredLabel={tw('featured')}
      />
      <Footer />
    </>
  );
}
