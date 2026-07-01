import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('ch_admin')?.value === 'authenticated';
}

type MyMemoryResponse = {
  responseData?: { translatedText?: string };
  responseStatus?: number;
};

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ translated: '' });

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`;
  const res = await fetch(url, { headers: { 'User-Agent': 'portfolio-admin/1.0' } });
  const data = (await res.json()) as MyMemoryResponse;

  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return NextResponse.json({ translated: data.responseData.translatedText });
  }
  return NextResponse.json({ error: 'No se pudo traducir' }, { status: 500 });
}
