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

    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO posts (id, user_id, content)
      VALUES (?, ?, ?)
    `).run(id, session.id, content.trim());

    return NextResponse.json({ success: true, postId: id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
