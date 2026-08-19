import React, { useEffect, useState, useCallback, useRef } from 'react'
import logoImg from '../assets/logo.png'
import {
  LayoutGrid, Edit3, Settings, Search, Mic, Sparkles,
  Shield, Lock, Radio, Zap, Globe, Github, BookOpen, MessageSquare,
  Video, Cpu, Server, Code2, ArrowRight, X, ExternalLink, Compass
} from 'lucide-react'

const DEFAULT_SHORTCUTS = [
  { name: 'Google', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico' },
  { name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.png' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/s/desktop/f71887e1/img/favicon.ico' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico' },
  { name: 'ChatGPT', url: 'https://chatgpt.com', icon: 'https://oaistatic-cdn.azureedge.net/chatgpt/favicon.ico' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: 'https://developer.mozilla.org/favicon-48x48.png' },
]

export default function HomePage({ mode, onPortClick, onModeChange, onNewTab, onOpenSettings, onOpenPanel }) {
  const [servers, setServers] = useState([])
  const [scanning, setScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSkyTheme, setIsSkyTheme] = useState(false)
  const [showAppLauncher, setShowAppLauncher] = useState(false)
  const [searchEngine, setSearchEngine] = useState({ name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' })
  const searchInputRef = useRef(null)

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
    } catch (e) {
      console.error('Port scan failed:', e)
    }
    if (isManual) setScanning(false)
  }, [])

  useEffect(() => {
    scan()
    const interval = setInterval(() => scan(false), 4000)
    return () => clearInterval(interval)
  }, [scan])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const q = searchQuery.trim()

    // Check if it's a port number (e.g. "3000" or "8080")
    if (/^\d{2,5}$/.test(q)) {
      onPortClick(`http://localhost:${q}`)
      return
    }

    // Check if it's a direct URL
    if (q.startsWith('http://') || q.startsWith('https://') || q.startsWith('file://')) {
      onPortClick(q)
      return
    }

    if (q.includes('.') && !q.includes(' ')) {
      onPortClick(`https://${q}`)
      return
    }

    // Default search engine lookup
    const searchUrl = searchEngine.url ? searchEngine.url.replace('{query}', encodeURIComponent(q)) : `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
    onPortClick(searchUrl)
  }

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        const searchUrl = searchEngine.url ? searchEngine.url.replace('{query}', encodeURIComponent(transcript)) : `https://duckduckgo.com/?q=${encodeURIComponent(transcript)}`
        onPortClick(searchUrl)
      }
      recognition.start()
    } else {
      searchInputRef.current?.focus()
    }
  }

  return (
    <div className="newtab-canvas" data-canvas-style={isSkyTheme ? 'sky' : 'dark'}>
      
      {/* Top-Left: 9-Dot App Launcher */}
      <div className="newtab-top-left">
        <button
          className="newtab-icon-btn"
          onClick={() => setShowAppLauncher(v => !v)}
          title="NeXusApp Launcher & Local Servers"
        >
          <LayoutGrid size={18} />
        </button>

        {/* 9-Dot App Launcher Dropdown */}
        {showAppLauncher && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: 280,
            background: '#161822',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.70)',
            padding: '14px',
            zIndex: 100,
            animation: 'fadeIn 0.12s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>NeXusApp & Local Servers</div>
              <button onClick={() => setShowAppLauncher(false)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}><X size={14} /></button>
            </div>

            {/* Quick Port Servers */}
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Active Dev Servers</div>
            {servers.length === 0 ? (
              <div style={{ fontSize: 11, color: '#64748b', padding: '6px 0 10px' }}>No active servers detected.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, maxHeight: 160, overflowY: 'auto' }}>
                {servers.map(s => (
                  <div
                    key={s.port}
                    onClick={() => { onPortClick(s.url); setShowAppLauncher(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 8px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 6,
                      cursor: 'pointer', fontSize: 11.5,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>:{s.port} {s.label}</span>
                    <span style={{ color: 'var(--green)', fontSize: 10 }}>● LIVE</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Tools */}
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Developer Tools</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                onClick={() => { onOpenPanel?.('api-workbench'); setShowAppLauncher(false) }}
                style={{ padding: '7px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0', cursor: 'pointer', textAlign: 'center' }}
              >
                REST Workbench
              </button>
              <button
                onClick={() => { onOpenPanel?.('inspector'); setShowAppLauncher(false) }}
                style={{ padding: '7px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0', cursor: 'pointer', textAlign: 'center' }}
              >
                Request Inspector
              </button>
              <button
                onClick={() => { onOpenPanel?.('env'); setShowAppLauncher(false) }}
                style={{ padding: '7px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0', cursor: 'pointer', textAlign: 'center' }}
              >
                .env Variables
              </button>
              <button
                onClick={() => { onOpenPanel?.('ports'); setShowAppLauncher(false) }}
                style={{ padding: '7px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0', cursor: 'pointer', textAlign: 'center' }}
              >
                Port Manager
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top-Right: Look Switch, Edit, Settings */}
      <div className="newtab-top-right">
        {/* Switch to a new look toggle */}
        <div className="look-toggle-pill">
          <span>Switch to a new look</span>
          <div
            className={`switch-track ${isSkyTheme ? 'active' : ''}`}
            onClick={() => setIsSkyTheme(v => !v)}
            title="Toggle Clean Sky Pastel / Dark Canvas"
          >
            <div className="switch-thumb" />
          </div>
        </div>

        {/* Edit / Customize icon */}
        <button
          className="newtab-icon-btn"
          onClick={() => onOpenPanel?.('theme')}
          title="Customize Appearance & Neon Accents"
        >
          <Edit3 size={16} />
        </button>

        {/* Settings gear icon */}
        <button
          className="newtab-icon-btn"
          onClick={onOpenSettings}
          title="NeXusWeb Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Brand Hero (Logo + Title) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, userSelect: 'none' }}>
        <img src={logoImg} alt="NeXusWeb" style={{ width: 68, height: 68, marginBottom: 8, filter: 'drop-shadow(0 4px 16px rgba(0, 212, 255, 0.35))' }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: isSkyTheme ? '#1e293b' : '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
          NeXus<span style={{ color: 'var(--accent-primary)' }}>Web</span>
        </h1>
        <div style={{ fontSize: 12, color: isSkyTheme ? '#64748b' : '#94a3b8', marginTop: 3 }}>
          Localhost & Privacy Suite · {searchEngine.name}
        </div>
      </div>

      {/* Center Floating Rounded Search Box */}
      <form onSubmit={handleSearchSubmit} className="floating-search-pill" style={{ marginBottom: 28 }}>
        <Search size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
        
        <input
          ref={searchInputRef}
          type="text"
          className="floating-search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={`Search ${searchEngine.name} or type a URL / port...`}
          autoFocus
        />

        {/* Voice Search Icon */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          title="Search by voice"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#64748b',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50%',
            transition: 'color var(--t-fast)',
          }}
        >
          <Mic size={18} />
        </button>
      </form>

      {/* Quick Access Shortcuts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        maxWidth: 580,
        width: '100%',
        marginBottom: 28,
      }}>
        {DEFAULT_SHORTCUTS.map(sc => (
          <div
            key={sc.name}
            onClick={() => onPortClick(sc.url)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 8px',
              background: isSkyTheme ? 'rgba(255, 255, 255, 0.70)' : 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              border: isSkyTheme ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = isSkyTheme ? '#ffffff' : 'rgba(255, 255, 255, 0.09)'
              e.currentTarget.style.borderColor = 'var(--accent-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = isSkyTheme ? 'rgba(255, 255, 255, 0.70)' : 'rgba(255, 255, 255, 0.04)'
              e.currentTarget.style.borderColor = isSkyTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: isSkyTheme ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 6,
            }}>
              <img src={sc.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: isSkyTheme ? '#1e293b' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>
              {sc.name}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Server Port Badges (If any active) */}
      {servers.length > 0 && (
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 640 }}>
          {servers.slice(0, 8).map(s => (
            <div
              key={s.port}
              onClick={() => onPortClick(s.url)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: isSkyTheme ? '#1e293b' : '#e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <Cpu size={12} style={{ color: 'var(--green)' }} />
              <span>localhost:{s.port} ({s.label})</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: 'auto',
        marginBottom: 20,
        fontSize: 11,
        color: isSkyTheme ? '#475569' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span>NeXusWeb v5.0.0 · Localhost & Privacy Suite</span>
        <span>•</span>
        <span style={{ color: mode === 'normal' ? 'var(--green)' : 'var(--accent-primary)', fontWeight: 600 }}>
          Mode: {mode.toUpperCase()}
        </span>
      </div>

    </div>
  )
}
