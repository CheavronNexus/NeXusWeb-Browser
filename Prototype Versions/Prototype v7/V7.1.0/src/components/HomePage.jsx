import React, { useState, useEffect } from 'react'
import logoImg from '../assets/logo.png'
import {
  Search, Shield, EyeOff, Terminal, Zap, Radio, Globe, Lock,
  Cpu, ExternalLink, RefreshCw, Layers, Sparkles, Clock, ArrowUpRight
} from 'lucide-react'

export default function HomePage({
  mode = 'normal',
  onPortClick,
  onModeChange,
  onNewTab,
  onOpenSettings,
  onOpenPanel,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEngine, setSelectedEngine] = useState('Google')
  const [activePorts, setActivePorts] = useState([])
  const [scanning, setScanning] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [vpnConfig, setVpnConfig] = useState({ mode: 'direct', region: 'direct' })

  // Real-time Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Scan local dev ports
  const scanPorts = async () => {
    setScanning(true)
    try {
      const ports = await window.nexus?.scanPorts?.()
      if (ports) setActivePorts(ports)
    } catch (e) {
      console.warn('Port scan error:', e)
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    scanPorts()
    const portInterval = setInterval(scanPorts, 5000)
    return () => clearInterval(portInterval)
  }, [])

  const searchEngines = [
    { name: 'Google', url: 'https://www.google.com/search?q=' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
    { name: 'Bing', url: 'https://www.bing.com/search?q=' },
    { name: 'Brave', url: 'https://search.brave.com/search?q=' },
  ]

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    if (query.startsWith('localhost') || query.startsWith('127.0.0.1')) {
      onNewTab?.(`http://${query}`)
    } else if (query.startsWith('http://') || query.startsWith('https://')) {
      onNewTab?.(query)
    } else if (query.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
      onNewTab?.(`https://${query}`)
    } else {
      const engine = searchEngines.find(e => e.name === selectedEngine) || searchEngines[0]
      onNewTab?.(`${engine.url}${encodeURIComponent(query)}`)
    }
  }

  const handleSetVpnRegion = async (region) => {
    if (region === 'direct') {
      await window.nexus?.proxy?.setMode?.('direct', 'direct')
      setVpnConfig({ mode: 'direct', region: 'direct' })
    } else {
      const res = await window.nexus?.proxy?.setMode?.('proxy', region)
      setVpnConfig(res?.config || { mode: 'proxy', region })
    }
  }

  const quickShortcuts = [
    { title: 'Google', url: 'https://www.google.com', icon: '🔍' },
    { title: 'GitHub', url: 'https://www.github.com', icon: '🐙' },
    { title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
    { title: 'ChatGPT', url: 'https://chatgpt.com', icon: '🤖' },
    { title: 'Reddit', url: 'https://www.reddit.com', icon: '👽' },
    { title: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
    { title: 'SoundCloud', url: 'https://soundcloud.com', icon: '🎵' },
    { title: 'Vite Docs', url: 'https://vitejs.dev', icon: '⚡' },
  ]

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 72px 24px',
        position: 'relative',
        overflowY: 'auto',
        background: 'var(--bg-base)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 920, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 1. Header: Monochromatic Brand & Digital Clock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 38 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src={logoImg} alt="NeXusWeb" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                NeXusWeb <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, letterSpacing: '0.04em' }}>V7.0</span>
              </h1>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                Sovereign Personal Computing & Local Infrastructure
              </div>
            </div>
          </div>

          {/* Minimalist Frosted Clock */}
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Clock size={14} color="var(--text-secondary)" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
                {timeStr || '00:00:00'}
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--text-muted)' }}>
                {dateStr || 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Frosted Glass Search Capsule */}
        <div style={{ width: '100%', maxWidth: 680, marginBottom: 38 }}>
          <form onSubmit={handleSearchSubmit}>
            <div
              className="glass-capsule"
              style={{
                height: 48,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: 12,
              }}
            >
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedEngine} or type a URL (e.g. localhost:3000)...`}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <button
                type="submit"
                className="glass-btn-primary"
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Clean Engine Selector Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            {searchEngines.map((eng) => {
              const isSelected = selectedEngine === eng.name
              return (
                <button
                  key={eng.name}
                  type="button"
                  onClick={() => setSelectedEngine(eng.name)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1px solid var(--text-primary)' : '1px solid transparent',
                    background: isSelected ? 'var(--text-primary)' : 'transparent',
                    color: isSelected ? 'var(--bg-base)' : 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {eng.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Layered Frosted Glass Cards (4 Core Features) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
            width: '100%',
            marginBottom: 36,
          }}
        >
          {/* Card 1: Virtual Sandbox */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <EyeOff size={18} />
              </div>
              <span className="glass-pill" style={{ fontSize: 9.5 }}>100% RAM</span>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Virtual Sandbox</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                RAM-only session. Auto-vaporizes all cookies and cache on exit.
              </div>
            </div>

            <button
              onClick={() => window.nexus?.openPrivateDen?.()}
              className="glass-btn"
              style={{ marginTop: 'auto', width: '100%', fontSize: 11.5 }}
            >
              <span>Launch Sandbox</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          {/* Card 2: Privacy Tunnel */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <Shield size={18} />
              </div>
              <span className="glass-pill" style={{ fontSize: 9.5 }}>
                {vpnConfig.mode !== 'direct' ? vpnConfig.region?.toUpperCase() : 'DIRECT'}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Privacy Tunnel</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Encrypted DNS-over-HTTPS multi-region tunnel.
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
              {['direct', 'nl', 'us', 'sg', 'uk', 'de'].map(reg => {
                const isActive = (vpnConfig.region || 'direct') === reg
                return (
                  <button
                    key={reg}
                    onClick={() => handleSetVpnRegion(reg)}
                    style={{
                      padding: '3px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--glass-border)',
                      background: isActive ? 'var(--text-primary)' : 'transparent',
                      color: isActive ? 'var(--bg-base)' : 'var(--text-secondary)',
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {reg}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Card 3: Port Radar */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <Radio size={18} className={scanning ? 'spin-anim' : ''} />
              </div>
              <span className="glass-pill" style={{ fontSize: 9.5 }}>{activePorts.length} Active</span>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Port Radar</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Instant detection of local Vite, Next.js, and API dev servers.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
              <button
                onClick={() => onPortClick?.('http://localhost:3000')}
                className="glass-btn"
                style={{ flex: 1, padding: '4px', fontSize: 10.5 }}
              >
                :3000
              </button>
              <button
                onClick={() => onPortClick?.('http://localhost:5173')}
                className="glass-btn"
                style={{ flex: 1, padding: '4px', fontSize: 10.5 }}
              >
                :5173
              </button>
              <button
                onClick={() => onOpenPanel?.('ports')}
                className="glass-btn"
                style={{ padding: '4px 8px', fontSize: 10.5 }}
              >
                All
              </button>
            </div>
          </div>

          {/* Card 4: Dev Suite */}
          <div className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <Terminal size={18} />
              </div>
              <span className="glass-pill" style={{ fontSize: 9.5 }}>DevTools</span>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Developer Suite</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                REST client, live CSS inspector & embedded terminal.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 'auto' }}>
              <button
                onClick={() => onOpenPanel?.('api-workbench')}
                className="glass-btn"
                style={{ padding: '4px', fontSize: 10.5 }}
              >
                REST
              </button>
              <button
                onClick={() => onOpenPanel?.('terminal')}
                className="glass-btn"
                style={{ padding: '4px', fontSize: 10.5 }}
              >
                CLI (Ctrl+`)
              </button>
            </div>
          </div>
        </div>

        {/* 4. Frosted Shortcut Tiles */}
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} />
            <span>Frequent Portals</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
            {quickShortcuts.map((sc) => (
              <div
                key={sc.title}
                onClick={() => onNewTab?.(sc.url)}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '10px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: 16 }}>{sc.icon}</div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sc.title}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
