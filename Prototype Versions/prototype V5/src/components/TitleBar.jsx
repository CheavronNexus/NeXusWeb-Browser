import React from 'react'
import logoImg from '../assets/logo.png'

export default function TitleBar({ mode, isPrivateDen = false }) {
  const handleMinimize = () => window.nexus?.minimize()
  const handleMaximize = () => window.nexus?.maximize()
  const handleClose    = () => window.nexus?.close()

  const modeLabel = {
    normal: 'Normal Web · Privacy Shield',
    lan:    'Local Network',
    strict: 'Strict Offline',
    dev:    'Developer',
  }[mode] || mode

  return (
    <div className={`title-bar ${isPrivateDen ? 'private-title-bar' : ''}`} style={isPrivateDen ? { background: '#090812', borderBottom: '1px solid rgba(168, 85, 247, 0.25)' } : {}}>
      <div className="title-bar-logo" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {isPrivateDen ? (
          <span style={{ fontSize: 14 }}>🕵️</span>
        ) : (
          <img
            src={logoImg}
            alt="NeXusWeb"
            style={{
              width: 18,
              height: 18,
              borderRadius: 'var(--radius-sm)',
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <span className="title-bar-name" style={{ fontWeight: 700, fontSize: 11.5, letterSpacing: '0.02em', color: isPrivateDen ? '#d8b4fe' : 'inherit' }}>
          {isPrivateDen ? 'NeXusWeb · Private Den' : 'NeXusWeb'}
        </span>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
        {isPrivateDen ? (
          <span style={{
            background: 'rgba(168, 85, 247, 0.2)',
            color: '#c084fc',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            padding: '1px 7px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 9.5,
          }}>
            VIRTUAL SANDBOX (RAM-ONLY)
          </span>
        ) : (
          <>
            <span style={{ opacity: 0.5 }}>v5.0.0</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{
              color: mode === 'normal' ? 'var(--green)' : mode === 'dev' ? 'var(--accent-secondary)' : mode === 'lan' ? 'var(--yellow)' : 'var(--accent-primary)',
              fontWeight: 600,
            }}>
              {modeLabel}
            </span>
          </>
        )}
      </div>

      <div className="title-bar-spacer" />

      <div className="window-controls">
        <button className="wc-btn" id="wc-minimize" onClick={handleMinimize} title="Minimize">
          <svg width="9" height="2" viewBox="0 0 9 2" fill="currentColor"><rect width="9" height="2" rx="1"/></svg>
        </button>
        <button className="wc-btn" id="wc-maximize" onClick={handleMaximize} title="Maximize">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="0.6" y="0.6" width="7.8" height="7.8" rx="1" />
          </svg>
        </button>
        <button className="wc-btn close" id="wc-close" onClick={handleClose} title="Close & Wipe">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="1" x2="8" y2="8"/><line x1="8" y1="1" x2="1" y2="8"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
