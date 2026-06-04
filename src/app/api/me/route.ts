import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../../..//lib/auth';

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ userId });
}