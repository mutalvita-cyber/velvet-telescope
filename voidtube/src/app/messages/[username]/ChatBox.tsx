'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatBox({ initialMessages, currentUserId, otherUserId }: { initialMessages: any[], currentUserId: string, otherUserId: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    const tempMsg = {
      id: Math.random().toString(),
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content,
      created_at: new Date().toISOString()
    };

    setMessages([...messages, tempMsg]);
    setContent('');

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: otherUserId, content: tempMsg.content })
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <div style={{
                background: isMine ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
                border: isMine ? 'none' : '1px solid var(--surface-border)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomRightRadius: isMine ? '4px' : '16px',
                borderBottomLeftRadius: isMine ? '16px' : '4px',
                color: 'white',
              }}>
                {msg.content}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: isMine ? 'right' : 'left' }}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Send an anonymous message..."
          className="input-field"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" disabled={sending || !content.trim()}>
          Send
        </button>
      </form>
    </>
  );
}
