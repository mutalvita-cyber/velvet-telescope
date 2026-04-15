import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, targetType, content } = await req.json();

    if (!targetId || !targetType || !content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO comments (id, user_id, target_id, target_type, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, session.id, targetId, targetType, content.trim());

    return NextResponse.json({ success: true, commentId: id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');

    if (!targetId || !targetType) {
      return NextResponse.json({ error: 'Missing targetId or targetType' }, { status: 400 });
    }

    const db = getDb();
    const comments = db.prepare(`
      SELECT c.*, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE target_id = ? AND target_type = ?
      ORDER BY created_at DESC
    `).all(targetId, targetType);

    return NextResponse.json(comments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
