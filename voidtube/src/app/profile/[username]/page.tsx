import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import FeedItem from '@/components/FeedItem';
import FollowButton from '@/components/FollowButton';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const session = await getSession();
  const db = getDb();
  const { username } = await params;
  
  const user = db.prepare('SELECT id, username, bio, created_at FROM users WHERE username = ?').get(username) as any;
  if (!user) {
    notFound();
  }

  // Get following/follower counts
  const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(user.id) as { count: number };
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(user.id) as { count: number };

  let isFollowing = false;
  if (session && session.id !== user.id) {
    const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(session.id, user.id);
    if (follow) isFollowing = true;
  }

  // Get user's approved videos and posts
  const videos = db.prepare(`
    SELECT v.id, v.user_id, v.title, v.description, v.file_path as media, v.created_at, u.username, 'video' as type
    FROM videos v
    JOIN users u ON v.user_id = u.id
    WHERE v.user_id = ? AND v.status = 'approved'
  `).all(user.id);

  const posts = db.prepare(`
    SELECT p.id, p.user_id, p.content as description, null as media, p.created_at, u.username, 'post' as type
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
  `).all(user.id);

  const feed = [...videos, ...posts].sort((a: any, b: any) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '40px' }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>@{user.username}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Joined {new Date(user.created_at).toLocaleDateString()}</p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
            <span><strong style={{ color: 'white' }}>{followersCount.count}</strong> Followers</span>
            <span><strong style={{ color: 'white' }}>{followingCount.count}</strong> Following</span>
          </div>
        </div>
        {session && session.id !== user.id && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href={`/messages/${user.username}`} className="btn-secondary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center' }}>
              Message
            </Link>
            <FollowButton targetUserId={user.id} initialFollowing={isFollowing} />
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--secondary)' }}>Timeline</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {feed.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No posts or videos yet.
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
