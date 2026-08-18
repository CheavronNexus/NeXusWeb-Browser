import React from 'react'

// SVG logo inline (no external file dependency)
function LogoMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="none" stroke="#00d4ff" strokeWidth="1.5" />
      <line x1="20" y1="2" x2="20" y2="38" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="4" y1="11" x2="36" y2="29" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="36" y1="11" x2="4" y2="29" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
      <circle cx="20" cy="2"  r="2" fill="#00d4ff" />
      <circle cx="36" cy="11" r="2" fill="#00d4ff" />
      <circle cx="36" cy="29" r="2" fill="#00d4ff" />
      <circle cx="20" cy="38" r="2" fill="#00d4ff" />
      <circle cx="4"  cy="29" r="2" fill="#00d4ff" />
      <circle cx="4"  cy="11" r="2" fill="#00d4ff" />
      <text x="11" y="25" fontSize="16" fontWeight="700" fill="#00d4ff" fontFamily="Inter, sans-serif">N</text>
    </svg>
  )
}

export default function TitleBar({ mode }) {
  const handleMinimize = () => window.nexus?.window.minimize()
  const handleMaximize = () => window.nexus?.window.maximize()
  const handleClose    = () => window.nexus?.window.close()

  const modeLabel = { strict: 'Strict Offline', lan: 'Local Network', dev: 'Developer' }[mode] || mode

  return (
    <div className="title-bar">
      <div className="title-bar-logo">
        <LogoMark size={20} />
        <span className="title-bar-name">NeXusWeb</span>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
        v1.0.0 · {modeLabel}
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
