import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('session');

    // Routes to protect
    const protectedPaths = ['/calendrier', '/ma-disponibilite'];
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    // If trying to access protected route without session
    if (isProtectedPath && !sessionCookie) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // If accessing login/root while logged in, redirect to calendar
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') && sessionCookie) {
        try {
            // Rudimentary check if cookie is valid JSON
            JSON.parse(sessionCookie.value);
            const url = request.nextUrl.clone();
            url.pathname = '/calendrier';
            return NextResponse.redirect(url);
        } catch {
            // If cookie is invalid, let them go to login (and it will overwrite bad cookie later)
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    ],
};
