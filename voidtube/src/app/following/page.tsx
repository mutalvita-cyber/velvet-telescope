import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import FeedItem from '@/components/FeedItem';

export default async function FollowingPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const db = getDb();

  // Fetch approved videos from following
  const videos = db.prepare(`
    SELECT v.id, v.user_id, v.title, v.description, v.file_path as media, v.created_at, u.username, 'video' as type
    FROM videos v
    JOIN users u ON v.user_id = u.id
    JOIN follows f ON f.following_id = u.id
    WHERE f.follower_id = ? AND v.status = 'approved'
  `).all(session.id);

  // Fetch posts from following
  const posts = db.prepare(`
    SELECT p.id, p.user_id, p.content as description, null as media, p.created_at, u.username, 'post' as type
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN follows f ON f.following_id = u.id
    WHERE f.follower_id = ?
  `).all(session.id);

  // Mix and sort by created_at DESC
  const feed = [...videos, ...posts].sort((a: any, b: any) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '32px' }}>Following Feed</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {feed.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            You aren't following anyone with content yet.
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
