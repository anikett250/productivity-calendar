import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check for user_session cookie (from custom login) or NextAuth session token
  const userSession = request.cookies.get("user_session")?.value;
  const nextAuthToken = request.cookies.get("next-auth.session-token")?.value;

  // If trying to access protected routes
  if (path.startsWith("/calendar")) {
    // Allow if either session exists
    if (!userSession && !nextAuthToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/calendar/:path*"],
};
