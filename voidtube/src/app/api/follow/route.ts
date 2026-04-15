import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId || targetUserId === session.id) {
      return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });
    }

    const db = getDb();
    
    // Check if already following
    const exists = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?')
      .get(session.id, targetUserId);

    if (exists) {
      // Unfollow
      db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?')
        .run(session.id, targetUserId);
      return NextResponse.json({ success: true, isFollowing: false });
    } else {
      // Follow
      db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)')
        .run(session.id, targetUserId);
      return NextResponse.json({ success: true, isFollowing: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
