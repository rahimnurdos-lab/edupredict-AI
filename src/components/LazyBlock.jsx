import React from 'react';

export default function LazyBlock({ height = 240, label = 'Жүктелуде...' }) {
  return (
    <div
      className="glass-card"
      style={{
        minHeight: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fg-muted)',
        fontSize: '0.9rem',
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}
