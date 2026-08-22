import React, { useState, useEffect, useRef } from 'react'
import {
  ChevronRight, ZoomIn, ZoomOut, Maximize2, X, Plus, ExternalLink,
  Shield, Bookmark, History, Download, Key, Puzzle, Printer, Save,
  Search, Settings, Wrench, AlertCircle, HelpCircle, LogOut, FileText,
  Terminal, Split, Camera, Laptop, Activity
} from 'lucide-react'

export default function MenuDrawer({
  onClose,
  onNewTab,
  onOpenNewWindow,
  onCreatePrivateDen,
  onOpenPanel,
  onOpenCommandPalette,
  onToggleReaderMode,
  onTriggerPiP,
  onToggleTerminal,
  onToggleSplitView,
  onToggleDevTools,
  onToggleFind,
  onCaptureScreenshot,
  onToggleTheme,
  onOpenSettings,
  zoomFactor = 1.0,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleBookmarksBar,
  mode,
}) {
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const menuRef = useRef(null)

  // Sync exact menu width with Electron BrowserView
  useEffect(() => {
    window.nexus?.setDrawerWidth?.(275)
    return () => {
      window.nexus?.setDrawerWidth?.(0)
    }
  }, [])

  // Click outside to close menu
  useEffect(() => {
    let timer = null
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('#btn-three-line-menu') && !e.target.closest('#btn-menu-trigger')) {
        onClose()
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 60)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const zoomPercent = Math.round((zoomFactor || 1.0) * 100)

  const handlePrint = () => {
    onClose()
    window.print?.()
  }

  const handleSavePage = () => {
    onClose()
    window.nexus?.savePage?.()
  }

  const handleExit = () => {
    onClose()
    window.nexus?.close()
  }

  const handleFullscreen = () => {
    onClose()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const isPrivateDen = mode === 'private' || mode === 'privateden'

  return (
    <div
      ref={menuRef}
      className="nexus-app-menu-dropdown"
    >
      {/* 1. Header with Mode & Close */}
      <div className="nexus-menu-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            NeXusWeb Menu
          </span>
          <span style={{
            fontSize: 9.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)',
            background: isPrivateDen ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-card)',
            color: isPrivateDen ? '#c084fc' : 'var(--accent-primary)',
            border: '1px solid var(--glass-border)'
          }}>
            {isPrivateDen ? 'Private Den' : (mode ? `${mode} Mode` : 'V7.0')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="glass-btn-icon"
          style={{ width: 24, height: 24, borderRadius: 'var(--radius-xs)', border: 'none' }}
          title="Close Menu (Esc)"
        >
          <X size={13} />
        </button>
      </div>

      {/* Scrollable Menu Body */}
      <div className="nexus-menu-scroll-body">
        {/* 2. Top Quick Action 3-Button Grid */}
        <div className="nexus-menu-quick-grid">
          <div
            className="nexus-menu-quick-tile"
            onClick={() => { onClose(); onNewTab?.(); }}
            title="Open New Tab (Ctrl+T)"
          >
            <Plus size={15} color="var(--accent-primary)" />
            <span>New Tab</span>
          </div>

          <div
            className="nexus-menu-quick-tile"
            onClick={() => { onClose(); onOpenNewWindow ? onOpenNewWindow() : onNewTab?.(); }}
            title="Open New Window (Ctrl+N)"
          >
            <ExternalLink size={15} color="var(--cyan)" />
            <span>New Window</span>
          </div>

          <div
            className="nexus-menu-quick-tile"
            onClick={() => { onClose(); onCreatePrivateDen?.(); }}
            title="Open Private Den Sandbox (Ctrl+Shift+P)"
          >
            <Shield size={15} color="#c084fc" />
            <span>Private Den</span>
          </div>
        </div>

        {/* 3. Card Section: Browsing & Tools */}
        <div className="nexus-menu-card-section">
          {/* Bookmarks */}
          <div
            className={`nexus-menu-row ${activeSubmenu === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu(activeSubmenu === 'bookmarks' ? null : 'bookmarks')}
          >
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Bookmark size={13} className="nexus-menu-icon" />
              </div>
              <span style={{ fontWeight: activeSubmenu === 'bookmarks' ? 700 : 500 }}>Bookmarks</span>
            </div>
            <ChevronRight
              size={13}
              color="var(--text-muted)"
              style={{
                transform: activeSubmenu === 'bookmarks' ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>

          {/* Bookmarks Expanded Accordion */}
          {activeSubmenu === 'bookmarks' && (
            <div style={{
              background: 'var(--bg-hover)',
              borderRadius: 'var(--radius-xs)',
              margin: '2px 6px 4px 6px',
              padding: '3px 0',
              border: '1px solid var(--glass-border)',
            }}>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onToggleBookmarksBar?.(); }}>
                <span>Show Bookmarks Bar</span>
                <span className="nexus-menu-shortcut">Ctrl+Shift+B</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('bookmarks'); }}>
                <span>Manage Bookmarks</span>
                <span className="nexus-menu-shortcut">Ctrl+B</span>
              </div>
            </div>
          )}

          {/* History */}
          <div
            className={`nexus-menu-row ${activeSubmenu === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu(activeSubmenu === 'history' ? null : 'history')}
          >
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <History size={13} className="nexus-menu-icon" />
              </div>
              <span style={{ fontWeight: activeSubmenu === 'history' ? 700 : 500 }}>History</span>
            </div>
            <ChevronRight
              size={13}
              color="var(--text-muted)"
              style={{
                transform: activeSubmenu === 'history' ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>

          {/* History Expanded Accordion */}
          {activeSubmenu === 'history' && (
            <div style={{
              background: 'var(--bg-hover)',
              borderRadius: 'var(--radius-xs)',
              margin: '2px 6px 4px 6px',
              padding: '3px 0',
              border: '1px solid var(--glass-border)',
            }}>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('history'); }}>
                <span>Browsing History</span>
                <span className="nexus-menu-shortcut">Ctrl+H</span>
              </div>
            </div>
          )}

          {/* Downloads */}
          <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('downloads'); }}>
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Download size={13} className="nexus-menu-icon" />
              </div>
              <span>Downloads</span>
            </div>
            <span className="nexus-menu-shortcut">Ctrl+J</span>
          </div>

          {/* Passwords & Autofill */}
          <div className="nexus-menu-row" onClick={() => { onClose(); onOpenSettings?.('system'); }}>
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Key size={13} className="nexus-menu-icon" />
              </div>
              <span>Passwords & Autofill</span>
            </div>
          </div>

          {/* Extensions & VPNs */}
          <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('extensions'); }}>
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Puzzle size={13} className="nexus-menu-icon" style={{ color: 'var(--accent-secondary)' }} />
              </div>
              <span>Extensions & VPNs</span>
            </div>
            <span className="nexus-menu-shortcut">Ctrl+Shift+A</span>
          </div>
        </div>

        {/* 4. Card Section: Page Operations & Zoom */}
        <div className="nexus-menu-card-section">
          <div className="nexus-menu-row" onClick={handlePrint}>
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Printer size={13} className="nexus-menu-icon" />
              </div>
              <span>Print...</span>
            </div>
            <span className="nexus-menu-shortcut">Ctrl+P</span>
          </div>

          <div className="nexus-menu-row" onClick={handleSavePage}>
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Save size={13} className="nexus-menu-icon" />
              </div>
              <span>Save Page As...</span>
            </div>
            <span className="nexus-menu-shortcut">Ctrl+S</span>
          </div>

          <div className="nexus-menu-row" onClick={() => { onClose(); onToggleFind?.(); }}>
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Search size={13} className="nexus-menu-icon" />
              </div>
              <span>Find in Page...</span>
            </div>
            <span className="nexus-menu-shortcut">Ctrl+F</span>
          </div>

          {/* Inline Zoom Control Capsule */}
          <div className="nexus-menu-zoom-control">
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Zoom</span>
            <div className="zoom-btn-group">
              <button
                className="zoom-inline-btn"
                onClick={(e) => { e.stopPropagation(); onZoomOut?.(); }}
                title="Zoom out (Ctrl+-)"
              >
                -
              </button>
              <span
                onClick={(e) => { e.stopPropagation(); onZoomReset?.(); }}
                style={{ fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 38, textAlign: 'center', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}
                title="Reset Zoom (Ctrl+0)"
              >
                {zoomPercent}%
              </span>
              <button
                className="zoom-inline-btn"
                onClick={(e) => { e.stopPropagation(); onZoomIn?.(); }}
                title="Zoom in (Ctrl+=)"
              >
                +
              </button>
              <button
                className="zoom-inline-btn"
                onClick={handleFullscreen}
                title="Toggle Fullscreen (F11)"
              >
                <Maximize2 size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Card Section: Settings, Developer Tools, Help */}
        <div className="nexus-menu-card-section">
          <div className="nexus-menu-row" onClick={() => { onClose(); onOpenSettings?.(); }}>
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Settings size={13} className="nexus-menu-icon" />
              </div>
              <span>Settings</span>
            </div>
          </div>

          {/* Developer Tools Accordion */}
          <div
            className={`nexus-menu-row ${activeSubmenu === 'moreTools' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu(activeSubmenu === 'moreTools' ? null : 'moreTools')}
          >
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <Wrench size={13} className="nexus-menu-icon" />
              </div>
              <span style={{ fontWeight: activeSubmenu === 'moreTools' ? 700 : 500 }}>Developer Tools</span>
            </div>
            <ChevronRight
              size={13}
              color="var(--text-muted)"
              style={{
                transform: activeSubmenu === 'moreTools' ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>

          {/* More Tools Submenu Accordion */}
          {activeSubmenu === 'moreTools' && (
            <div style={{
              background: 'var(--bg-hover)',
              borderRadius: 'var(--radius-xs)',
              margin: '2px 6px 4px 6px',
              padding: '3px 0',
              border: '1px solid var(--glass-border)',
            }}>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onToggleDevTools?.(); }}>
                <span>Chromium DevTools</span>
                <span className="nexus-menu-shortcut">F12</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('inspector'); }}>
                <span>Request Inspector</span>
                <span className="nexus-menu-shortcut">Ctrl+Shift+I</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('ports'); }}>
                <span>Port Manager</span>
                <span className="nexus-menu-shortcut">Ctrl+Shift+L</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('api-workbench'); }}>
                <span>REST Workbench</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onToggleTerminal?.(); }}>
                <span>Terminal Shell</span>
                <span className="nexus-menu-shortcut">Ctrl+`</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onToggleSplitView?.(); }}>
                <span>Dual Split View</span>
                <span className="nexus-menu-shortcut">Ctrl+\</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onCaptureScreenshot?.(); }}>
                <span>Page Screenshot</span>
                <span className="nexus-menu-shortcut">F9</span>
              </div>
            </div>
          )}

          {/* Help & About Accordion */}
          <div
            className={`nexus-menu-row ${activeSubmenu === 'help' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu(activeSubmenu === 'help' ? null : 'help')}
          >
            <div className="nexus-menu-item-left">
              <div className="nexus-menu-icon-wrap">
                <HelpCircle size={13} className="nexus-menu-icon" />
              </div>
              <span style={{ fontWeight: activeSubmenu === 'help' ? 700 : 500 }}>Help & About</span>
            </div>
            <ChevronRight
              size={13}
              color="var(--text-muted)"
              style={{
                transform: activeSubmenu === 'help' ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>

          {/* Help Submenu Accordion */}
          {activeSubmenu === 'help' && (
            <div style={{
              background: 'var(--bg-hover)',
              borderRadius: 'var(--radius-xs)',
              margin: '2px 6px 4px 6px',
              padding: '3px 0',
              border: '1px solid var(--glass-border)',
            }}>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('help'); }}>
                <span>NeXusWeb Help Center</span>
                <span className="nexus-menu-shortcut">F1</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('about'); }}>
                <span>About NeXusWeb</span>
              </div>
              <div className="nexus-menu-subrow" onClick={() => { onClose(); onOpenPanel?.('shortcuts'); }}>
                <span>Shortcuts Matrix</span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Exit Button */}
        <div style={{ padding: '6px 12px 6px 12px', marginTop: 'auto' }}>
          <div
            className="nexus-menu-row"
            onClick={handleExit}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--red)',
              margin: 0,
              padding: '8px 12px'
            }}
          >
            <div className="nexus-menu-item-left">
              <LogOut size={14} color="var(--red)" />
              <span style={{ fontWeight: 700 }}>Exit NeXusWeb</span>
            </div>
            <span className="nexus-menu-shortcut" style={{ color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              Ctrl+Shift+Q
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
