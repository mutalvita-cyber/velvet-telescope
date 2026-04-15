'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must agree to the terms regarding no pornographic content.');
      return;
    }
    if (!file) {
      setError('Please select a video file.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }} className="glass-panel">
      <div style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--primary)' }}>Upload Video</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Your video will be pending admin approval (max 3 pending per user).
        </p>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px', background: 'rgba(255,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Title</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Epic moment #1"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Description</label>
            <textarea
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this video..."
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '8px' }}>
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--danger)' }}
            />
            <label htmlFor="agree" style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: 'bold' }}>
              I confirm that this video contains NO PORNOGRAPHIC content. I understand that violation will lead to an immediate ban.
            </label>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '16px', opacity: uploading ? 0.7 : 1 }} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
}
