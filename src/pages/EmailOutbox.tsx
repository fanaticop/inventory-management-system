import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function EmailOutbox() {
  const [outbox, setOutbox] = useState<Array<any>>([]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('demo_email_outbox') || '[]';
    try {
      setOutbox(JSON.parse(raw));
    } catch {
      setOutbox([]);
    }
  }, []);

  const openPreview = (html: string) => {
    setPreview(html);
  };

  const closePreview = () => setPreview(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-gray-900 rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Demo Email Outbox</h2>
          <Link to="/" className="text-sm text-gray-300">Back to app</Link>
        </div>

        {outbox.length === 0 ? (
          <div className="text-gray-400">No demo emails have been sent yet.</div>
        ) : (
          <div className="space-y-4">
            {outbox.slice().reverse().map((m: any, idx: number) => (
              <div key={idx} className="p-4 bg-gray-800 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-300">To: <strong>{m.to}</strong></div>
                    <div className="text-xs text-gray-400">Sent: {new Date(m.sentAt).toLocaleString()}</div>
                    <div className="text-sm text-gray-200 mt-2">Subject: {m.subject}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => openPreview(m.content)}>Preview</button>
                    <button className="btn-ghost" onClick={() => { navigator.clipboard?.writeText(m.content); }}>Copy HTML</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {preview && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white max-w-3xl w-full rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Email Preview</h3>
                <button className="btn-ghost" onClick={closePreview}>Close</button>
              </div>
              <div className="border rounded overflow-auto" style={{ maxHeight: '60vh' }}>
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailOutbox;
