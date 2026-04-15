'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ComposeBlock() {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const router = useRouter();

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    setContent('');
    setPosting(false);
    router.refresh();
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <textarea
        className="input-field"
        placeholder="What's happening in the void?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        style={{ resize: 'none' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn-primary" 
          onClick={handlePost}
          disabled={posting || !content.trim()}
          style={{ padding: '8px 24px', opacity: (posting || !content.trim()) ? 0.6 : 1 }}
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
