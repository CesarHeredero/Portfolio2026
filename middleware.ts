import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Only apply i18n middleware to locale-prefixed routes and root.
  // /admin, /api, and static files are intentionally excluded.
  matcher: ['/', '/(es|en)/:path*'],
};
