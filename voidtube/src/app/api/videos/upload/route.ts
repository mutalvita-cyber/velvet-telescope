import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Check if user has 3 or more pending videos
    const pendingCount = db.prepare('SELECT COUNT(*) as count FROM videos WHERE user_id = ? AND status = ?')
      .get(session.id, 'pending') as { count: number };
      
    if (pendingCount.count >= 3) {
      return NextResponse.json({ error: 'You have reached the maximum limit of 3 pending videos. Wait for admin approval.' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    // Basic check for video type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Only video files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.mp4';
    const filename = `${uuidv4()}${ext}`;
    const publicPath = `/uploads/${filename}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const id = uuidv4();
    db.prepare(`
      INSERT INTO videos (id, user_id, title, description, file_path, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, session.id, title, description, publicPath, 'pending');

    return NextResponse.json({ success: true, videoId: id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
