import React, { useEffect, useState, useCallback, useRef } from 'react'

const MODE_FEATURES = {
  strict: {
    label: 'Strict Offline',
    icon: '🔒',
    color: 'var(--accent-primary)',
    features: [
      { name: 'Internet',   allowed: false },
      { name: 'LAN',        allowed: false },
      { name: 'Localhost',  allowed: true },
      { name: 'Files',      allowed: true },
      { name: 'DevTools',   allowed: false },
      { name: 'Terminal',   allowed: true },
    ],
    desc: 'Maximum isolation. Only localhost and local files.',
  },
  lan: {
    label: 'Local Network',
    icon: '📡',
    color: 'var(--green)',
    features: [
      { name: 'Internet',   allowed: false },
      { name: 'LAN',        allowed: true },
      { name: 'Localhost',  allowed: true },
      { name: 'Files',      allowed: true },
      { name: 'DevTools',   allowed: false },
      { name: 'Terminal',   allowed: true },
    ],
    desc: 'Local & LAN access. Share across devices on your network.',
  },
  dev: {
    label: 'Developer Mode',
    icon: '⚡',
    color: 'var(--accent-secondary)',
    features: [
      { name: 'Internet',   allowed: 'optional' },
      { name: 'LAN',        allowed: true },
      { name: 'Localhost',  allowed: true },
      { name: 'Files',      allowed: true },
      { name: 'DevTools',   allowed: true },
      { name: 'Terminal',   allowed: true },
    ],
    desc: 'Full developer access with DevTools and optional internet.',
  },
}

function FeatureBadge({ allowed }) {
  if (allowed === true)       return <span className="feat-check">✅</span>
  if (allowed === false)      return <span className="feat-cross">❌</span>
  if (allowed === 'optional') return <span className="feat-optional">⚡ Optional</span>
  return null
}

function LogoMark({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="home-logo-mark">
      <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8"/>
      <polygon points="20,6 32,13 32,27 20,34 8,27 8,13" fill="none" stroke="#00d4ff" strokeWidth="0.6" opacity="0.4"/>
      <line x1="20" y1="2" x2="20" y2="38" stroke="#00d4ff" strokeWidth="0.7" opacity="0.3" />
      <line x1="4" y1="11" x2="36" y2="29" stroke="#00d4ff" strokeWidth="0.7" opacity="0.3" />
      <line x1="36" y1="11" x2="4" y2="29" stroke="#00d4ff" strokeWidth="0.7" opacity="0.3" />
      {[
        [20,2],[36,11],[36,29],[20,38],[4,29],[4,11]
      ].map(([cx,cy], i) => <circle key={i} cx={cx} cy={cy} r="2" fill="#00d4ff"/>)}
      <text x="11" y="26" fontSize="15" fontWeight="700" fill="#00d4ff" fontFamily="Inter, sans-serif">N</text>
    </svg>
  )
}

