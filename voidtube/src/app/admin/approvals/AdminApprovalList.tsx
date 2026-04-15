'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminApprovalList({ initialVideos }: { initialVideos: any[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const router = useRouter();

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/videos/${id}/${action}`, { method: 'POST' });
    if (res.ok) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      router.refresh();
    } else {
      alert('Action failed');
    }
  };

  if (videos.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No pending videos.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {videos.map((video) => (
        <div key={video.id} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <video 
              src={video.file_path} 
              controls 
              style={{ width: '100%', borderRadius: '8px', background: '#000', maxHeight: '400px' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{video.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                Uploaded by <strong style={{ color: 'var(--secondary)' }}>@{video.username}</strong> on {new Date(video.created_at).toLocaleString()}
              </p>
              <p style={{ fontSize: '15px' }}>{video.description}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, background: 'var(--success)', boxShadow: '0 4px 15px rgba(0,200,81,0.3)' }}
                onClick={() => handleAction(video.id, 'approve')}
              >
                Approve
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 1, background: 'var(--danger)', boxShadow: '0 4px 15px rgba(255,68,68,0.3)' }}
                onClick={() => handleAction(video.id, 'reject')}
              >
                Reject & Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
