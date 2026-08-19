import React, { useEffect, useState, useCallback, useRef } from 'react'
import logoImg from '../assets/logo.png'

const MODE_FEATURES = {
  normal: {
    label: 'Normal Web',
    icon: '🛡️',
    color: 'var(--green)',
    features: [
      { name: 'Internet Browsing', allowed: true },
      { name: 'DuckDuckGo Privacy', allowed: true },
      { name: 'Tracker & Ad Block', allowed: true },
      { name: 'Localhost & Files',  allowed: true },
      { name: 'Media / Floating PiP', allowed: true },
      { name: 'Built-in Terminal',  allowed: true },
    ],
    desc: 'Full web browsing with DuckDuckGo-style privacy & tracker blocking.',
  },
  strict: {
    label: 'Strict Offline',
    icon: '🔒',
    color: 'var(--accent-primary)',
    features: [
      { name: 'Internet Browsing', allowed: false },
      { name: 'LAN Devices',       allowed: false },
      { name: 'Localhost Dev',     allowed: true },
      { name: 'Local Files',       allowed: true },
      { name: 'Terminal Sessions', allowed: true },
      { name: 'DevTools',          allowed: false },
    ],
    desc: 'Maximum isolation. Only localhost servers and local files allowed.',
  },
  lan: {
    label: 'Local Network',
    icon: '📡',
    color: 'var(--yellow)',
    features: [
      { name: 'Internet Browsing', allowed: false },
      { name: 'LAN Devices',       allowed: true },
      { name: 'Localhost Dev',     allowed: true },
      { name: 'Local Files',       allowed: true },
      { name: 'Terminal Sessions', allowed: true },
      { name: 'DevTools',          allowed: false },
    ],
    desc: 'Local & LAN network access for multi-device testing.',
  },
  dev: {
    label: 'Developer Mode',
    icon: '⚡',
    color: 'var(--accent-secondary)',
    features: [
      { name: 'Internet Browsing', allowed: true },
      { name: 'DevTools Inspector',allowed: true },
      { name: 'LAN & Localhost',   allowed: true },
      { name: 'Local Files',       allowed: true },
      { name: 'Terminal Sessions', allowed: true },
      { name: 'Unrestricted Web',  allowed: true },
    ],
    desc: 'Unrestricted developer mode with Chromium DevTools enabled.',
  },
}

function FeatureBadge({ allowed }) {
  if (allowed === true)       return <span className="feat-check">✅</span>
  if (allowed === false)      return <span className="feat-cross">❌</span>
  if (allowed === 'optional') return <span className="feat-optional">⚡ Optional</span>
  return null
}

export default function HomePage({ mode, onPortClick, onModeChange, onNewTab }) {
  const [servers, setServers] = useState([])
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [customPort, setCustomPort] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchEngine, setSearchEngine] = useState({ name: 'DuckDuckGo', icon: '🦆', url: 'https://duckduckgo.com/?q={query}' })
  const scanIntervalRef = useRef(null)

  useEffect(() => {
    window.nexus?.settings.get().then(s => {
      if (s?.searchEngine) setSearchEngine(s.searchEngine)
    })
  }, [])

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

  // Initial scan + live auto-polling every 3.5 seconds
  useEffect(() => {
    scan(true)
    scanIntervalRef.current = setInterval(() => {
      scan(false)
    }, 3500)
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

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    const url = searchEngine.url.replace('{query}', encodeURIComponent(q))
    onPortClick(url)
  }

  return (
    <div className="home-page" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header with App Logo */}
      <div className="home-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          src={logoImg}
          alt="NeXusWeb Logo"
          style={{
            width: 58,
            height: 58,
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 0 24px rgba(0, 212, 255, 0.35)',
            objectFit: 'contain',
          }}
        />
        <div>
          <div className="home-title" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            NeXusWeb
          </div>
          <div className="home-subtitle" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Developer Browser & Privacy Web Client · v3.0.0
          </div>
        </div>
      </div>

      {/* Web Search Bar directly on Home */}
      <div className="home-section" style={{ background: 'var(--bg-surface)', padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-bright)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{searchEngine.icon}</span> Search the Web with {searchEngine.name}
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${searchEngine.name} or type web address...`}
            style={{
              flex: 1, padding: '10px 14px',
              background: 'var(--bg-base)',
              border: '1.5px solid var(--border-dim)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="scan-btn"
            style={{ padding: '10px 20px', fontWeight: 600, background: 'var(--accent-primary)', color: '#0a0d14' }}
          >
            Search →
          </button>
        </form>
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
              Monitoring: Flask (5000) · Vite (5173) · React (3000) · Django (8000) · Live Server (5500) · Active TCP Listeners
            </div>
          </div>
        )}
      </div>

      {/* Launch Custom Port / URL directly */}
      <div className="home-section">
        <div className="home-section-title">
          <span>🚀</span> Quick Launch Port / URL
        </div>
        <form onSubmit={handleLaunchCustom} style={{ display: 'flex', gap: 8, maxWidth: 520 }}>
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

      {/* Popular Web & Dev Quick Links */}
      <div className="home-section">
        <div className="home-section-title">
          <span>🌐</span> Developer & Web Quick Links
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: '🦆 DuckDuckGo',                  url: 'https://duckduckgo.com' },
            { label: '🐙 GitHub',                      url: 'https://github.com' },
            { label: '📚 MDN Web Docs',                url: 'https://developer.mozilla.org' },
            { label: '💬 Stack Overflow',              url: 'https://stackoverflow.com' },
            { label: '▶️ YouTube',                     url: 'https://youtube.com' },
            { label: '⚡ Vite (localhost:5173)',        url: 'http://localhost:5173' },
            { label: '⚛️ React (localhost:3000)',      url: 'http://localhost:3000' },
            { label: '🐍 Flask (localhost:5000)',      url: 'http://localhost:5000' },
            { label: '🎯 Django (localhost:8000)',     url: 'http://localhost:8000' },
          ].map(({ label, url }) => (
            <button
              key={url}
              className="scan-btn"
              onClick={() => onPortClick(url)}
              style={{ fontSize: 11.5 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Network Modes Breakdown */}
      <div className="home-section">
        <div className="home-section-title">
          <span>🔒</span> Network & Privacy Modes
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
      <div style={{ paddingTop: 24, borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
        <span>NeXusWeb v3.0.0 · Localhost, LAN & Privacy Web Browser</span>
        <span>DuckDuckGo Privacy Shield Active</span>
      </div>
    </div>
  )
}
