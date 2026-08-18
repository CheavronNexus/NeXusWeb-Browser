import React, { useState, useEffect } from 'react'
import ModeSelector from './ModeSelector'

function getUrlType(url) {
  if (!url || url === 'nexusweb://home') return 'home'
  if (url.startsWith('file://'))  return 'file'
  if (url.match(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/)) return 'local'
  if (url.startsWith('https://')) return 'secure'
  return 'remote'
}

const TYPE_ICONS = {
  home:   { icon: '⌂', color: 'var(--text-muted)' },
  file:   { icon: '📁', color: 'var(--accent-secondary)' },
  local:  { icon: '⬡', color: 'var(--accent-primary)' },
  secure: { icon: '🔒', color: 'var(--green)' },
  remote: { icon: '🌐', color: 'var(--text-muted)' },
}

export default function AddressBar({
  url, mode, loading, canGoBack, canGoForward, bookmarked, activePanel, addressInputRef,
  onNavigate, onBack, onForward, onReload,
  onNewTab, onToggleTerminal, onToggleDevTools, showTerminal, onModeChange,
  onToggleBookmark, onToggleBookmarks, onToggleHistory, onToggleSettings,
}) {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)
  const urlType = getUrlType(url)
  const typeInfo = TYPE_ICONS[urlType]

  useEffect(() => {
    if (!focused) {
      setInputValue(url === 'nexusweb://home' ? '' : (url || ''))
    }
  }, [url, focused])

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = inputValue.trim()
    onNavigate(val || 'nexusweb://home')
    addressInputRef?.current?.blur()
    setFocused(false)
  }

  const handleFocus = () => {
    setFocused(true)
    setTimeout(() => addressInputRef?.current?.select(), 10)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setInputValue(url === 'nexusweb://home' ? '' : (url || ''))
      setFocused(false)
      addressInputRef?.current?.blur()
    }
  }

  return (
    <div className="address-bar-row">
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
      <button className="nav-btn" id="btn-reload" onClick={onReload} title="Reload (F5 / Ctrl+R)" style={{ position: 'relative' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          style={loading ? { animation: 'spin 0.7s linear infinite', transformOrigin: '7px 7px' } : {}}>
          <path d="M12 7A5 5 0 1 1 9.5 3"/>
          <polyline points="10,1 9.5,3 12,3.5"/>
        </svg>
      </button>

      {/* Address input */}
      <form style={{ flex: 1, display: 'flex' }} onSubmit={handleSubmit}>
        <div className="address-input-wrap" style={{ flex: 1 }}>
          <span style={{ color: typeInfo.color, fontSize: 13, flexShrink: 0 }}>
            {typeInfo.icon}
          </span>
          <input
            ref={addressInputRef}
            id="address-input"
            className="address-input"
            type="text"
            value={focused ? inputValue : (url === 'nexusweb://home' ? '' : (url || ''))}
            onChange={e => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="URL · port number · or localhost:3000"
            spellCheck={false}
            autoComplete="off"
          />
          {focused && inputValue && (
            <button type="button"
              onClick={() => setInputValue('')}
              style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}>
              ✕
            </button>
          )}

          {/* Bookmark star — inline in address bar */}
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

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* Bookmarks toggle */}
      <button
        className={`toolbar-btn ${activePanel === 'bookmarks' ? 'active' : ''}`}
        id="btn-bookmarks"
        onClick={onToggleBookmarks}
        title="Bookmarks (Ctrl+B)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 1h8a1 1 0 0 1 1 1v10l-5-3-5 3V2a1 1 0 0 1 1-1z"/>
        </svg>
      </button>

      {/* History toggle */}
      <button
        className={`toolbar-btn ${activePanel === 'history' ? 'active' : ''}`}
        id="btn-history"
        onClick={onToggleHistory}
        title="History (Ctrl+H)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="7" cy="7" r="5.5"/>
          <polyline points="7,4 7,7 9,9"/>
          <path d="M1.5 5A5.5 5.5 0 0 1 4 2"/>
          <polyline points="1.5,3 1.5,5 3.5,5"/>
        </svg>
      </button>

      {/* Terminal toggle */}
      <button
        className={`toolbar-btn ${showTerminal ? 'active' : ''}`}
        id="btn-terminal"
        onClick={onToggleTerminal}
        title="Terminal (Ctrl+`)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="1" y="2" width="12" height="10" rx="1.5"/>
          <polyline points="3.5,5.5 6,7 3.5,8.5"/>
          <line x1="7" y1="8.5" x2="10.5" y2="8.5"/>
        </svg>
      </button>

      {/* DevTools — dev mode only */}
      {mode === 'dev' && (
        <button className="toolbar-btn" id="btn-devtools" onClick={onToggleDevTools} title="DevTools (F12)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <polyline points="4,5 1.5,7.5 4,10"/>
            <polyline points="10,5 12.5,7.5 10,10"/>
            <line x1="8.5" y1="3" x2="5.5" y2="12"/>
          </svg>
        </button>
      )}

      {/* Settings */}
      <button
        className={`toolbar-btn ${activePanel === 'settings' ? 'active' : ''}`}
        id="btn-settings"
        onClick={onToggleSettings}
        title="Settings"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="7" cy="7" r="2"/>
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1"/>
        </svg>
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* Mode selector */}
      <ModeSelector mode={mode} onModeChange={onModeChange} />
    </div>
  )
}
