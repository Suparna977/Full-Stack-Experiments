import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function decodePart(part) {
  try {
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(part.length + ((4 - (part.length % 4)) % 4), '=');
    return JSON.stringify(JSON.parse(atob(padded)), null, 2);
  } catch {
    return '(could not decode)';
  }
}

export default function TokenInspector() {
  const { token } = useAuth();
  if (!token) return null;

  const [headerPart, payloadPart, signaturePart] = token.split('.');

  return (
    <div className="main-content" style={{ paddingBottom: 0 }}>
      <div
        style={{
          background: '#111827',
          color: '#e5e7eb',
          borderRadius: 10,
          padding: 16,
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: 12,
          overflowX: 'auto',
          marginBottom: 20,
        }}
      >
        <div style={{ marginBottom: 10, color: '#9ca3af' }}>Raw token (this is what sits in localStorage):</div>
        <div style={{ wordBreak: 'break-all', marginBottom: 16, color: '#60a5fa' }}>{token}</div>

        <div style={{ marginBottom: 10, color: '#9ca3af' }}>Decoded Header:</div>
        <pre style={{ margin: '0 0 16px', color: '#fca5a5' }}>{decodePart(headerPart)}</pre>

        <div style={{ marginBottom: 10, color: '#9ca3af' }}>Decoded Payload (your role lives here):</div>
        <pre style={{ margin: '0 0 16px', color: '#86efac' }}>{decodePart(payloadPart)}</pre>

        <div style={{ marginBottom: 10, color: '#9ca3af' }}>Signature (proves the payload wasn't tampered with):</div>
        <div style={{ wordBreak: 'break-all', color: '#fcd34d' }}>{signaturePart}</div>
      </div>
    </div>
  );
}
