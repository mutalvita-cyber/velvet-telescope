import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import AdminApprovalList from './AdminApprovalList';

export default async function AdminApprovalsPage() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    redirect('/');
  }

  const db = getDb();
  const pendingVideos = db.prepare(`
    SELECT v.*, u.username 
    FROM videos v
    JOIN users u ON v.user_id = u.id
    WHERE v.status = 'pending'
    ORDER BY v.created_at ASC
  `).all();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '24px' }}>Admin Approvals</h1>
      <AdminApprovalList initialVideos={pendingVideos} />
    </div>
  );
}
