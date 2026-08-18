import React from 'react'
import logoImg from '../assets/logo.png'

export default function TitleBar({ mode }) {
  const handleMinimize = () => window.nexus?.minimize()
  const handleMaximize = () => window.nexus?.maximize()
  const handleClose    = () => window.nexus?.close()

  const modeLabel = {
    strict: 'Strict Offline',
    lan:    'Local Network',
    normal: 'Normal Web · Privacy Shield',
    dev:    'Developer',
  }[mode] || mode

  return (
    <div className="title-bar">
      <div className="title-bar-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img
          src={logoImg}
          alt="NeXusWeb"
          style={{
            width: 22,
            height: 22,
            borderRadius: 'var(--radius-sm)',
            objectFit: 'contain',
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.25)',
          }}
          onError={(e) => {
            // Fallback SVG if image fails
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="title-bar-name" style={{ fontWeight: 700, letterSpacing: '0.02em' }}>NeXusWeb</span>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ opacity: 0.6 }}>v4.0.0</span>
        <span style={{ opacity: 0.3 }}>•</span>
        <span style={{
          color: mode === 'normal' ? 'var(--green)' : mode === 'dev' ? 'var(--accent-secondary)' : mode === 'lan' ? 'var(--yellow)' : 'var(--accent-primary)',
          fontWeight: 500,
        }}>
          {modeLabel}
        </span>
      </div>

      <div className="title-bar-spacer" />

      <div className="window-controls">
        <button className="wc-btn" id="wc-minimize" onClick={handleMinimize} title="Minimize">
          <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor"><rect width="10" height="2" rx="1"/></svg>
        </button>
        <button className="wc-btn" id="wc-maximize" onClick={handleMaximize} title="Maximize">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="0.6" y="0.6" width="8.8" height="8.8" rx="1.5" />
          </svg>
        </button>
        <button className="wc-btn close" id="wc-close" onClick={handleClose} title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
