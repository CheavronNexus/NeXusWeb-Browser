import React from 'react'
import { Folder, Radio, Lock, Globe, Volume2, Shield, Split, Keyboard, Cpu, Home } from 'lucide-react'

const MODE_META = {
  strict: { label: 'Strict Offline',  dot: 'offline',  badge: 'strict' },
  lan:    { label: 'Local Network',   dot: 'partial',  badge: 'lan'    },
  normal: { label: 'Normal Web',      dot: 'online',   badge: 'normal' },
  dev:    { label: 'Developer Mode',  dot: 'online',   badge: 'dev'    },
}

function getUrlStatus(url) {
  if (!url || url === 'nexusweb://home') return { icon: <Home size={12} />, text: 'Home' }
  if (url.startsWith('file://'))  return { icon: <Folder size={12} />, text: 'Local File' }
  if (url.match(/^https?:\/\/(localhost|127\.0\.0\.1)/)) return { icon: <Cpu size={12} />, text: 'Localhost' }
  if (url.match(/^https?:\/\/(192\.168\.|10\.|172\.)/)) return { icon: <Radio size={12} />, text: 'LAN' }
  if (url.startsWith('https://')) return { icon: <Lock size={12} />, text: 'Secure Web' }
  return { icon: <Globe size={12} />, text: 'Web' }
}

export default function StatusBar({
  mode, url, loading, detectedServersCount, zoomFactor = 1.0, isSplitView, privacyStats,
  isAudioPlaying, onToggleMediaHUD,
  onShortcutsHelp, onZoomIn, onZoomOut, onZoomReset, onOpenPorts,
}) {
  const meta = MODE_META[mode] || MODE_META.normal
  const urlStatus = getUrlStatus(url)
  const zoomPercent = Math.round(zoomFactor * 100)

  return (
    <div className="status-bar">
      {/* Mode */}
      <div className="status-item">
        <span className={`status-dot ${meta.dot}`} />
        <span className={`status-mode-badge ${meta.badge}`}>{meta.label}</span>
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />

      {/* URL status */}
      <div className="status-item" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>{urlStatus.icon}</span>
        <span>{urlStatus.text}</span>
      </div>

      {/* Media Playing Indicator Pill */}
      {isAudioPlaying && (
        <>
          <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />
          <div
            className="status-item"
            id="status-media-hud-btn"
            onClick={onToggleMediaHUD}
            style={{
              color: 'var(--accent-primary)',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: 600,
              background: 'rgba(0, 212, 255, 0.1)',
              padding: '1px 8px',
              borderRadius: 10,
              border: '1px solid var(--border-bright)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            title="Media Playing — Click to Open Floating Media HUD (Ctrl+Shift+M)"
          >
            <Volume2 size={12} style={{ animation: 'pulse 1.2s infinite' }} />
            <span>Playing Media · HUD</span>
          </div>
        </>
      )}

      {/* Privacy Shield blocked count */}
      {mode === 'normal' && (privacyStats?.trackersBlocked || 0) > 0 && (
        <>
          <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />
          <div className="status-item" style={{ color: 'var(--green)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Shield size={12} />
            <span>{privacyStats.trackersBlocked} Trackers Blocked</span>
          </div>
        </>
      )}

      {/* Split View Indicator */}
      {isSplitView && (
        <>
          <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />
          <div className="status-item" style={{ color: 'var(--accent-primary)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Split size={12} />
            <span>Split View Active</span>
          </div>
        </>
      )}

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

      {/* Active Local Servers Count */}
      <div
        className="status-item"
        onClick={onOpenPorts}
        style={{ cursor: 'pointer', gap: 6 }}
        title="Open Port Manager"
      >
        <span style={{ color: detectedServersCount > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
          ● {detectedServersCount} Server{detectedServersCount === 1 ? '' : 's'} Active
        </span>
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />

      {/* Zoom Controls */}
      <div className="status-item" style={{ gap: 4 }}>
        <button
          onClick={onZoomOut}
          title="Zoom Out (Ctrl+-)"
          style={{
            border: 'none', background: 'transparent', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 12, padding: '0 4px',
          }}
        >
          -
        </button>
        <span
          onClick={onZoomReset}
          title="Reset Zoom (Ctrl+0)"
          style={{
            cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10.5,
            color: zoomFactor !== 1.0 ? 'var(--accent-primary)' : 'var(--text-muted)',
            minWidth: 34, textAlign: 'center'
          }}
        >
          {zoomPercent}%
        </span>
        <button
          onClick={onZoomIn}
          title="Zoom In (Ctrl+=)"
          style={{
            border: 'none', background: 'transparent', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 12, padding: '0 4px',
          }}
        >
          +
        </button>
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />

      {/* Version */}
      <div className="status-item" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
        NeXusWeb v4.0.0
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />

      {/* Keyboard shortcuts hint */}
      <button
        id="status-shortcuts-btn"
        onClick={onShortcutsHelp}
        style={{
          border: 'none', background: 'transparent', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: 11, padding: '0 4px',
          transition: 'color var(--t-fast)', display: 'flex', alignItems: 'center', gap: 4,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        title="Keyboard Shortcuts (F1)"
      >
        <Keyboard size={12} />
        <span>F1</span>
      </button>
    </div>
  )
}

