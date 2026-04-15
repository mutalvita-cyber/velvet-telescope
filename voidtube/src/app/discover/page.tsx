import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import FeedItem from '@/components/FeedItem';

export default async function DiscoverPage() {
  const session = await getSession();
  const db = getDb();

  // Fetch approved videos, ordered by views or random. For now, random.
  const videos = db.prepare(`
    SELECT v.id, v.title, v.description, v.file_path as media, v.created_at, u.username, 'video' as type
    FROM videos v
    JOIN users u ON v.user_id = u.id
    WHERE v.status = 'approved'
    ORDER BY RANDOM()
    LIMIT 20
  `).all();

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', color: 'var(--secondary)', marginBottom: '8px' }}>Discover Options</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Explore the void. Randomly selected approved videos.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {videos.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No videos to discover yet.
          </div>
        ) : (
          videos.map((item: any) => (
            <FeedItem key={item.id} item={item} currentUser={session} />
          ))
        )}
      </div>
    </div>
  );
}
