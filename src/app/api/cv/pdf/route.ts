import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { CvPDF } from '@/lib/cv-pdf';

export const runtime = 'nodejs';

type SiteJson = {
  name?: string;
  role?: string;
  email?: string;
  linkedin?: string;
  content?: {
    statusBar?: { role?: string };
    about?: { name?: string; expValue?: string; locationValue?: string };
    hero?: { expValue?: string; locationValue?: string };
  };
};

export async function GET() {
  try {
    const [cvRaw, siteRaw] = await Promise.all([
      readFile(path.join(process.cwd(), 'content', 'cv.json'), 'utf-8'),
      readFile(path.join(process.cwd(), 'content', 'site.json'), 'utf-8'),
    ]);

    const cv = JSON.parse(cvRaw) as {
      experience: { id: string; year: string; role: string; company: string; description: { es: string; en: string }; tags?: string[]; award?: { es: string; en: string } }[];
      skills: { group: string; items: string[] }[];
      education: { group: string; items: string[] }[];
    };
    const siteData = JSON.parse(siteRaw) as SiteJson;
    const c = siteData.content;

    const site = {
      name: c?.about?.name || siteData.name || 'César Heredero Herranz',
      role: c?.statusBar?.role || siteData.role || 'Senior Product Owner & UX Strategist',
      email: siteData.email || 'hola@cesarheredero.com',
      linkedin: siteData.linkedin || 'linkedin.com/in/cesarheredero',
      expValue: c?.about?.expValue || c?.hero?.expValue || '10+ años',
      location: c?.about?.locationValue || c?.hero?.locationValue || 'Madrid · Remoto OK',
    };

    // renderToBuffer expects ReactElement<DocumentProps> — cast needed due to lib type mismatch
    const element = React.createElement(CvPDF, { cv, site }) as unknown as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(element);

    // Convert Node.js Buffer → ArrayBuffer for NextResponse BodyInit compatibility
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

    return new NextResponse(ab, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cesar-heredero-cv.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 });
  }
}
