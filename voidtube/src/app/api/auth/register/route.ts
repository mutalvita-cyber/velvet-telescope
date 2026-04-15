import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password || username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid username or password length' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);

    db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
      .run(id, username, hash);

    await setSession({ id, username, isAdmin: false });

    return NextResponse.json({ success: true, user: { id, username } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
