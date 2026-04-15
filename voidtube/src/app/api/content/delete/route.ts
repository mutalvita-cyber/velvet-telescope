import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

type DeleteTargetType = 'post' | 'video';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const targetId = typeof body?.targetId === 'string' ? body.targetId : '';
    const targetType = body?.targetType as DeleteTargetType;

    if (!targetId || (targetType !== 'post' && targetType !== 'video')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const db = getDb();

    if (targetType === 'video') {
      const video = db
        .prepare('SELECT id, user_id, file_path FROM videos WHERE id = ?')
        .get(targetId) as { id: string; user_id: string; file_path: string } | undefined;

      if (!video) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      if (!session.isAdmin && video.user_id !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const tx = db.transaction(() => {
        db.prepare('DELETE FROM comments WHERE target_id = ? AND target_type = ?').run(targetId, 'video');
        db.prepare('DELETE FROM likes WHERE target_id = ? AND target_type = ?').run(targetId, 'video');
        db.prepare('DELETE FROM videos WHERE id = ?').run(targetId);
      });

      tx();

      const normalizedPath = video.file_path.startsWith('/') ? video.file_path.slice(1) : video.file_path;
      const absolutePath = path.join(process.cwd(), 'public', normalizedPath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }

      return NextResponse.json({ success: true });
    }

    const post = db
      .prepare('SELECT id, user_id FROM posts WHERE id = ?')
      .get(targetId) as { id: string; user_id: string } | undefined;

    if (!post) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    if (!session.isAdmin && post.user_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM comments WHERE target_id = ? AND target_type = ?').run(targetId, 'post');
      db.prepare('DELETE FROM likes WHERE target_id = ? AND target_type = ?').run(targetId, 'post');
      db.prepare('DELETE FROM posts WHERE id = ?').run(targetId);
    });

    tx();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
