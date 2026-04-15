import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import ChatBox from './ChatBox';

export default async function ConversationPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const db = getDb();
  const { username } = await params;
  
  const otherUser = db.prepare('SELECT id, username FROM users WHERE username = ?').get(username) as any;
  if (!otherUser) {
    redirect('/messages');
  }

  // Get messages between the two users
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `).all(session.id, otherUser.id, otherUser.id, session.id);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', height: '80vh', gap: '24px' }}>
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
            {otherUser.username.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '20px' }}>@{otherUser.username}</h2>
        </div>

        <ChatBox initialMessages={messages} currentUserId={session.id} otherUserId={otherUser.id} />
      </div>
    </div>
  );
}
