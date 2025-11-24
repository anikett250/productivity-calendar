import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userSessionCookie = req.cookies.get("user_session")?.value;
    
    if (!userSessionCookie) {
      return NextResponse.json({ data: null });
    }

    const userSession = JSON.parse(userSessionCookie);
    return NextResponse.json(userSession);
  } catch (error) {
    console.error("Error getting user session:", error);
    return NextResponse.json({ data: null });
  }
}
