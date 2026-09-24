import { readFile } from 'fs/promises';
import path from 'path';
import { CVSection, type CvData } from './cv-section';
import cvSeed from '@/../content/cv.json';

export async function CVSectionServer() {
  let cv: CvData = cvSeed as CvData;
  try {
    const raw = await readFile(path.join(process.cwd(), 'content', 'cv.json'), 'utf-8');
    cv = JSON.parse(raw) as CvData;
  } catch {
    /* use seed */
  }
  return <CVSection cv={cv} />;
}
