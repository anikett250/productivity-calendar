import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getUserIdFromRequest } from '../../../../lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('calendarDB');

    // Find user to get email and Google provider ID
    const user = await db.collection('users').findOne({ userId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all user data
    await Promise.all([
      db.collection('users').deleteOne({ userId }),
      db.collection('todos').deleteMany({ userId }),
      db.collection('events').deleteMany({ userId }),
      db.collection('tasks').deleteMany({ userId }),
    ]);

    // If user has Google linked, also try to delete from accounts collection
    if (user.googleProviderId) {
      await db.collection('accounts').deleteMany({ providerAccountId: user.googleProviderId });
    }

    return NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
