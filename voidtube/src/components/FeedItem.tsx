'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CommentSection from './CommentSection';

export default function FeedItem({ item, currentUser }: { item: any, currentUser: any }) {
  const isVideo = item.type === 'video';
  const [liked, setLiked] = useState(false); // Simplified; usually fetch initial state
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const canDelete = !!currentUser && (currentUser.id === item.user_id || currentUser.isAdmin);

  const handleLike = async () => {
    if (!currentUser) return;
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId: item.id, targetType: item.type }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    const confirmed = window.confirm('Delete this content? This cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/content/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: item.id, targetType: item.type }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Delete failed');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', transition: 'transform 0.2s ease', animation: 'fadeIn 0.4s ease forwards' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
          {item.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <Link href={`/profile/${item.username}`} style={{ fontWeight: 'bold', fontSize: '16px' }}>
            @{item.username}
          </Link>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {isVideo && (
        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{item.title}</h3>
      )}

      {item.description && (
        <p style={{ marginBottom: isVideo ? '16px' : '0', fontSize: '15px', lineHeight: 1.5 }}>
          {item.description}
        </p>
      )}

      {isVideo && item.media && (
        <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
          <video 
            src={item.media} 
            controls 
            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
        <button 
          onClick={handleLike}
          style={{ background: 'none', color: liked ? 'var(--primary)' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }} 
           onMouseOver={(e) => !liked && (e.currentTarget.style.color = 'var(--primary)')}
           onMouseOut={(e) => !liked && (e.currentTarget.style.color = 'var(--text-muted)')}>
          <span style={{ fontSize: '18px' }}>{liked ? '❤️' : '🤍'}</span> Like
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          style={{ background: 'none', color: showComments ? 'var(--secondary)' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
           onMouseOver={(e) => !showComments && (e.currentTarget.style.color = 'var(--secondary)')}
           onMouseOut={(e) => !showComments && (e.currentTarget.style.color = 'var(--text-muted)')}>
          <span style={{ fontSize: '18px' }}>💬</span> Comment
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              marginLeft: 'auto',
              background: 'none',
              color: 'var(--danger)',
              opacity: isDeleting ? 0.6 : 1,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {showComments && (
        <CommentSection targetId={item.id} targetType={item.type} currentUser={currentUser} />
      )}
    </div>
  );
}
