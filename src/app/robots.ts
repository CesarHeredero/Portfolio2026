import type { MetadataRoute } from 'next';

const PROD_HOST = 'cesarheredero.com';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.VERCEL_URL ?? '';
  const isProd =
    process.env.APP_ENV === 'production' ||
    host === PROD_HOST ||
    host.endsWith(`.${PROD_HOST}`);

  if (!isProd) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `https://${PROD_HOST}/sitemap.xml`,
    host: `https://${PROD_HOST}`,
  };
}
