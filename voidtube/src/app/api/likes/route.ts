import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, targetType } = await req.json();

    if (!targetId || !targetType) {
      return NextResponse.json({ error: 'Missing targetId or targetType' }, { status: 400 });
    }

    const db = getDb();
    
    // Check if already liked
    const existing = db.prepare(`
      SELECT 1 FROM likes 
      WHERE user_id = ? AND target_id = ? AND target_type = ?
    `).get(session.id, targetId, targetType);

    if (existing) {
      // Unlike
      db.prepare(`
        DELETE FROM likes 
        WHERE user_id = ? AND target_id = ? AND target_type = ?
      `).run(session.id, targetId, targetType);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      db.prepare(`
        INSERT INTO likes (user_id, target_id, target_type)
        VALUES (?, ?, ?)
      `).run(session.id, targetId, targetType);
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
