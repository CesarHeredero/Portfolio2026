import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { BentoGrid } from '@/components/bento-grid';
import { WorkSection } from '@/components/work-section';
import { AboutSection } from '@/components/about-section';
import { ProcessSection } from '@/components/process-section';
import { CVSection } from '@/components/cv-section';
import { PlaygroundSection } from '@/components/playground-section';
import { ContactSection } from '@/components/contact-section';
import { Footer } from '@/components/footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'es' ? 'Portfolio · César Heredero' : 'Portfolio · César Heredero',
  };
}

export default function HomePage() {
  return (
    <>
      <main id="main-content">
        <Hero />
        <BentoGrid />
        <div className="sec-sep" aria-hidden="true" />
        <WorkSection />
        <div className="sec-sep" aria-hidden="true" />
        <AboutSection />
        <div className="sec-sep" aria-hidden="true" />
        <ProcessSection />
        <div className="sec-sep" aria-hidden="true" />
        <CVSection />
        <div className="sec-sep" aria-hidden="true" />
        <PlaygroundSection />
        <div className="sec-sep" aria-hidden="true" />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
