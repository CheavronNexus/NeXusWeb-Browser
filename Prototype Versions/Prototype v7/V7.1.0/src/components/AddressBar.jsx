import React, { useState, useEffect, useRef, useCallback } from 'react'
import ModeSelector from './ModeSelector'
import {
  ArrowLeft, ArrowRight, RotateCw, Home, Lock, Globe, Star,
  Search, SlidersHorizontal, MoreVertical, X, Shield, Cpu, ExternalLink
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
  const [showPrivacyPopover, setShowPrivacyPopover] = useState(false)
  const [searchEngine, setSearchEngine] = useState({ name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' })
  const [vpnConfig, setVpnConfig] = useState({ mode: 'direct', region: 'direct' })
  const debounceTimerRef = useRef(null)

  const urlType = getUrlType(url)

  useEffect(() => {
    const checkVpn = async () => {
      try {
        const conf = await window.nexus?.proxy?.getConfig()
        if (conf) setVpnConfig(conf)
      } catch (e) {}
    }
    checkVpn()
    const interval = setInterval(checkVpn, 3000)
    return () => clearInterval(interval)
  }, [activePanel])

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

      list.push({
        type: 'search',
        label: `Search "${query}" with ${searchEngine.name}`,
        url: searchEngine.url.replace('{query}', encodeURIComponent(query)),
        badge: 'Search',
      })

      if (cachedServers && cachedServers.length > 0) {
        cachedServers.forEach(srv => {
          if (`localhost:${srv.port}`.includes(q) || (srv.title && srv.title.toLowerCase().includes(q))) {
            list.push({
              type: 'local',
              label: `localhost:${srv.port} (${srv.title || 'Dev Server'})`,
              url: `http://localhost:${srv.port}`,
              badge: `Port ${srv.port}`,
            })
          }
        })
      }

      bookmarks.forEach(bm => {
        if (bm.title?.toLowerCase().includes(q) || bm.url?.toLowerCase().includes(q)) {
          if (!list.some(x => x.url === bm.url)) {
            list.push({ type: 'bookmark', label: bm.title, url: bm.url, badge: 'Bookmark' })
          }
        }
      })

      history.forEach(h => {
        if (h.title?.toLowerCase().includes(q) || h.url?.toLowerCase().includes(q)) {
          if (!list.some(x => x.url === h.url)) {
            list.push({ type: 'history', label: h.title || h.url, url: h.url, badge: 'History' })
          }
        }
      })

      setSuggestions(list.slice(0, 6))
    }, 120)
  }, [searchEngine])

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    updateSuggestions(val)
    setSelectedSuggestIdx(-1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedSuggestIdx >= 0 && suggestions[selectedSuggestIdx]) {
      onNavigate(suggestions[selectedSuggestIdx].url)
    } else {
      let target = inputValue.trim()
      if (!target) {
        onNavigate('nexusweb://home')
      } else if (target.startsWith('localhost') || target.startsWith('127.0.0.1') || target.startsWith('0.0.0.0')) {
        onNavigate(`http://${target}`)
      } else if (target.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/)) {
        onNavigate(`https://${target}`)
      } else if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('nexusweb://') || target.startsWith('file://')) {
        onNavigate(target)
      } else {
        onNavigate(searchEngine.url.replace('{query}', encodeURIComponent(target)))
      }
    }
    setSuggestions([])
    setFocused(false)
    addressInputRef?.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setFocused(false)
      setSuggestions([])
      setInputValue(url === 'nexusweb://home' ? '' : (url || ''))
      addressInputRef?.current?.blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestIdx(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestIdx(prev => Math.max(prev - 1, -1))
    }
  }

  return (
    <div
      style={{
        height: 'var(--addrbar-h)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 10px',
        position: 'relative',
        zIndex: 200,
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      {/* 1. Monochromatic Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="glass-btn-icon"
          style={{ width: 28, height: 28, minWidth: 28, borderRadius: 'var(--radius-sm)', opacity: canGoBack ? 1 : 0.35 }}
          title="Back (Alt+Left)"
        >
          <ArrowLeft size={13} />
        </button>

        <button
          onClick={onForward}
          disabled={!canGoForward}
          className="glass-btn-icon"
          style={{ width: 28, height: 28, minWidth: 28, borderRadius: 'var(--radius-sm)', opacity: canGoForward ? 1 : 0.35 }}
          title="Forward (Alt+Right)"
        >
          <ArrowRight size={13} />
        </button>

        <button
          onClick={onReload}
          className="glass-btn-icon"
          style={{ width: 28, height: 28, minWidth: 28, borderRadius: 'var(--radius-sm)' }}
          title={loading ? 'Stop loading' : 'Reload (Ctrl+R)'}
        >
          <RotateCw size={12} className={loading ? 'spin-anim' : ''} />
        </button>

        <button
          onClick={() => onNavigate('nexusweb://home')}
          className="glass-btn-icon"
          style={{ width: 28, height: 28, minWidth: 28, borderRadius: 'var(--radius-sm)' }}
          title="Home Dashboard"
        >
          <Home size={13} />
        </button>
      </div>

      {/* 2. Frosted Glass Capsule Omnibox */}
      <div style={{ flex: 1, position: 'relative' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div
            className="glass-capsule"
            style={{
              height: 30,
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: 8,
            }}
          >
            {/* SSL / Security Lock Badge */}
            <button
              type="button"
              onClick={() => setShowPrivacyPopover(!showPrivacyPopover)}
              style={{
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: 0,
                color: urlType === 'secure' ? 'var(--green)' : 'var(--text-muted)',
              }}
              title="Connection info"
            >
              {urlType === 'secure' ? (
                <Lock size={12} />
              ) : urlType === 'local' ? (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>LOCAL</span>
              ) : (
                <Globe size={12} />
              )}
            </button>

            {/* Input Element */}
            <input
              ref={addressInputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                setFocused(true)
                if (inputValue) updateSuggestions(inputValue)
              }}
              onBlur={() => {
                setTimeout(() => setFocused(false), 200)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search or enter web address..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 12.5,
                fontWeight: 500,
                outline: 'none',
              }}
            />

            {/* Bookmark Star */}
            {url !== 'nexusweb://home' && (
              <button
                type="button"
                onClick={onToggleBookmark}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: bookmarked ? 'var(--yellow)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark this tab'}
              >
                <Star size={13} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </form>

        {/* Privacy Popover */}
        {showPrivacyPopover && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: 290,
              zIndex: 500,
              padding: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <Shield size={14} />
                <span>Privacy & Security</span>
              </div>
              <button onClick={() => setShowPrivacyPopover(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={13} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
              Zero-telemetry local browsing with WebRTC protection.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 10.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-xs)' }}>
                <span>Active Isolation:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{mode.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-xs)' }}>
                <span>Privacy Tunnel:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {vpnConfig.mode !== 'direct' ? `ON (${vpnConfig.region?.toUpperCase()})` : 'DIRECT'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Autocomplete Suggestions */}
        {focused && suggestions.length > 0 && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 400,
              padding: 4,
            }}
          >
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={() => {
                  onNavigate(item.url)
                  setSuggestions([])
                  setFocused(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  background: idx === selectedSuggestIdx ? 'var(--bg-hover)' : 'transparent',
                  transition: 'background 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <Search size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Clean Monochromatic Toolbar Tools */}
      {isPrivateDen ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Dedicated VPN Button in Private Den */}
          <button
            id="btn-quick-tools"
            onClick={(e) => {
              e.stopPropagation()
              setShowPrivacyPopover(false)
              onTogglePanel('quick-tools')
            }}
            className={`glass-btn ${activePanel === 'quick-tools' ? 'active' : ''}`}
            style={{
              height: 28,
              padding: '0 10px',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: vpnConfig.mode !== 'direct' ? 'rgba(74, 222, 128, 0.15)' : 'var(--bg-hover)',
              borderColor: vpnConfig.mode !== 'direct' ? 'var(--green)' : 'var(--glass-border)',
              color: vpnConfig.mode !== 'direct' ? 'var(--green)' : 'var(--text-primary)',
            }}
            title="Private Den VPN & Privacy Tunnel"
          >
            <Shield size={12} />
            <span>VPN{vpnConfig.mode !== 'direct' ? `: ${vpnConfig.region?.toUpperCase()}` : ''}</span>
          </button>

          {/* Wipe & Exit Button */}
          <button
            onClick={onWipeAndExit}
            className="glass-btn"
            style={{
              height: 28,
              padding: '0 10px',
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--bg-hover)',
              borderColor: 'var(--red)',
              color: 'var(--red)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Wipe RAM and exit sandbox"
          >
            <span>Wipe & Exit</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Quick Tools Trigger */}
          <button
            id="btn-quick-tools"
            onClick={(e) => {
              e.stopPropagation()
              setShowPrivacyPopover(false)
              onTogglePanel('quick-tools')
            }}
            className={`glass-btn ${activePanel === 'quick-tools' ? 'active' : ''}`}
            style={{
              height: 28,
              padding: '0 9px',
              fontSize: 11,
              fontWeight: 600,
            }}
            title="Quick Tools, VPN & Dev Utilities"
          >
            <SlidersHorizontal size={12} />
            <span>Tools</span>
            {detectedServersCount > 0 && (
              <span style={{
                background: 'var(--accent-primary)',
                color: 'var(--bg-base)',
                fontSize: 9,
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                padding: '0 4px',
                lineHeight: '14px',
              }}>
                {detectedServersCount}
              </span>
            )}
          </button>

          {/* Mode Selector */}
          <ModeSelector
            mode={mode}
            onModeChange={onModeChange}
            onOpenModeInfo={() => onTogglePanel?.('help')}
          />

          {/* Menu Drawer Button */}
          <button
            id="btn-three-line-menu"
            onClick={(e) => {
              e.stopPropagation()
              setShowPrivacyPopover(false)
              onTogglePanel('menu')
            }}
            className="glass-btn-icon"
            style={{ width: 28, height: 28, minWidth: 28, borderRadius: 'var(--radius-sm)' }}
            title="NeXusWeb Menu (Alt+F)"
          >
            <MoreVertical size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
