'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError(data.error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }} className="glass-panel">
      <div style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--primary)' }}>Join VoidTube</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Free for all. Anonymous. No tracking.</p>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Username</label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. shadow_ninja"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
            <strong>WARNING:</strong> By signing up, you agree not to upload any pornographic content. Content violations result in an immediate ban.
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Create Account</button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--secondary)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
