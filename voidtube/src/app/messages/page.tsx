import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import Link from 'next/link';

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const db = getDb();
  
  // Get users who we follow or who follow us to chat with
  const usersToChat = db.prepare(`
    SELECT DISTINCT u.id, u.username 
    FROM users u
    JOIN follows f ON (f.follower_id = ? AND f.following_id = u.id) 
                   OR (f.following_id = ? AND f.follower_id = u.id)
    WHERE u.id != ?
  `).all(session.id, session.id, session.id);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', height: '80vh', gap: '24px' }}>
      <div className="glass-panel" style={{ width: '300px', padding: '16px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--primary)' }}>Conversations</h2>
        {usersToChat.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Follow someone or get followers to start chatting.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {usersToChat.map((u: any) => (
              <Link 
                key={u.id} 
                href={`/messages/${u.username}`}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <span>@{u.username}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Select a conversation to start chatting.
      </div>
    </div>
  );
}
