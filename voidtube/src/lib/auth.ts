import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-prod';

export type SessionUser = {
  id: string;
  username: string;
  isAdmin: boolean;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    // Verify user still exists
    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.id);
    if (!user) return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
