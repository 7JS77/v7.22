import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - _next (Next.js internals)
  // - api routes
  // - static files
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
