import React, { useState, useEffect, useRef } from 'react'
import {
  ChevronRight, ZoomIn, ZoomOut, Maximize2, X, Plus, ExternalLink,
  Shield, Bookmark, History, Download, Key, Puzzle, Printer, Save,
  Search, Settings, Wrench, AlertCircle, HelpCircle, LogOut, FileText
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
    window.nexus?.setDrawerWidth?.(260)
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

  return (
    <div
      ref={menuRef}
      className="nexus-app-menu-dropdown"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 260,
        height: '100%',
        background: '#161822',
        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.70)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 300,
        userSelect: 'none',
        fontFamily: 'var(--font-sans)',
        color: '#e2e8f0',
        padding: '8px 0',
        overflowY: 'auto',
        animation: 'slideInRight 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      
      {/* Group 1: New Tab, New Window, New Private Window */}
      <div className="nexus-menu-row" onClick={() => { onClose(); onNewTab?.(); }}>
        <div className="nexus-menu-item-left">
          <Plus size={14} className="nexus-menu-icon" />
          <span>New Tab</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+T</span>
      </div>

      <div className="nexus-menu-row" onClick={() => { onClose(); onOpenNewWindow ? onOpenNewWindow() : onNewTab?.(); }}>
        <div className="nexus-menu-item-left">
          <ExternalLink size={14} className="nexus-menu-icon" />
          <span>New Window</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+N</span>
      </div>

      <div className="nexus-menu-row" onClick={() => { onClose(); onCreatePrivateDen?.(); }}>
        <div className="nexus-menu-item-left">
          <Shield size={14} className="nexus-menu-icon" style={{ color: 'var(--accent-primary)' }} />
          <span>New Private Window</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+Shift+P</span>
      </div>

      <div className="nexus-menu-divider" />

      {/* Group 2: Bookmarks, History, Downloads, Passwords, Extensions */}
      <div
        className="nexus-menu-row"
        onMouseEnter={() => setActiveSubmenu('bookmarks')}
        onClick={() => setActiveSubmenu(activeSubmenu === 'bookmarks' ? null : 'bookmarks')}
      >
        <div className="nexus-menu-item-left">
          <Bookmark size={14} className="nexus-menu-icon" />
          <span>Bookmarks</span>
        </div>
        <ChevronRight size={13} style={{ color: '#64748b' }} />

        {/* Bookmarks Submenu Flyout */}
        {activeSubmenu === 'bookmarks' && (
          <div className="nexus-submenu-flyout" style={{ top: 0, right: '100%', marginRight: 4, width: 210 }}>
            <div className="nexus-menu-row" onClick={() => { onClose(); onToggleBookmarksBar?.(); }}>
              <span>Show Bookmarks Bar</span>
              <span className="nexus-menu-shortcut">Ctrl+Shift+B</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('bookmarks'); }}>
              <span>Manage Bookmarks</span>
              <span className="nexus-menu-shortcut">Ctrl+B</span>
            </div>
          </div>
        )}
      </div>

      <div
        className="nexus-menu-row"
        onMouseEnter={() => setActiveSubmenu('history')}
        onClick={() => setActiveSubmenu(activeSubmenu === 'history' ? null : 'history')}
      >
        <div className="nexus-menu-item-left">
          <History size={14} className="nexus-menu-icon" />
          <span>History</span>
        </div>
        <ChevronRight size={13} style={{ color: '#64748b' }} />

        {/* History Submenu Flyout */}
        {activeSubmenu === 'history' && (
          <div className="nexus-submenu-flyout" style={{ top: 0, right: '100%', marginRight: 4, width: 200 }}>
            <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('history'); }}>
              <span>Browsing History</span>
              <span className="nexus-menu-shortcut">Ctrl+H</span>
            </div>
          </div>
        )}
      </div>

      <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('downloads'); }}>
        <div className="nexus-menu-item-left">
          <Download size={14} className="nexus-menu-icon" />
          <span>Downloads</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+J</span>
      </div>

      <div className="nexus-menu-row" onClick={() => { onClose(); onOpenSettings?.('system'); }}>
        <div className="nexus-menu-item-left">
          <Key size={14} className="nexus-menu-icon" />
          <span>Passwords & Autofill</span>
        </div>
      </div>

      <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('extensions'); }}>
        <div className="nexus-menu-item-left">
          <Puzzle size={14} className="nexus-menu-icon" style={{ color: 'var(--accent-secondary)' }} />
          <span>Extensions & VPNs</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+Shift+A</span>
      </div>

      <div className="nexus-menu-divider" />

      {/* Group 3: Print, Save, Find, Zoom */}
      <div className="nexus-menu-row" onClick={handlePrint}>
        <div className="nexus-menu-item-left">
          <Printer size={14} className="nexus-menu-icon" />
          <span>Print...</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+P</span>
      </div>

      <div className="nexus-menu-row" onClick={handleSavePage}>
        <div className="nexus-menu-item-left">
          <Save size={14} className="nexus-menu-icon" />
          <span>Save Page As...</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+S</span>
      </div>

      <div className="nexus-menu-row" onClick={() => { onClose(); onToggleFind?.(); }}>
        <div className="nexus-menu-item-left">
          <Search size={14} className="nexus-menu-icon" />
          <span>Find in Page...</span>
        </div>
        <span className="nexus-menu-shortcut">Ctrl+F</span>
      </div>

      {/* Inline Zoom Control: - 100% + [Fullscreen] */}
      <div className="nexus-menu-zoom-control">
        <span style={{ color: '#cbd5e1', fontSize: 12 }}>Zoom</span>
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
            style={{ fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 36, textAlign: 'center', cursor: 'pointer' }}
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

      <div className="nexus-menu-divider" />

      {/* Group 4: Settings, More Tools, Help */}
      <div className="nexus-menu-row" onClick={() => { onClose(); onOpenSettings?.(); }}>
        <div className="nexus-menu-item-left">
          <Settings size={14} className="nexus-menu-icon" />
          <span>Settings</span>
        </div>
      </div>

      <div
        className="nexus-menu-row"
        onMouseEnter={() => setActiveSubmenu('moreTools')}
        onClick={() => setActiveSubmenu(activeSubmenu === 'moreTools' ? null : 'moreTools')}
      >
        <div className="nexus-menu-item-left">
          <Wrench size={14} className="nexus-menu-icon" />
          <span>Developer Tools</span>
        </div>
        <ChevronRight size={13} style={{ color: '#64748b' }} />

        {/* More Tools Submenu Flyout */}
        {activeSubmenu === 'moreTools' && (
          <div className="nexus-submenu-flyout" style={{ top: 0, right: '100%', marginRight: 4, width: 230 }}>
            <div className="nexus-menu-row" onClick={() => { onClose(); onToggleDevTools?.(); }}>
              <span>Chromium DevTools</span>
              <span className="nexus-menu-shortcut">F12</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('inspector'); }}>
              <span>Request Inspector</span>
              <span className="nexus-menu-shortcut">Ctrl+Shift+I</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('ports'); }}>
              <span>Port Manager</span>
              <span className="nexus-menu-shortcut">Ctrl+Shift+L</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('api-workbench'); }}>
              <span>REST Workbench</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onToggleTerminal?.(); }}>
              <span>Terminal Shell</span>
              <span className="nexus-menu-shortcut">Ctrl+`</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onToggleSplitView?.(); }}>
              <span>Dual Split View</span>
              <span className="nexus-menu-shortcut">Ctrl+\</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onCaptureScreenshot?.(); }}>
              <span>Page Screenshot</span>
              <span className="nexus-menu-shortcut">F9</span>
            </div>
          </div>
        )}
      </div>

      <div
        className="nexus-menu-row"
        onMouseEnter={() => setActiveSubmenu('help')}
        onClick={() => setActiveSubmenu(activeSubmenu === 'help' ? null : 'help')}
      >
        <div className="nexus-menu-item-left">
          <HelpCircle size={14} className="nexus-menu-icon" />
          <span>Help & About</span>
        </div>
        <ChevronRight size={13} style={{ color: '#64748b' }} />

        {/* Help Submenu Flyout */}
        {activeSubmenu === 'help' && (
          <div className="nexus-submenu-flyout" style={{ top: 0, right: '100%', marginRight: 4, width: 200 }}>
            <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('about'); }}>
              <span>About NeXusWeb</span>
            </div>
            <div className="nexus-menu-row" onClick={() => { onClose(); onOpenPanel?.('shortcuts'); }}>
              <span>Shortcuts Help</span>
              <span className="nexus-menu-shortcut">F1</span>
            </div>
          </div>
        )}
      </div>

      <div className="nexus-menu-divider" />

      {/* Group 5: Exit */}
      <div className="nexus-menu-row" onClick={handleExit} style={{ color: '#f87171' }}>
        <div className="nexus-menu-item-left">
          <LogOut size={14} className="nexus-menu-icon" style={{ color: '#f87171' }} />
          <span>Exit NeXusWeb</span>
        </div>
        <span className="nexus-menu-shortcut" style={{ color: '#f87171' }}>Ctrl+Shift+Q</span>
      </div>

    </div>
  )
}
