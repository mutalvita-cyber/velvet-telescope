'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  };

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--primary)', fontSize: '32px' }}>●</span>
        VoidTube
      </Link>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {user ? (
          <>
            <Link href="/upload" className="btn-primary">
              + Upload
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
              <span style={{ fontWeight: 500 }}>{user.username}</span>
              {user.isAdmin && <span style={{ background: 'var(--danger)', fontSize: '12px', padding: '2px 6px', borderRadius: '4px' }}>ADMIN</span>}
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-secondary">Log In</Link>
            <Link href="/register" className="btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
