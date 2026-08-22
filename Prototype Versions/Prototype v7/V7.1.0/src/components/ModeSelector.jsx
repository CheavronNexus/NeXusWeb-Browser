import React from 'react'
import { Globe, Network, Shield, Terminal, Info } from 'lucide-react'

export default function ModeSelector({ mode = 'normal', onModeChange, onOpenModeInfo }) {
  // Sequence requested: Normal Mode | Lan Mode | Strict Mode | Dev Mode (i)
  const modes = [
    {
      id: 'normal',
      label: 'Normal Mode',
      shortLabel: 'Normal',
      icon: Globe,
      title: 'Normal Mode: Standard Web with DuckDuckGo Tracker Shield',
    },
    {
      id: 'lan',
      label: 'Lan Mode',
      shortLabel: 'LAN',
      icon: Network,
      title: 'Lan Mode: Local subnet and internal network servers',
    },
    {
      id: 'strict',
      label: 'Strict Mode',
      shortLabel: 'Strict',
      icon: Shield,
      title: 'Strict Mode: Air-gapped offline sandbox',
    },
    {
      id: 'dev',
      label: 'Dev Mode',
      shortLabel: 'Dev',
      icon: Terminal,
      hasInfo: true,
      title: 'Dev Mode: Localhost scanners, REST workbench, DOM inspector & terminal',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--glass-bg-capsule)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        padding: '2px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--glass-border)',
        gap: 2,
      }}
    >
      {modes.map((m) => {
        const isActive = mode === m.id
        const Icon = m.icon

        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            title={m.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: isActive ? 'var(--text-primary)' : 'transparent',
              color: isActive ? 'var(--bg-base)' : 'var(--text-secondary)',
              boxShadow: isActive ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
              cursor: 'pointer',
              fontSize: 10.5,
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={11} color={isActive ? 'var(--bg-base)' : 'currentColor'} />
            <span>{m.shortLabel}</span>
            {m.hasInfo && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenModeInfo?.(m.id)
                }}
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  opacity: isActive ? 0.9 : 0.7,
                  marginLeft: 2,
                  fontFamily: 'var(--font-mono)',
                  padding: '0 4px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(0, 0, 0, 0.18)' : 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Click for Mode Information & Guide"
              >
                (i)
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
