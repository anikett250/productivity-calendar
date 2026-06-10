import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("MIDDLEWARE TOKEN:", token);

  return NextResponse.next();
}

export const config = {
  matcher: ["/calendar/:path*"],
};