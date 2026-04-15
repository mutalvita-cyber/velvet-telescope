import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'VoidTube - Free & Anonymous',
  description: 'A platform blending YouTube, Instagram, and Twitter functionalities without the privacy policies.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Navbar user={session} />
          <Sidebar user={session} />
          <main className="main-content animate-fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
