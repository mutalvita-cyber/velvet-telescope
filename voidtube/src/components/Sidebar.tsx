'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Discover', href: '/discover', icon: '✨' },
  ];

  if (user) {
    links.push({ name: 'Following', href: '/following', icon: '👥' });
    links.push({ name: 'Messages', href: '/messages', icon: '💬' });
    links.push({ name: 'Profile', href: `/profile/${user.username}`, icon: '👤' });
  }

  if (user?.isAdmin) {
    links.push({ name: 'Admin Approvals', href: '/admin/approvals', icon: '🛡️' });
  }

  return (
    <aside className="glass-panel" style={{
      position: 'fixed',
      top: '70px',
      left: 0,
      bottom: 0,
      width: '260px',
      padding: '24px 16px',
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.name}
            href={link.href}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
              fontWeight: isActive ? 600 : 500,
              background: isActive ? 'rgba(255, 46, 147, 0.15)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseOut={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px' }}>{link.icon}</span>
            {link.name}
          </Link>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        <p>No privacy policies.</p>
        <p>Free for all. Anonymous.</p>
        <p style={{ marginTop: '8px', color: 'var(--danger)', fontWeight: 'bold' }}>NO PORN CONTENT.</p>
      </div>
    </aside>
  );
}
