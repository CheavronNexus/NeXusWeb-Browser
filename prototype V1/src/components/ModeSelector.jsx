import React from 'react'

const MODES = [
  {
    id: 'strict',
    label: 'Strict',
    title: 'Strict Offline',
    icon: '🔒',
    color: 'var(--accent-primary)',
  },
  {
    id: 'lan',
    label: 'LAN',
    title: 'Local Network',
    icon: '📡',
    color: 'var(--green)',
  },
  {
    id: 'dev',
    label: 'Dev',
    title: 'Developer Mode',
    icon: '⚡',
    color: 'var(--accent-secondary)',
  },
]

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="mode-selector" title="Network Mode">
      {MODES.map(m => (
        <button
          key={m.id}
          id={`mode-btn-${m.id}`}
          className={`mode-btn ${m.id} ${mode === m.id ? 'active' : ''}`}
          onClick={() => onModeChange(m.id)}
          title={m.title}
        >
          <span className="mode-dot" style={{ background: mode === m.id ? m.color : undefined }} />
          <span>{m.icon} {m.label}</span>
        </button>
      ))}
    </div>
  )
}
