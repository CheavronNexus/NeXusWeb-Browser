import React from 'react'
import { Lock, Radio, Shield, Zap } from 'lucide-react'

const MODES = [
  {
    id: 'strict',
    label: 'Strict',
    title: 'Strict Offline (Localhost Only)',
    icon: Lock,
    color: 'var(--accent-primary)',
  },
  {
    id: 'lan',
    label: 'LAN',
    title: 'Local Network (192.168.x.x / 10.x.x.x)',
    icon: Radio,
    color: 'var(--yellow)',
  },
  {
    id: 'normal',
    label: 'Normal',
    title: 'Normal Web Browsing (DuckDuckGo-style Privacy Shield)',
    icon: Shield,
    color: 'var(--green)',
  },
  {
    id: 'dev',
    label: 'Dev',
    title: 'Developer Mode (Unrestricted + DevTools)',
    icon: Zap,
    color: 'var(--accent-secondary)',
  },
]

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="mode-selector" title="Network & Privacy Mode">
      {MODES.map(m => {
        const IconComponent = m.icon
        const isActive = mode === m.id
        return (
          <button
            key={m.id}
            id={`mode-btn-${m.id}`}
            className={`mode-btn ${m.id} ${isActive ? 'active' : ''}`}
            onClick={() => onModeChange(m.id)}
            title={m.title}
          >
            <IconComponent size={12} style={{ color: isActive ? m.color : 'inherit', flexShrink: 0 }} />
            <span>{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

