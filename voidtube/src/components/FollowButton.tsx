'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FollowButton({ targetUserId, initialFollowing }: { targetUserId: string, initialFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    setLoading(true);
    await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    });
    
    setIsFollowing(!isFollowing);
    setLoading(false);
    router.refresh();
  };

  return (
    <button 
      onClick={handleFollow}
      disabled={loading}
      className={isFollowing ? "btn-secondary" : "btn-primary"} 
      style={{ padding: '10px 32px' }}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
