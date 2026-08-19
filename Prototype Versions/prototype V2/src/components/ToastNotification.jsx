import React from 'react'

export default function ToastNotification({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 40,
      right: 24,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: 'var(--bg-elevated)',
            border: `1px solid ${t.type === 'error' ? 'var(--red)' : t.type === 'success' ? 'var(--green)' : 'var(--accent-primary)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            color: 'var(--text-primary)',
            fontSize: 12.5,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            animation: 'slideInUp 0.2s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: 'auto',
            minWidth: 260,
            maxWidth: 380,
          }}
        >
          <span>{t.type === 'error' ? '❌' : t.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span style={{ flex: 1, wordBreak: 'break-word' }}>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              border: 'none', background: 'transparent', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 13, padding: '0 2px',
            }}
          >
            ✕
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
