import React from 'react'

const MODE_META = {
  strict: { label: 'Strict Offline',  dot: 'offline',  badge: 'strict' },
  lan:    { label: 'Local Network',   dot: 'partial',  badge: 'lan'    },
  dev:    { label: 'Developer Mode',  dot: 'online',   badge: 'dev'    },
}

function getUrlStatus(url) {
  if (!url || url === 'nexusweb://home') return { icon: '⌂', text: 'Home' }
  if (url.startsWith('file://'))  return { icon: '📁', text: 'Local File' }
  if (url.match(/^https?:\/\/(localhost|127\.0\.0\.1)/)) return { icon: '⬡', text: 'Localhost' }
  if (url.match(/^https?:\/\/(192\.168\.|10\.|172\.)/)) return { icon: '📡', text: 'LAN' }
  return { icon: '🌐', text: 'Remote' }
}

export default function StatusBar({ mode, url, loading, onShortcutsHelp }) {
  const meta = MODE_META[mode] || MODE_META.strict
  const urlStatus = getUrlStatus(url)

  return (
    <div className="status-bar">
      {/* Mode */}
      <div className="status-item">
        <span className={`status-dot ${meta.dot}`} />
        <span className={`status-mode-badge ${meta.badge}`}>{meta.label}</span>
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />

      {/* URL status */}
      <div className="status-item">
        <span>{urlStatus.icon}</span>
        <span>{urlStatus.text}</span>
      </div>

      {/* Loading indicator */}
      {loading && (
        <>
          <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />
          <div className="status-item" style={{ color: 'var(--accent-primary)' }}>
            <span className="tab-spinner" style={{ width: 10, height: 10 }} />
            Loading…
          </div>
        </>
      )}

      <div className="status-spacer" />

      {/* Network rules */}
      <div className="status-item" style={{ gap: 10 }}>
        <span title="Internet access">
          🌐 {mode === 'dev' ? <span style={{ color: 'var(--yellow)' }}>Optional</span> : <span style={{ color: 'var(--red)' }}>Off</span>}
        </span>
        <span title="LAN access">
          📡 {mode !== 'strict' ? <span style={{ color: 'var(--green)' }}>On</span> : <span style={{ color: 'var(--red)' }}>Off</span>}
        </span>
        <span title="Localhost access">
          ⬡ <span style={{ color: 'var(--green)' }}>On</span>
        </span>
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />

      {/* Version */}
      <div className="status-item" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
        NeXusWeb v1.0.0
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />

      {/* Keyboard shortcuts hint */}
      <button
        id="status-shortcuts-btn"
        onClick={onShortcutsHelp}
        style={{
          border: 'none', background: 'transparent', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: 10, padding: '0 4px',
          transition: 'color var(--t-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        title="Keyboard Shortcuts (F1)"
      >
        ⌨ F1
      </button>
    </div>
  )
}
