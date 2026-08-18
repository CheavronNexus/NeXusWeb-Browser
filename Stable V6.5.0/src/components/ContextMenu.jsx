import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, Check } from 'lucide-react'

export default function ContextMenu({
  x,
  y,
  targetUrl,
  selectedText,
  onClose,
  onNewTab,
  onOpenNewWindow,
  onCreatePrivateDen,
  onOpenContainerTab,
  onToggleBookmark,
  isBookmarked,
  onOpenBookmarksManager,
  showOtherBookmarks = true,
  onToggleOtherBookmarks,
  onToggleBookmarksToolbar,
  bookmarksToolbarState = 'always',
}) {
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Adjust positioning if near screen edges
  const adjustedX = Math.min(x, window.innerWidth - 240)
  const adjustedY = Math.min(y, window.innerHeight - 440)

  const handleCopy = () => {
    onClose()
    if (selectedText) {
      navigator.clipboard.writeText(selectedText).catch(() => {})
    } else if (targetUrl) {
      navigator.clipboard.writeText(targetUrl).catch(() => {})
    } else {
      document.execCommand('copy')
    }
  }

  const handleCut = () => {
    onClose()
    document.execCommand('cut')
  }

  const handlePaste = async () => {
    onClose()
    try {
      const text = await navigator.clipboard.readText()
      document.execCommand('insertText', false, text)
    } catch (e) {}
  }

  return (
    <div
      ref={menuRef}
      className="nexus-context-menu"
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        zIndex: 100000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Open in New Tab */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onNewTab(targetUrl); }}
      >
        <span>Open in Ne<span className="accesskey">w</span> Tab</span>
      </div>

      {/* 2. Open in New Container Tab > */}
      <div
        className="context-menu-item has-submenu"
        onMouseEnter={() => setActiveSubmenu('container')}
        onMouseLeave={() => setActiveSubmenu(null)}
        onClick={() => setActiveSubmenu(activeSubmenu === 'container' ? null : 'container')}
      >
        <span>Open i<span className="accesskey">n</span> New Container Tab</span>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />

        {activeSubmenu === 'container' && (
          <div className="context-submenu" style={{ top: 0, left: '100%' }}>
            <div className="context-menu-item" onClick={() => { onClose(); onOpenContainerTab?.('Personal', targetUrl); }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginRight: 8 }} />
              <span>Personal</span>
            </div>
            <div className="context-menu-item" onClick={() => { onClose(); onOpenContainerTab?.('Work', targetUrl); }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginRight: 8 }} />
              <span>Work</span>
            </div>
            <div className="context-menu-item" onClick={() => { onClose(); onOpenContainerTab?.('Banking', targetUrl); }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginRight: 8 }} />
              <span>Banking</span>
            </div>
            <div className="context-menu-item" onClick={() => { onClose(); onOpenContainerTab?.('Shopping', targetUrl); }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ec4899', marginRight: 8 }} />
              <span>Shopping</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Open in New Window */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onOpenNewWindow ? onOpenNewWindow(targetUrl) : onNewTab(targetUrl); }}
      >
        <span>Open in <span className="accesskey">N</span>ew Window</span>
      </div>

      {/* 4. Open in New Private Window */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onCreatePrivateDen?.(); }}
      >
        <span>Open in New <span className="accesskey">P</span>rivate Window</span>
      </div>

      <div className="context-menu-separator" />

      {/* 5. Edit Bookmark... */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onOpenBookmarksManager?.(); }}
      >
        <span><span className="accesskey">E</span>dit Bookmark...</span>
      </div>

      {/* 6. Delete Bookmark */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onToggleBookmark?.(); }}
      >
        <span><span className="accesskey">D</span>elete Bookmark</span>
      </div>

      <div className="context-menu-separator" />

      {/* 7. Cut */}
      <div className="context-menu-item" onClick={handleCut}>
        <span>Cu<span className="accesskey">t</span></span>
      </div>

      {/* 8. Copy */}
      <div className="context-menu-item" onClick={handleCopy}>
        <span><span className="accesskey">C</span>opy</span>
      </div>

      {/* 9. Paste */}
      <div className="context-menu-item" onClick={handlePaste}>
        <span><span className="accesskey">P</span>aste</span>
      </div>

      <div className="context-menu-separator" />

      {/* 10. Add Bookmark... */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onToggleBookmark?.(); }}
      >
        <span>Add <span className="accesskey">B</span>ookmark...</span>
      </div>

      {/* 11. Add Folder... */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onOpenBookmarksManager?.(); }}
      >
        <span>Add <span className="accesskey">F</span>older...</span>
      </div>

      {/* 12. Add Separator */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); }}
      >
        <span>Add <span className="accesskey">S</span>eparator</span>
      </div>

      <div className="context-menu-separator" />

      {/* 13. Bookmarks Toolbar > */}
      <div
        className="context-menu-item has-submenu"
        onMouseEnter={() => setActiveSubmenu('toolbar')}
        onMouseLeave={() => setActiveSubmenu(null)}
        onClick={() => setActiveSubmenu(activeSubmenu === 'toolbar' ? null : 'toolbar')}
      >
        <span><span className="accesskey">B</span>ookmarks Toolbar</span>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />

        {activeSubmenu === 'toolbar' && (
          <div className="context-submenu" style={{ top: 0, left: '100%' }}>
            <div className="context-menu-item" onClick={() => { onClose(); onToggleBookmarksToolbar?.('always'); }}>
              {bookmarksToolbarState === 'always' && <Check size={13} style={{ marginRight: 6 }} />}
              <span style={{ marginLeft: bookmarksToolbarState === 'always' ? 0 : 19 }}>Always Show</span>
            </div>
            <div className="context-menu-item" onClick={() => { onClose(); onToggleBookmarksToolbar?.('newtab'); }}>
              {bookmarksToolbarState === 'newtab' && <Check size={13} style={{ marginRight: 6 }} />}
              <span style={{ marginLeft: bookmarksToolbarState === 'newtab' ? 0 : 19 }}>Only on New Tab</span>
            </div>
            <div className="context-menu-item" onClick={() => { onClose(); onToggleBookmarksToolbar?.('never'); }}>
              {bookmarksToolbarState === 'never' && <Check size={13} style={{ marginRight: 6 }} />}
              <span style={{ marginLeft: bookmarksToolbarState === 'never' ? 0 : 19 }}>Never Show</span>
            </div>
          </div>
        )}
      </div>

      {/* 14. Show Other Bookmarks */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onToggleOtherBookmarks?.(); }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showOtherBookmarks ? <Check size={14} style={{ color: '#f1f5f9' }} /> : <span style={{ width: 14 }} />}
          <span>Show <span className="accesskey">O</span>ther Bookmarks</span>
        </span>
      </div>

      {/* 15. Manage Bookmarks */}
      <div
        className="context-menu-item"
        onClick={() => { onClose(); onOpenBookmarksManager?.(); }}
      >
        <span style={{ marginLeft: 20 }}><span className="accesskey">M</span>anage Bookmarks</span>
      </div>

    </div>
  )
}
