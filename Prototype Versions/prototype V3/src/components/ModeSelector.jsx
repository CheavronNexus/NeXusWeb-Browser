import React from 'react'

const MODES = [
  {
    id: 'strict',
    label: 'Strict',
    title: 'Strict Offline (Localhost Only)',
    icon: '🔒',
    color: 'var(--accent-primary)',
  },
  {
    id: 'lan',
    label: 'LAN',
    title: 'Local Network (192.168.x.x / 10.x.x.x)',
    icon: '📡',
    color: 'var(--yellow)',
  },
  {
    id: 'normal',
    label: 'Normal',
    title: 'Normal Web Browsing (DuckDuckGo-style Privacy Shield)',
    icon: '🛡️',
    color: 'var(--green)',
  },
  {
    id: 'dev',
    label: 'Dev',
    title: 'Developer Mode (Unrestricted + DevTools)',
    icon: '⚡',
    color: 'var(--accent-secondary)',
  },
]

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="mode-selector" title="Network & Privacy Mode">
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
