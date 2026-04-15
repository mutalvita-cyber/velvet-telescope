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

    const { receiverId, content } = await req.json();

    if (!receiverId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const db = getDb();
    
    // Optional: check if receiver exists
    const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiverId);
    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, content)
      VALUES (?, ?, ?, ?)
    `).run(id, session.id, receiverId, content.trim());

    return NextResponse.json({ success: true, messageId: id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
