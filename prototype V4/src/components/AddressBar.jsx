import React, { useState, useEffect, useRef, useCallback } from 'react'
import ModeSelector from './ModeSelector'
import { Palette, ArrowLeft, ArrowRight, RotateCw, Bookmark, Sparkles, Volume2, Music, Split, Shield, Puzzle, Home, Folder, Cpu, Lock, Globe, Wrench, Terminal, BookOpen, Tv, Search, Eye, Zap } from 'lucide-react'

function getUrlType(url) {
  if (!url || url === 'nexusweb://home') return 'home'
  if (url.startsWith('file://'))  return 'file'
  if (url.match(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/)) return 'local'
  if (url.startsWith('https://')) return 'secure'
  return 'remote'
}

const TYPE_ICONS = {
  home:   { icon: <Home size={13} />, color: 'var(--text-muted)' },
  file:   { icon: <Folder size={13} />, color: 'var(--accent-secondary)' },
  local:  { icon: <Cpu size={13} />, color: 'var(--accent-primary)' },
  secure: { icon: <Lock size={13} />, color: 'var(--green)' },
  remote: { icon: <Globe size={13} />, color: 'var(--text-muted)' },
}

let cachedServers = null
let lastServerFetchTime = 0

export default function AddressBar({
  url, mode, loading, canGoBack, canGoForward, bookmarked, activePanel, isSplitView, currentTheme,
  addressInputRef, detectedServersCount, activeTabId,
  onNavigate, onBack, onForward, onReload,
  onToggleTerminal, onToggleDevTools, showTerminal, onModeChange,
  onToggleBookmark, onTogglePanel, onToggleFind, onCaptureScreenshot, onToggleSplitView, onAutoDetectScan, onToggleTheme,
  onTriggerPiP, onToggleReaderMode, onOpenCommandPalette, privacyStats,
  onToggleMediaHUD, showMediaHUD, isAudioPlaying, onCreatePrivateDen,
}) {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestIdx, setSelectedSuggestIdx] = useState(-1)
  const [showAutoDetectMenu, setShowAutoDetectMenu] = useState(false)
  const [showPrivacyPopover, setShowPrivacyPopover] = useState(false)
  const [recentServers, setRecentServers] = useState([])
  const [searchEngine, setSearchEngine] = useState({ name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' })
  const [vpnConfig, setVpnConfig] = useState({ mode: 'direct', region: 'direct' })
  const debounceTimerRef = useRef(null)

  const urlType = getUrlType(url)
  const typeInfo = TYPE_ICONS[urlType]

  // Track live VPN / Proxy status
  useEffect(() => {
    const checkVpn = async () => {
      try {
        const conf = await window.nexus?.proxy?.getConfig()
        if (conf) setVpnConfig(conf)
      } catch (e) {}
    }
    checkVpn()
    const interval = setInterval(checkVpn, 2500)
    return () => clearInterval(interval)
  }, [activePanel])

  // Load search engine from settings
  useEffect(() => {
    window.nexus?.settings.get().then(s => {
      if (s?.searchEngine) setSearchEngine(s.searchEngine)
    })
  }, [activePanel])

  useEffect(() => {
    if (!focused) {
      setInputValue(url === 'nexusweb://home' ? '' : (url || ''))
      setSuggestions([])
      setSelectedSuggestIdx(-1)
    }
  }, [url, focused])

  // Autocomplete suggestions with 150ms debounce and 2s cached port scans
  const updateSuggestions = useCallback((query) => {
    clearTimeout(debounceTimerRef.current)
    const q = query.trim().toLowerCase()
    if (!q) {
      setSuggestions([])
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      const now = Date.now()
      if (!cachedServers || now - lastServerFetchTime > 2500) {
        cachedServers = await (window.nexus?.scanPorts() || [])
        lastServerFetchTime = now
      }

      const [bookmarks, history] = await Promise.all([
        window.nexus?.bookmarks.get() || [],
        window.nexus?.history.get() || [],
      ])

      const list = []

      // 0. Search Engine Query Recommendation
      list.push({
        type: 'search',
        label: `Search "${query}" with ${searchEngine.name}`,
        url: searchEngine.url.replace('{query}', encodeURIComponent(query)),
        badge: `${searchEngine.icon} Search`,
      })

      // 1. Matched Active Ports
      cachedServers.forEach(s => {
        if (String(s.port).includes(q) || s.label.toLowerCase().includes(q) || s.url.includes(q)) {
          list.push({ type: 'port', label: s.label, url: s.url, badge: `:${s.port}` })
        }
      })

      // 2. Common Quick Ports
      if (/^\d{1,5}$/.test(q)) {
        list.push({ type: 'quick', label: `Open Port ${q}`, url: `http://localhost:${q}`, badge: `:${q}` })
      }

      // 3. Bookmarks
      bookmarks.forEach(b => {
        if (b.title?.toLowerCase().includes(q) || b.url?.toLowerCase().includes(q)) {
          if (!list.some(item => item.url === b.url)) {
            list.push({ type: 'bookmark', label: b.title || b.url, url: b.url, badge: '★ Bookmark' })
          }
        }
      })

      // 4. History
      history.forEach(h => {
        if (h.title?.toLowerCase().includes(q) || h.url?.toLowerCase().includes(q)) {
          if (!list.some(item => item.url === h.url)) {
            list.push({ type: 'history', label: h.title || h.url, url: h.url, badge: 'History' })
          }
        }
      })

      setSuggestions(list.slice(0, 7))
      setSelectedSuggestIdx(-1)
    }, 150)
  }, [searchEngine])

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    updateSuggestions(val)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedSuggestIdx >= 0 && suggestions[selectedSuggestIdx]) {
      onNavigate(suggestions[selectedSuggestIdx].url)
    } else {
      const val = inputValue.trim()
      onNavigate(val || 'nexusweb://home')
    }
    setSuggestions([])
    setFocused(false)
    addressInputRef?.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSuggestions([])
      setFocused(false)
      addressInputRef?.current?.blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (suggestions.length > 0) {
        setSelectedSuggestIdx(prev => (prev + 1) % suggestions.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (suggestions.length > 0) {
        setSelectedSuggestIdx(prev => (prev - 1 + suggestions.length) % suggestions.length)
      }
    }
  }

  // Sync popovers with Electron
  useEffect(() => {
    const isAnyOpen = showAutoDetectMenu || showPrivacyPopover || (focused && suggestions.length > 0)
    window.nexus?.setMenuOpen(isAnyOpen)
  }, [showAutoDetectMenu, showPrivacyPopover, focused, suggestions.length])

  // Click outside to close any open dropdown/popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAutoDetectMenu && !e.target.closest('#btn-auto-detect-ports') && !e.target.closest('.auto-detect-dropdown')) {
        setShowAutoDetectMenu(false)
      }
      if (showPrivacyPopover && !e.target.closest('#btn-privacy-shield') && !e.target.closest('.privacy-shield-popover')) {
        setShowPrivacyPopover(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [showAutoDetectMenu, showPrivacyPopover])

  const handleTriggerAutoDetect = async (e) => {
    e?.stopPropagation()
    const next = !showAutoDetectMenu
    setShowAutoDetectMenu(next)
    setShowMenu(false)
    setShowPrivacyPopover(false)
    if (next) {
      const servers = await window.nexus?.scanPorts()
      setRecentServers(servers || [])
      onAutoDetectScan?.(servers)
    }
  }

  const handleMenuItemClick = (action) => {
    setShowMenu(false)
    if (typeof action === 'function') action()
  }

  return (
    <div className="address-bar-row" style={{ position: 'relative' }}>
      {/* Back */}
      <button className="nav-btn" id="btn-back" onClick={onBack} disabled={!canGoBack} title="Go back (Alt+←)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,2 4,7 9,12"/>
        </svg>
      </button>

      {/* Forward */}
      <button className="nav-btn" id="btn-forward" onClick={onForward} disabled={!canGoForward} title="Go forward (Alt+→)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5,2 10,7 5,12"/>
        </svg>
      </button>

      {/* Reload */}
      <button className="nav-btn" id="btn-reload" onClick={onReload} title="Reload (F5 / Ctrl+R)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          style={loading ? { animation: 'spin 0.7s linear infinite', transformOrigin: '7px 7px' } : {}}>
          <path d="M12 7A5 5 0 1 1 9.5 3"/>
          <polyline points="10,1 9.5,3 12,3.5"/>
        </svg>
      </button>

      {/* Address Input & Autocomplete Container */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        <form style={{ flex: 1, display: 'flex' }} onSubmit={handleSubmit}>
          <div className="address-input-wrap" style={{ flex: 1, position: 'relative' }}>
            
            {/* DuckDuckGo-Style Privacy Shield Button */}
            <button
              type="button"
              id="btn-privacy-shield"
              onClick={() => setShowPrivacyPopover(v => !v)}
              title="DuckDuckGo Privacy Shield & Security Info"
              style={{
                border: 'none',
                background: mode === 'normal' ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: mode === 'normal' ? 'var(--green)' : typeInfo.color,
                fontSize: 12,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{mode === 'normal' ? <Shield size={13} /> : typeInfo.icon}</span>
              {mode === 'normal' && (privacyStats?.trackersBlocked || 0) > 0 && (
                <span style={{
                  background: 'var(--green)',
                  color: '#000',
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: '0 4px',
                  lineHeight: '13px',
                }}>
                  {privacyStats.trackersBlocked}
                </span>
              )}
            </button>

            <input
              ref={addressInputRef}
              id="address-input"
              className="address-input"
              type="text"
              value={focused ? inputValue : (url === 'nexusweb://home' ? '' : (url || ''))}
              onChange={handleInputChange}
              onFocus={() => {
                setFocused(true)
                setTimeout(() => addressInputRef?.current?.select(), 10)
              }}
              onBlur={() => {
                setTimeout(() => {
                  setFocused(false)
                  setSuggestions([])
                }, 200)
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Search with ${searchEngine.name} · enter port (e.g. 5000) · localhost:3000`}
              spellCheck={false}
              autoComplete="off"
            />

            {focused && inputValue && (
              <button
                type="button"
                onClick={() => { setInputValue(''); setSuggestions([]) }}
                style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}
              >
                ✕
              </button>
            )}

            {/* Bookmark star */}
            {!focused && url && url !== 'nexusweb://home' && (
              <button
                type="button"
                id="btn-bookmark-star"
                onClick={onToggleBookmark}
                title={bookmarked ? 'Remove bookmark (Ctrl+D)' : 'Add bookmark (Ctrl+D)'}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer', padding: '0 2px',
                  fontSize: 15, color: bookmarked ? '#f59e0b' : 'var(--text-muted)',
                  transition: 'color 0.15s, transform 0.15s',
                  transform: bookmarked ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                {bookmarked ? '★' : '☆'}
              </button>
            )}
          </div>
        </form>

        {/* Privacy Popover Dropdown */}
        {showPrivacyPopover && (
          <div
            className="privacy-shield-popover"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 6,
              width: 310,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-bright)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 500,
              padding: 16,
              animation: 'slideUp 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
              <Shield size={22} style={{ color: 'var(--green)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>NeXusWeb Privacy Shield</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>DuckDuckGo-style Web & Data Protection</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={12} /> Connection Security</span>
                <span style={{ fontWeight: 600, color: urlType === 'secure' || urlType === 'local' ? 'var(--green)' : 'var(--yellow)' }}>
                  {urlType === 'secure' ? 'HTTPS Encrypted' : urlType === 'local' ? 'Localhost' : 'Standard'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}><Shield size={12} /> Trackers Blocked</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)', background: 'var(--accent-primary-dim)', padding: '1px 8px', borderRadius: 10 }}>
                  {privacyStats?.trackersBlocked || 0} Blocked
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}><Eye size={12} /> Fingerprint Spoofing</span>
                <span style={{ fontWeight: 600, color: mode === 'normal' ? 'var(--green)' : 'var(--text-muted)' }}>
                  {mode === 'normal' ? 'Active' : 'Off'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={12} /> 3rd-Party Cookies</span>
                <span style={{ fontWeight: 600, color: mode === 'normal' ? 'var(--green)' : 'var(--text-muted)' }}>
                  {mode === 'normal' ? 'Blocked' : 'Standard'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={12} /> Auto HTTPS Upgrade</span>
                <span style={{ fontWeight: 600, color: 'var(--green)' }}>
                  Active
                </span>
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <button
                className="scan-btn"
                onClick={() => {
                  setShowPrivacyPopover(false)
                  onTogglePanel('settings')
                }}
                style={{ fontSize: 11, padding: '4px 10px', width: '100%' }}
              >
                ⚙ Manage Privacy Settings
              </button>
            </div>
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {focused && suggestions.length > 0 && (
          <div
            id="address-autocomplete-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-bright)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 400,
              overflow: 'hidden',
            }}
          >
            {suggestions.map((item, idx) => (
              <div
                key={item.url + idx}
                onMouseDown={() => {
                  onNavigate(item.url)
                  setSuggestions([])
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedSuggestIdx === idx ? 'var(--bg-hover)' : 'transparent',
                  borderBottom: idx !== suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
                onMouseEnter={() => setSelectedSuggestIdx(idx)}
              >
                <div style={{ flex: 1, overflow: 'hidden', marginRight: 10 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {item.url}
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: item.type === 'search' ? 'rgba(0, 212, 255, 0.15)' : item.type === 'port' ? 'var(--accent-primary-dim)' : item.type === 'bookmark' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-base)',
                  color: item.type === 'search' ? 'var(--accent-primary)' : item.type === 'port' ? 'var(--accent-primary)' : item.type === 'bookmark' ? '#f59e0b' : 'var(--text-muted)',
                }}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reader Mode Button */}
      <button
        className="toolbar-btn"
        id="btn-reader-mode"
        onClick={onToggleReaderMode}
        title="Distraction-Free Reader Mode (Ctrl+Shift+R)"
      >
        <BookOpen size={14} />
      </button>

      {/* Floating Video (Picture-in-Picture) Button */}
      <button
        className="toolbar-btn"
        id="btn-pip-video"
        onClick={onTriggerPiP}
        title="Floating Video Picture-in-Picture (Ctrl+Shift+P / F8)"
      >
        <Tv size={14} />
      </button>

      {/* ⬡ Auto-Detect Localhost Button */}
      <div style={{ position: 'relative' }}>
        <button
          id="btn-auto-detect-ports"
          className="toolbar-btn"
          onClick={handleTriggerAutoDetect}
          title="Auto-Detect Localhost Servers (Ctrl+Shift+L)"
          style={{
            position: 'relative',
            color: detectedServersCount > 0 ? 'var(--green)' : 'var(--text-secondary)',
            borderColor: detectedServersCount > 0 ? 'rgba(34, 197, 94, 0.4)' : undefined,
          }}
        >
          <Cpu size={14} />
          {detectedServersCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              background: 'var(--green)', color: '#000',
              fontSize: 9, fontWeight: 700, borderRadius: '50%',
              width: 13, height: 13, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {detectedServersCount}
            </span>
          )}
        </button>

        {/* Auto Detect Menu Dropdown */}
        {showAutoDetectMenu && (
          <div className="auto-detect-dropdown" style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            width: 260, background: 'var(--bg-elevated)',
            border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-dropdown)', zIndex: 450, padding: '8px 0',
          }}>
            <div style={{ padding: '4px 12px 6px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
              LOCAL DEV SERVERS
            </div>
            {recentServers.length === 0 ? (
              <div style={{ padding: 14, fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                No active servers found.
              </div>
            ) : (
              recentServers.map(s => (
                <div
                  key={s.port}
                  onClick={() => { onNavigate(s.url); setShowAutoDetectMenu(false) }}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background var(--t-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>:{s.port} {s.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.url}</div>
                  </div>
                  <span style={{ color: 'var(--green)', fontSize: 12 }}>●</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Split View Quick Button */}
      <button
        className={`toolbar-btn ${isSplitView ? 'active' : ''}`}
        id="btn-split-view"
        onClick={onToggleSplitView}
        title="Split View (2 Apps Side-by-Side) — Ctrl+\"
      >
        <Split size={14} />
      </button>

      {/* Media HUD Button (Click to Open Media Drawer) */}
      <button
        className={`toolbar-btn ${activePanel === 'media' ? 'active' : ''}`}
        id="btn-media-hud"
        onClick={(e) => {
          e.stopPropagation()
          setShowAutoDetectMenu(false)
          setShowPrivacyPopover(false)
          onTogglePanel('media')
        }}
        title="Media HUD Controller & Player (Ctrl+Shift+M)"
        style={{
          color: isAudioPlaying ? 'var(--accent-primary)' : undefined,
          borderColor: isAudioPlaying ? 'var(--border-bright)' : undefined,
          background: isAudioPlaying ? 'rgba(0, 212, 255, 0.15)' : undefined,
        }}
      >
        {isAudioPlaying ? (
          <Volume2 size={15} style={{ animation: 'pulse 1.5s infinite', color: 'var(--accent-primary)' }} />
        ) : (
          <Music size={14} />
        )}
      </button>

      {/* VPN Status & Quick Tunnel Switcher */}
      <button
        className={`toolbar-btn ${vpnConfig.mode !== 'direct' ? 'active' : ''}`}
        id="btn-vpn-status"
        onClick={(e) => {
          e.stopPropagation()
          setShowAutoDetectMenu(false)
          setShowPrivacyPopover(false)
          onTogglePanel('extensions')
        }}
        title={`VPN Status: ${vpnConfig.mode !== 'direct' ? `Active (${vpnConfig.region?.toUpperCase() || 'PROXY'})` : 'Direct (Click to connect VPN)'}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 7px',
          background: vpnConfig.mode !== 'direct' ? 'rgba(34, 197, 94, 0.15)' : undefined,
          borderColor: vpnConfig.mode !== 'direct' ? 'rgba(34, 197, 94, 0.5)' : undefined,
          color: vpnConfig.mode !== 'direct' ? 'var(--green)' : 'var(--text-muted)',
        }}
      >
        <Shield size={13} style={{ color: vpnConfig.mode !== 'direct' ? 'var(--green)' : undefined }} />
        <span style={{ fontSize: 10, fontWeight: 700 }}>
          {vpnConfig.mode !== 'direct' ? (vpnConfig.region?.toUpperCase() || 'VPN ON') : 'VPN'}
        </span>
      </button>

      {/* Extensions Manager & Active Ext Launcher */}
      <button
        className={`toolbar-btn ${activePanel === 'extensions' ? 'active' : ''}`}
        id="btn-extensions-hub"
        onClick={(e) => {
          e.stopPropagation()
          setShowAutoDetectMenu(false)
          setShowPrivacyPopover(false)
          onTogglePanel('extensions')
        }}
        title="Extensions, VPNs & Custom Scripts"
      >
        <Puzzle size={14} style={{ color: 'var(--accent-secondary)' }} />
      </button>

      {/* DevTools Inspector Button (Normal & Dev Mode) */}
      {(mode === 'normal' || mode === 'dev') && (
        <button
          className="toolbar-btn"
          id="btn-devtools"
          onClick={onToggleDevTools}
          title="Chromium DevTools Inspector (F12)"
        >
          <Wrench size={13} style={{ color: 'var(--accent-primary)' }} />
        </button>
      )}

      {/* Theme Studio Quick Button */}
      <button
        className={`toolbar-btn ${activePanel === 'theme' ? 'active' : ''}`}
        id="btn-theme-studio"
        onClick={(e) => {
          e.stopPropagation()
          setShowAutoDetectMenu(false)
          setShowPrivacyPopover(false)
          onTogglePanel('theme')
        }}
        title="Theme Studio & Neon Accents"
      >
        <Palette size={14} style={{ color: 'var(--accent-primary)' }} />
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* Mode Selector */}
      <ModeSelector mode={mode} onModeChange={onModeChange} />

      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* ⬡ NeXus Hub Button */}
      <button
        id="btn-three-line-menu"
        className={`menu-btn ${activePanel === 'menu' ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          setShowAutoDetectMenu(false)
          setShowPrivacyPopover(false)
          onTogglePanel('menu')
        }}
        title="NeXus Hub & Developer Suite"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
        </svg>
      </button>
    </div>
  )
}
