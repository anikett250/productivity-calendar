import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath = path === '/' || path === '/login';

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to login if not authenticated and trying to access a protected route
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow authenticated users to access public paths without forcing a redirect
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: ['/', '/login', '/calendar'],
};