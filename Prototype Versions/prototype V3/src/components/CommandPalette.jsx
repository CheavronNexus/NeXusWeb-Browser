import React, { useState, useEffect, useRef } from 'react'

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onModeChange,
  onToggleTheme,
  onToggleSplitView,
  onOpenPanel,
  onNewTab,
  onTriggerPiP,
  onToggleTerminal,
  onCaptureScreenshot,
  currentMode,
  currentTheme,
  tabs = [],
  onSwitchTab,
  onToggleMediaHUD,
}) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build command list
  const baseCommands = [
    { id: 'new-tab', title: 'New Tab', subtitle: 'Open a blank tab', icon: '➕', category: 'Tabs', action: () => onNewTab() },
    { id: 'split-view', title: 'Toggle Split View', subtitle: 'View two applications side by side', icon: '🪟', category: 'Layout', action: () => onToggleSplitView() },
    { id: 'toggle-theme', title: `Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`, subtitle: 'Toggle overall color theme', icon: '🌓', category: 'Theme', action: () => onToggleTheme() },
    { id: 'mode-normal', title: 'Set Mode: Normal Web', subtitle: 'Full internet with DuckDuckGo Privacy Shield', icon: '🛡️', category: 'Network', action: () => onModeChange('normal') },
    { id: 'mode-strict', title: 'Set Mode: Strict Offline', subtitle: 'Localhost & offline files only', icon: '🔒', category: 'Network', action: () => onModeChange('strict') },
    { id: 'mode-lan', title: 'Set Mode: Local Network (LAN)', subtitle: 'Access local network devices (192.168.x.x)', icon: '📡', category: 'Network', action: () => onModeChange('lan') },
    { id: 'mode-dev', title: 'Set Mode: Developer Mode', subtitle: 'Unrestricted access + DevTools', icon: '⚡', category: 'Network', action: () => onModeChange('dev') },
    { id: 'panel-ports', title: 'Open Port Manager', subtitle: 'View active dev servers and processes', icon: '🔌', category: 'DevTools', action: () => onOpenPanel('ports') },
    { id: 'panel-inspector', title: 'Open Request Inspector', subtitle: 'Inspect network requests and latency', icon: '🌐', category: 'DevTools', action: () => onOpenPanel('inspector') },
    { id: 'panel-env', title: 'Open Env Variables Panel', subtitle: 'View and copy .env file values', icon: '🔑', category: 'DevTools', action: () => onOpenPanel('env') },
    { id: 'panel-terminal', title: 'Toggle Multi-Terminal', subtitle: 'Open integrated PowerShell / bash shell', icon: '⌨️', category: 'DevTools', action: () => onToggleTerminal() },
    { id: 'panel-bookmarks', title: 'Open Bookmarks', subtitle: 'View all saved links', icon: '★', category: 'Browser', action: () => onOpenPanel('bookmarks') },
    { id: 'panel-history', title: 'Open History', subtitle: 'View recent browsing history', icon: '🕒', category: 'Browser', action: () => onOpenPanel('history') },
    { id: 'panel-notes', title: 'Open Scratch Pad / Notes', subtitle: 'Keep developer scratch notes', icon: '📝', category: 'Browser', action: () => onOpenPanel('notes') },
    { id: 'panel-downloads', title: 'Open Downloads', subtitle: 'View downloaded files', icon: '⬇️', category: 'Browser', action: () => onOpenPanel('downloads') },
    { id: 'panel-settings', title: 'Open Settings & Privacy', subtitle: 'Configure search engines and privacy shield', icon: '⚙️', category: 'Browser', action: () => onOpenPanel('settings') },
    { id: 'panel-shortcuts', title: 'Keyboard Shortcuts Help', subtitle: 'List all browser key combinations', icon: '⌨️', category: 'Help', action: () => onOpenPanel('shortcuts') },
    { id: 'panel-about', title: 'About NeXusWeb', subtitle: 'Why use it, Vision, Features & Architecture', icon: 'ℹ️', category: 'Help', action: () => onOpenPanel('about') },
    { id: 'action-media-hud', title: 'Floating Media HUD Controller', subtitle: 'Toggle floating media controls bar (Ctrl+Shift+M)', icon: '🎵', category: 'Media', action: () => onToggleMediaHUD?.() },
    { id: 'action-pip', title: 'Floating Video (Picture-in-Picture)', subtitle: 'Pop out active video into floating window', icon: '📺', category: 'Media', action: () => onTriggerPiP() },
    { id: 'action-screenshot', title: 'Capture Screenshot', subtitle: 'Save high-res screenshot to Desktop', icon: '📸', category: 'Media', action: () => onCaptureScreenshot() },
    { id: 'nav-home', title: 'Go to Home Hub', subtitle: 'nexusweb://home', icon: '⌂', category: 'Navigation', action: () => onNavigate('nexusweb://home') },
  ]

  // Add open tabs to switcher list
  const tabCommands = tabs.map(t => ({
    id: `switch-tab-${t.id}`,
    title: `Switch to Tab: ${t.title || t.url || 'Tab'}`,
    subtitle: t.url,
    icon: '📑',
    category: 'Open Tabs',
    action: () => onSwitchTab(t.id),
  }))

  const allItems = [...tabCommands, ...baseCommands]

  const filtered = query.trim() === ''
    ? allItems.slice(0, 10)
    : allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12)

  // Direct URL navigation fallback if query looks like URL / Port
  const isDirectNav = query.trim().length > 0 && !filtered.some(f => f.title.toLowerCase() === query.toLowerCase())
  const finalItems = isDirectNav ? [
    {
      id: 'direct-nav',
      title: `Navigate to "${query}"`,
      subtitle: /^\d+$/.test(query) ? `http://localhost:${query}` : query,
      icon: '🚀',
      category: 'Navigate',
      action: () => onNavigate(query),
    },
    ...filtered,
  ] : filtered

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(prev => (prev + 1) % Math.max(1, finalItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(prev => (prev - 1 + finalItems.length) % Math.max(1, finalItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = finalItems[selectedIdx]
      if (item) {
        item.action()
        onClose()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="command-palette-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 14, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        className="command-palette-box"
        onClick={e => e.stopPropagation()}
        style={{
          width: 580,
          maxWidth: '92vw',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 20px var(--accent-primary-dim)',
          overflow: 'hidden',
          animation: 'slideUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Input bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 12,
        }}>
          <span style={{ fontSize: 16, color: 'var(--accent-primary)' }}>⚡</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, switch tab, or type a URL..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIdx(0)
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
            }}
          />
          <span style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-dim)',
          }}>
            ESC to close
          </span>
        </div>

        {/* Results list */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '6px 0' }}>
          {finalItems.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No matching commands or tabs found
            </div>
          ) : (
            finalItems.map((item, idx) => {
              const isSelected = idx === selectedIdx
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    transition: 'background var(--t-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{
                        fontSize: 13,
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: 500,
                      }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-base)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                  }}>
                    {item.category}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          <div>
            <span>↑↓ Navigate</span>
            <span style={{ margin: '0 8px' }}>•</span>
            <span>↵ Select</span>
          </div>
          <div>NeXusWeb Command Launcher</div>
        </div>
      </div>
    </div>
  )
}
