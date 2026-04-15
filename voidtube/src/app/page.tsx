import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ComposeBlock from '@/components/ComposeBlock';
import FeedItem from '@/components/FeedItem';

export default async function Home() {
  const session = await getSession();
  const db = getDb();

  // Fetch approved videos
  const videos = db.prepare(`
    SELECT v.id, v.title, v.description, v.file_path as media, v.created_at, u.username, 'video' as type
    FROM videos v
    JOIN users u ON v.user_id = u.id
    WHERE v.status = 'approved'
  `).all();

  // Fetch posts
  const posts = db.prepare(`
    SELECT p.id, p.content as description, null as media, p.created_at, u.username, 'post' as type
    FROM posts p
    JOIN users u ON p.user_id = u.id
  `).all();

  // Mix and sort by created_at DESC
  const feed = [...videos, ...posts].sort((a: any, b: any) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '24px' }}>Public Feed</h1>
      
      {session && <ComposeBlock />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
        {feed.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            The void is empty. Upload a video or write a post to start.
          </div>
        ) : (
          feed.map((item: any) => (
            <FeedItem key={item.id} item={item} currentUser={session} />
          ))
        )}
      </div>
    </div>
  );
}
