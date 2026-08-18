import React, { useState, useRef, useEffect } from 'react'
import { Shield, Radio, Lock, Zap, Info, X, Check } from 'lucide-react'

const MODES = [
  {
    id: 'normal',
    label: 'Normal',
    title: 'Normal Web Browsing',
    icon: Shield,
    color: 'var(--green)',
    badge: 'Standard & Secure',
    desc: 'Default web browsing with built-in ad/tracker blocking, automatic HTTPS upgrades, anti-fingerprinting protection, and Chrome extension support.',
  },
  {
    id: 'lan',
    label: 'LAN',
    title: 'Local Network Only',
    icon: Radio,
    color: 'var(--yellow)',
    badge: 'Local Subnet',
    desc: 'Restricts traffic strictly to local network IP addresses (192.168.x.x, 10.x.x.x, 172.16.x.x) and loopback. Blocks all outbound internet connections.',
  },
  {
    id: 'strict',
    label: 'Strict',
    title: 'Strict Offline & Localhost',
    icon: Lock,
    color: 'var(--accent-primary)',
    badge: 'Offline Air-Gap',
    desc: 'Maximum isolation sandbox. Disallows all external and LAN network access except localhost (127.0.0.1). Strips third-party cookies and tracking telemetry.',
  },
  {
    id: 'dev',
    label: 'Dev',
    title: 'Developer Mode',
    icon: Zap,
    color: 'var(--accent-secondary)',
    badge: 'Unrestricted',
    desc: 'Optimized for full-stack web development. Disables webSecurity, allows mixed HTTP/HTTPS requests, activates DevTools, and enables live port scanning.',
  },
]

export default function ModeSelector({ mode, onModeChange }) {
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef(null)

  // Notify Electron to keep BrowserView from overlaying on top of this popover!
  useEffect(() => {
    window.nexus?.setModesInfoOpen?.(showInfo)
  }, [showInfo])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) {
        setShowInfo(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowInfo(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.nexus?.setModesInfoOpen?.(false)
    }
  }, [])

  return (
    <div className="mode-selector-wrapper" ref={infoRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
      <div className="mode-selector" title="Network & Security Isolation Mode">
        {MODES.map(m => {
          const IconComponent = m.icon
          const isActive = mode === m.id
          return (
            <button
              key={m.id}
              id={`mode-btn-${m.id}`}
              className={`mode-btn ${m.id} ${isActive ? 'active' : ''}`}
              onClick={() => onModeChange(m.id)}
              title={`${m.label} Mode: ${m.title}`}
            >
              <IconComponent size={12} style={{ color: isActive ? m.color : 'inherit', flexShrink: 0 }} />
              <span>{m.label}</span>
            </button>
          )
        })}

        {/* Small (i) info button */}
        <button
          className={`mode-info-trigger-btn ${showInfo ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setShowInfo(v => !v)
          }}
          title="Learn about Network & Isolation Modes"
          style={{
            border: 'none',
            background: showInfo ? 'rgba(0, 212, 255, 0.25)' : 'transparent',
            color: showInfo ? 'var(--accent-primary)' : '#94a3b8',
            cursor: 'pointer',
            padding: '3px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            marginLeft: 2,
            transition: 'all 0.15s ease',
          }}
        >
          <Info size={13} style={{ color: showInfo ? 'var(--accent-primary)' : 'inherit' }} />
        </button>
      </div>

      {/* Modern (i) Modes Info Card Popover & Backdrop */}
      {showInfo && (
        <>
          <div
            className="modes-info-backdrop"
            onClick={(e) => {
              e.stopPropagation()
              setShowInfo(false)
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99990,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
            }}
          />
          <div
            className="modes-info-popover"
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 340,
              background: '#161822',
              border: '1px solid rgba(0, 212, 255, 0.35)',
              borderRadius: 14,
              boxShadow: '0 20px 55px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 212, 255, 0.15)',
              padding: '14px 16px',
              zIndex: 99999,
              userSelect: 'none',
              fontFamily: 'var(--font-sans)',
              color: '#e2e8f0',
              animation: 'fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Shield size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Network Isolation Modes</span>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MODES.map(m => {
                const IconComponent = m.icon
                const isCurrent = mode === m.id
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onModeChange(m.id)
                      setShowInfo(false)
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: isCurrent ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCurrent ? '1px solid rgba(0, 212, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)' }}
                    onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, color: '#f8fafc' }}>
                        <IconComponent size={14} style={{ color: m.color }} />
                        <span>{m.label} Mode</span>
                        {isCurrent && (
                          <span style={{ fontSize: 9, background: m.color, color: '#000000', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{m.badge}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.45 }}>
                      {m.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
