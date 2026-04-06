import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './lib/auth';

// Create next-intl middleware for locale routing
const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip static assets and API routes
  const staticFilePattern = /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/i;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    staticFilePattern.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // First, handle locale routing with next-intl
  // This will automatically redirect / to /en (default locale)
  const intlResponse = intlMiddleware(req);
  
  // If intl middleware redirects (e.g., / to /en), return that redirect immediately
  if (intlResponse && (intlResponse.status === 307 || intlResponse.status === 308)) {
    return intlResponse;
  }
  
  // Get auth session
  const session = await auth();
  
  // Now extract locale from the processed pathname
  const locale = pathname.split('/')[1];
  const isValidLocale = routing.locales.includes(locale as 'id' | 'en');
  
  // Get path without locale for route checking
  const pathWithoutLocale = isValidLocale 
    ? pathname.replace(`/${locale}`, '') || '/'
    : pathname;
  
  // Check authentication from both NextAuth session and token cookie
  // Token cookie is set after login for server-side middleware access
  const tokenCookie = req.cookies.get('gipos_access_token');
  const tokenValue = tokenCookie?.value;
  
  // Validate token: must exist and not be empty
  // Next.js cookies API automatically decodes URL-encoded values
  const hasValidToken = !!tokenValue && tokenValue.trim().length > 0;
  const isLoggedIn = !!session?.user || hasValidToken;
  
  // Define public routes that don't require authentication
  // All other routes are considered protected
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  
  // Root path is public (landing page)
  const isRootPath = pathWithoutLocale === '/';
  
  // Allow access to public routes and root
  if (isPublicRoute || isRootPath) {
    // Redirect logged-in users away from login/register
    if (isLoggedIn && (pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/register'))) {
      const currentLocale = isValidLocale ? locale : routing.defaultLocale;
      const dashboardUrl = new URL(`/${currentLocale}/dashboard`, req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return intlResponse || NextResponse.next();
  }
  
  // Protect all other routes (require authentication)
  if (!isLoggedIn) {
    const currentLocale = isValidLocale ? locale : routing.defaultLocale;
    const loginUrl = new URL(`/${currentLocale}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return intlResponse || NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    '/',
    String.raw`/((?!api|_next|_vercel|.*\..*).*)`
  ]
};

