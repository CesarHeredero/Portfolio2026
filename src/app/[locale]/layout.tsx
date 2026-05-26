import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ThemeScript } from '@/components/theme-script';
import { StatusBar } from '@/components/status-bar';
import { Nav } from '@/components/nav';
import { LangSetter } from '@/components/lang-setter';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title = 'César Heredero · Senior Product Owner';
  const description =
    locale === 'es'
      ? 'Product Owner con stack técnico. Conecto negocio, datos y tecnología. Madrid, España.'
      : 'Product Owner with a technical stack. I connect business, data and technology. Madrid, Spain.';

  return {
    title: {
      default: title,
      template: `%s · César Heredero`,
    },
    description,
    metadataBase: new URL('https://cesarheredero.com'),
    openGraph: {
      title,
      description,
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: '/es',
        en: '/en',
      },
    },
  };
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'César Heredero',
  jobTitle: 'Senior Product Owner',
  url: 'https://cesarheredero.com',
  sameAs: [
    'https://www.linkedin.com/in/cesarheredero',
    'https://read.cv/cesarheredero',
  ],
  knowsAbout: [
    'Product Management',
    'Technical SEO',
    'Web Analytics',
    'eCommerce',
    'Google Tag Manager',
    'BigQuery',
    'Schema.org',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Madrid',
    addressCountry: 'ES',
  },
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <>
      <ThemeScript />
      <LangSetter locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <NextIntlClientProvider messages={messages}>
        <a className="skip-link" href="#main-content">
          {locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
        </a>
        <StatusBar />
        <Nav />
        {children}
      </NextIntlClientProvider>
    </>
  );
}