export default function HomePage({ mode, onPortClick, onModeChange, onNewTab }) {
  const [servers, setServers] = useState([])
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [customPort, setCustomPort] = useState('')
  const scanIntervalRef = useRef(null)

  const scan = useCallback(async (isManual = false) => {
    if (!window.nexus) return
    if (isManual) setScanning(true)
    try {
      const found = await window.nexus.scanPorts()
      setServers(found || [])
      setLastScan(new Date())
    } catch (e) {
      console.error('Port scan failed:', e)
    }
    if (isManual) setScanning(false)
  }, [])

  // Initial scan + live auto-polling every 3 seconds
  useEffect(() => {
    scan(true)
    scanIntervalRef.current = setInterval(() => {
      scan(false)
    }, 3000)
    return () => clearInterval(scanIntervalRef.current)
  }, [scan])

  const handleLaunchCustom = (e) => {
    e.preventDefault()
    const val = customPort.trim()
    if (!val) return
    let target = val
    if (/^\d{1,5}$/.test(val)) {
      target = `http://localhost:${val}`
    } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `http://${val}`
    }
    onPortClick(target)
  }

  return (
    <div className="home-page" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="home-header">
        <LogoMark size={48} />
        <div>
          <div className="home-title">NeXusWeb</div>
          <div className="home-subtitle">Local Developer Browser · v1.0.0</div>
        </div>
      </div>

      {/* Detected Localhost Servers */}
      <div className="home-section">
        <div className="home-section-title">
          <span>⬡</span> Detected Local Servers
          <span style={{
            fontSize: 10, color: servers.length > 0 ? 'var(--green)' : 'var(--text-muted)',
            fontWeight: 500, marginLeft: 4, textTransform: 'none', letterSpacing: 0
          }}>
            ({servers.length} online · live auto-refresh)
          </span>
          <button
            className={`scan-btn ${scanning ? 'scanning' : ''}`}
            id="btn-scan-ports"
            onClick={() => scan(true)}
            disabled={scanning}
            style={{ marginLeft: 8, fontSize: 10, padding: '3px 8px' }}
          >
            {scanning ? (
              <><span className="tab-spinner" style={{ width: 10, height: 10 }} /> Scanning…</>
            ) : (
              <><span>↻</span> Rescan</>
            )}
          </button>
          {lastScan && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>
              Updated {lastScan.toLocaleTimeString()}
            </span>
          )}
        </div>

        {servers.length > 0 ? (
          <div className="port-grid">
            {servers.map(({ port, label, url }) => (
              <div
                key={port}
                className="port-card"
                id={`port-card-${port}`}
                onClick={() => onPortClick(url)}
                style={{ animation: 'slideUp 0.2s ease', cursor: 'pointer' }}
              >
                <div className="port-number">:{port}</div>
                <div className="port-label">{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  {url}
                </div>
                <div className="port-status">● Active & Ready to Open</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-servers">
            <div className="no-servers-icon">⬡</div>
            <div className="no-servers-text">
              No local servers detected yet. Start Flask, React, Vite, or Django in the built-in terminal.
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Monitoring: Flask (5000/5001) · Vite (5173) · React (3000) · Django (8000) · Live Server (5500) · Active TCP Listeners
            </div>
          </div>
        )}
      </div>

      {/* Launch Custom Port / URL directly */}
      <div className="home-section">
        <div className="home-section-title">
          <span>🚀</span> Quick Launch Port / URL
        </div>
        <form onSubmit={handleLaunchCustom} style={{ display: 'flex', gap: 8, maxWidth: 500 }}>
          <input
            type="text"
            value={customPort}
            onChange={e => setCustomPort(e.target.value)}
            placeholder="Type port number (e.g. 5000) or URL"
            style={{
              flex: 1, padding: '8px 12px',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-dim)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="scan-btn"
            style={{ padding: '8px 18px', fontWeight: 600 }}
          >
            Open →
          </button>
        </form>
      </div>

      {/* Quick Shortcuts */}
      <div className="home-section">
        <div className="home-section-title">
          <span>⚡</span> Quick Links
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: '🐍 Flask (localhost:5000)',      url: 'http://localhost:5000' },
            { label: '🐍 Flask (127.0.0.1:5000)',     url: 'http://127.0.0.1:5000' },
            { label: '⚛️ React (localhost:3000)',      url: 'http://localhost:3000' },
            { label: '⚡ Vite (localhost:5173)',        url: 'http://localhost:5173' },
            { label: '🎯 Django (localhost:8000)',     url: 'http://localhost:8000' },
            { label: '🌐 HTTP Server (localhost:8080)',url: 'http://localhost:8080' },
            { label: '📁 Local Files (file:///)',      url: 'file:///' },
          ].map(({ label, url }) => (
            <button
              key={url}
              className="scan-btn"
              onClick={() => onPortClick(url)}
              style={{ fontSize: 11 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Network Modes */}
      <div className="home-section">
        <div className="home-section-title">
          <span>🔒</span> Network Modes
        </div>
        <div className="mode-info-grid">
          {Object.entries(MODE_FEATURES).map(([id, info]) => (
            <div
              key={id}
              className={`mode-info-card ${mode === id ? 'active-mode' : ''}`}
              id={`mode-card-${id}`}
              onClick={() => onModeChange(id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="mode-info-header" style={{ color: info.color }}>
                <span style={{ fontSize: 18 }}>{info.icon}</span>
                {info.label}
                {mode === id && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 9, padding: '2px 6px',
                    background: info.color + '22', color: info.color,
                    borderRadius: 100, fontWeight: 600
                  }}>ACTIVE</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{info.desc}</div>
              {info.features.map(f => (
                <div key={f.name} className="mode-feature-row">
                  <span>{f.name}</span>
                  <FeatureBadge allowed={f.allowed} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ paddingTop: 24, borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: 11 }}>
        NeXusWeb Prototype V1 · Localhost & LAN Developer Browser · Live TCP port listener active
      </div>
    </div>
  )
}
