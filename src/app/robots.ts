import type { MetadataRoute } from 'next';

const PROD_HOST = 'cesarheredero.com';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL ?? '';
  const isProd =
    siteUrl === `https://${PROD_HOST}` ||
    siteUrl === `https://www.${PROD_HOST}`;

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
