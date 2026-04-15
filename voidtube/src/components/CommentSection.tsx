'use client';

import { useState, useEffect } from 'react';

export default function CommentSection({ targetId, targetType, currentUser }: { targetId: string, targetType: string, currentUser: any }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?targetId=${targetId}&targetType=${targetType}`);
    const data = await res.json();
    if (res.ok) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, [targetId, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setLoading(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, targetType, content: newComment }),
    });

    if (res.ok) {
      setNewComment('');
      fetchComments();
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
      {currentUser && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ fontSize: '14px', padding: '8px 12px' }}
          />
          <button type="submit" className="btn-primary" disabled={loading || !newComment.trim()} style={{ padding: '8px 16px', fontSize: '14px' }}>
            Post
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {comments.map((comment) => (
          <div key={comment.id} style={{ fontSize: '14px' }}>
            <span style={{ fontWeight: 600, color: 'var(--secondary)', marginRight: '8px' }}>@{comment.username}</span>
            <span style={{ color: 'var(--text)' }}>{comment.content}</span>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {comments.length === 0 && !loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
