import React, { useState, useEffect, useRef, useCallback } from 'react'
import ModeSelector from './ModeSelector'
import {
  Palette, Shield, Puzzle, Home, Folder, Cpu, Lock, Globe, Wrench,
  BookOpen, Tv, Search, Star, MoreVertical, X, SlidersHorizontal,
  Volume2, Music, Split, Check, ExternalLink, Settings, Sparkles
} from 'lucide-react'

function getUrlType(url) {
  if (!url || url === 'nexusweb://home') return 'home'
  if (url.startsWith('file://'))  return 'file'
  if (url.match(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/)) return 'local'
  if (url.startsWith('https://')) return 'secure'
  return 'remote'
}

let cachedServers = null
let lastServerFetchTime = 0

export default function AddressBar({
  url, mode, loading, canGoBack, canGoForward, bookmarked, activePanel, isSplitView, currentTheme,
  addressInputRef, detectedServersCount, activeTabId, isPrivateDen = false,
  onNavigate, onBack, onForward, onReload,
  onToggleTerminal, onToggleDevTools, showTerminal, onModeChange,
  onToggleBookmark, onTogglePanel, onToggleFind, onCaptureScreenshot, onToggleSplitView, onAutoDetectScan, onToggleTheme,
  onTriggerPiP, onToggleReaderMode, onOpenCommandPalette, privacyStats,
  onToggleMediaHUD, showMediaHUD, isAudioPlaying, onCreatePrivateDen, onWipeAndExit,
}) {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestIdx, setSelectedSuggestIdx] = useState(-1)
  const [showQuickTools, setShowQuickTools] = useState(false)
  const [showPrivacyPopover, setShowPrivacyPopover] = useState(false)
  const [recentServers, setRecentServers] = useState([])
  const [searchEngine, setSearchEngine] = useState({ name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' })
  const [vpnConfig, setVpnConfig] = useState({ mode: 'direct', region: 'direct' })
  const debounceTimerRef = useRef(null)
  const quickToolsRef = useRef(null)

  const urlType = getUrlType(url)

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
        badge: 'Search',
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

  // Click outside to close any open dropdown/popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showQuickTools && !e.target.closest('#btn-quick-tools') && !e.target.closest('.quick-tools-popover')) {
        setShowQuickTools(false)
      }
      if (showPrivacyPopover && !e.target.closest('#btn-privacy-shield') && !e.target.closest('.privacy-shield-popover')) {
        setShowPrivacyPopover(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [showQuickTools, showPrivacyPopover])

  const handleSetProxy = async (region) => {
    if (region === 'direct') {
      await window.nexus?.proxy?.setMode?.('direct')
      setVpnConfig({ mode: 'direct', region: 'direct' })
    } else {
      await window.nexus?.proxy?.setMode?.('proxy', region)
      setVpnConfig({ mode: 'proxy', region })
    }
  }

  return (
    <div className="address-bar-row" style={{ position: 'relative' }}>
      {/* 1. Back */}
      <button className="nav-btn" id="btn-back" onClick={onBack} disabled={!canGoBack} title="Go back (Alt+←)">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,2 4,7 9,12"/>
        </svg>
      </button>

      {/* 2. Forward */}
      <button className="nav-btn" id="btn-forward" onClick={onForward} disabled={!canGoForward} title="Go forward (Alt+→)">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5,2 10,7 5,12"/>
        </svg>
      </button>

      {/* 3. Reload */}
      <button className="nav-btn" id="btn-reload" onClick={onReload} title="Reload (F5 / Ctrl+R)">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          style={loading ? { animation: 'spin 0.7s linear infinite', transformOrigin: '7px 7px' } : {}}>
          <path d="M12 7A5 5 0 1 1 9.5 3"/>
          <polyline points="10,1 9.5,3 12,3.5"/>
        </svg>
      </button>

      {/* 4. EXPANDED Address Input & Autocomplete Container */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        <form style={{ flex: 1, display: 'flex' }} onSubmit={handleSubmit}>
          <div className="address-input-wrap" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Leading Search / Shield icon */}
            <button
              type="button"
              id="btn-privacy-shield"
              onClick={() => setShowPrivacyPopover(v => !v)}
              title="DuckDuckGo Privacy Shield & Security Info"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: mode === 'normal' ? 'var(--green)' : 'var(--accent-primary)',
                padding: '0 6px 0 2px',
              }}
            >
              <Search size={14} />
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
              placeholder={`Search ${searchEngine.name} or type a URL / port (e.g. 3000)`}
              autoComplete="off"
              spellCheck="false"
              style={{ flex: 1, border: 'none', background: 'transparent' }}
            />

            {focused && inputValue && (
              <button
                type="button"
                onClick={() => { setInputValue(''); setSuggestions([]) }}
                style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={13} />
              </button>
            )}

            {/* Trailing actions inside address pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Star Bookmark button */}
              <button
                type="button"
                id="btn-bookmark"
                onClick={onToggleBookmark}
                title={bookmarked ? 'Remove Bookmark (Ctrl+D)' : 'Bookmark this Tab (Ctrl+D)'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: bookmarked ? '#f59e0b' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Star size={14} fill={bookmarked ? '#f59e0b' : 'none'} />
              </button>
            </div>
          </div>
        </form>

        {/* Privacy Popover Dropdown */}
        {showPrivacyPopover && (
          <div
            className="privacy-shield-popover"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              width: 290, background: 'var(--bg-elevated)',
              border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-dropdown)', zIndex: 450, padding: 14,
              animation: 'fadeIn 0.12s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={15} style={{ color: 'var(--green)' }} />
                <span>Privacy & Security Shield</span>
              </div>
              <button onClick={() => setShowPrivacyPopover(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={13} />
              </button>
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
              Protected with zero external telemetry, DuckDuckGo-style anti-tracking, and encrypted tunnels.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'var(--bg-surface)', borderRadius: 4 }}>
                <span>Active Mode:</span>
                <span style={{ fontWeight: 700, color: mode === 'normal' ? 'var(--green)' : 'var(--accent-primary)' }}>{mode.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'var(--bg-surface)', borderRadius: 4 }}>
                <span>VPN Tunnel:</span>
                <span style={{ fontWeight: 700, color: vpnConfig.mode !== 'direct' ? 'var(--green)' : 'var(--text-muted)' }}>
                  {vpnConfig.mode !== 'direct' ? `ON (${vpnConfig.region?.toUpperCase()})` : 'DIRECT'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Autocomplete Suggestions Dropdown */}
        {focused && suggestions.length > 0 && (
          <div className="address-suggestions" style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-dropdown)',
            zIndex: 400, overflow: 'hidden',
          }}>
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className={`suggestion-item ${idx === selectedSuggestIdx ? 'selected' : ''}`}
                onMouseDown={() => {
                  onNavigate(item.url)
                  setSuggestions([])
                  setFocused(false)
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 12px', fontSize: 12, cursor: 'pointer',
                  background: idx === selectedSuggestIdx ? 'var(--bg-hover)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Toolbar Actions: Private Den Mode vs Normal Mode */}
      {isPrivateDen ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Quick VPN Selector Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 8,
            padding: '2px 4px',
            gap: 2,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', padding: '0 4px', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Globe size={11} />
              <span>VPN:</span>
            </span>
            {['direct', 'nl', 'us', 'sg', 'uk'].map(r => {
              const isActive = (vpnConfig.region || 'direct') === r
              return (
                <button
                  key={r}
                  onClick={async () => {
                    if (r === 'direct') {
                      await window.nexus?.proxy?.setMode?.('direct', 'direct')
                      setVpnConfig({ mode: 'direct', region: 'direct' })
                    } else {
                      const res = await window.nexus?.proxy?.setMode?.('proxy', r)
                      if (res?.config) setVpnConfig(res.config)
                      else setVpnConfig({ mode: 'proxy', region: r })
                    }
                  }}
                  style={{
                    border: 'none',
                    background: isActive ? '#8b5cf6' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: 9.5,
                    fontWeight: 700,
                    borderRadius: 4,
                    padding: '2px 5px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.12s ease',
                  }}
                  title={`Switch VPN tunnel to ${r.toUpperCase()}`}
                >
                  {r}
                </button>
              )
            })}
          </div>

          {/* Wipe & Exit Instant Action Button */}
          <button
            onClick={onWipeAndExit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              borderRadius: 8,
              padding: '4px 10px',
              color: '#fca5a5',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Wipe all in-memory cookies/cache and close Private Den"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
          >
            <span>🗑️</span>
            <span>Wipe & Exit</span>
          </button>
        </div>
      ) : (
        <>
          {/* 5. CONSOLIDATED Quick Tools Gear Button */}
          <button
            id="btn-quick-tools"
            className={`toolbar-btn ${activePanel === 'quick-tools' || vpnConfig.mode !== 'direct' || isAudioPlaying ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setShowPrivacyPopover(false)
              onTogglePanel('quick-tools')
            }}
            title="Quick Tools & Dev Utilities (VPN, Reader, Ports, HUD, Extensions)"
            style={{
              gap: 4,
              padding: '0 8px',
            }}
          >
            <SlidersHorizontal size={14} style={{ color: vpnConfig.mode !== 'direct' ? 'var(--green)' : isAudioPlaying ? 'var(--accent-primary)' : 'inherit' }} />
            {detectedServersCount > 0 && (
              <span style={{
                background: 'var(--green)',
                color: '#000',
                fontSize: 9,
                fontWeight: 800,
                borderRadius: 8,
                padding: '1px 4px',
                lineHeight: 1,
              }}>
                {detectedServersCount}
              </span>
            )}
          </button>

          <div style={{ width: 1, height: 18, background: 'var(--border-subtle)', flexShrink: 0 }} />

          {/* 6. Mode Selector (Normal | LAN | Strict | Dev) */}
          <ModeSelector mode={mode} onModeChange={onModeChange} />

          <div style={{ width: 1, height: 18, background: 'var(--border-subtle)', flexShrink: 0 }} />

          {/* 7. Plain, Sleek NeXus Menu Trigger Button */}
          <button
            id="btn-three-line-menu"
            className={`menu-btn ${activePanel === 'menu' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setShowPrivacyPopover(false)
              onTogglePanel('menu')
            }}
            title="NeXusWeb Menu (Alt+F)"
          >
            <MoreVertical size={16} />
          </button>
        </>
      )}
    </div>
  )
}
