import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userSessionCookie = req.cookies.get("user_session")?.value;
    
    if (!userSessionCookie) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    const userSession = JSON.parse(userSessionCookie);
    return NextResponse.json(userSession);
  } catch (error) {
    console.error("Error getting user session:", error);
    return NextResponse.json(
      { error: "Failed to parse user session" },
      { status: 500 }
    );
  }
}
