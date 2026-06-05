import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET || "default_super_secret_key_change_me_in_prod";
const encodedKey = new TextEncoder().encode(secretKey);

const publicRoutes = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Skip middleware for API, static assets, images, etc.
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get('session')?.value;
  
  if (!isPublicRoute) {
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isPublicRoute && cookie) {
    try {
      await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });
      return NextResponse.redirect(new URL('/', request.url));
    } catch (e) {
      // Invalid cookie, let them stay on public route
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)'],
}
