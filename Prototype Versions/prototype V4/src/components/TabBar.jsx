import React, { useState } from 'react'
import { Volume2, VolumeX, Copy, X, Plus, Globe } from 'lucide-react'

function Favicon({ favicon, loading }) {
  if (loading) {
    return <span className="tab-spinner" />
  }
  if (favicon) {
    return <img src={favicon} className="tab-favicon" alt="" onError={e => e.target.style.display = 'none'} />
  }
  return <span className="tab-default-icon" style={{ display: 'flex', alignItems: 'center' }}><Globe size={13} /></span>
}

export default function TabBar({
  tabs, activeTabId, onNewTab, onCloseTab, onSwitchTab, onReorderTabs, onToggleMuteTab
}) {
  const [draggedTabId, setDraggedTabId] = useState(null)
  const [dragOverTabId, setDragOverTabId] = useState(null)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, tabId }

  const handleDragStart = (e, tabId) => {
    setDraggedTabId(tabId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tabId)
  }

  const handleDragOver = (e, tabId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (tabId !== dragOverTabId) setDragOverTabId(tabId)
  }

  const handleDragLeave = () => {
    setDragOverTabId(null)
  }

  const handleDrop = (e, targetTabId) => {
    e.preventDefault()
    if (!draggedTabId || draggedTabId === targetTabId) {
      setDraggedTabId(null)
      setDragOverTabId(null)
      return
    }

    const fromIdx = tabs.findIndex(t => t.id === draggedTabId)
    const toIdx = tabs.findIndex(t => t.id === targetTabId)

    if (fromIdx !== -1 && toIdx !== -1 && onReorderTabs) {
      onReorderTabs(fromIdx, toIdx)
    }

    setDraggedTabId(null)
    setDragOverTabId(null)
  }

  const handleContextMenu = (e, tabId) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId,
    })
  }

  const closeContextMenu = () => setContextMenu(null)

  return (
    <div
      className="tab-bar"
      onClick={closeContextMenu}
      onContextMenu={(e) => e.preventDefault()}
      style={{ position: 'relative' }}
    >
      <div className="tabs-container">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isDragging = tab.id === draggedTabId
          const isOver = tab.id === dragOverTabId

          let cls = 'tab-item'
          if (isActive) cls += ' active'
          if (isDragging) cls += ' dragging'
          if (isOver) cls += ' drop-target'

          return (
            <div
              key={tab.id}
              id={`tab-item-${tab.id}`}
              className={cls}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.id)}
              onClick={() => onSwitchTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              title={tab.title || tab.url || 'New Tab'}
            >
              <Favicon favicon={tab.favicon} loading={tab.loading} />

              <span className="tab-title">
                {tab.title || (tab.url === 'nexusweb://home' ? 'New Tab' : tab.url) || 'New Tab'}
              </span>

              {tab.isPlayingAudio && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleMuteTab?.(tab.id)
                  }}
                  title={tab.isMuted ? 'Unmute tab' : 'Mute tab'}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    padding: '0 3px',
                    display: 'flex',
                    alignItems: 'center',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  <Volume2 size={12} />
                </button>
              )}

              <button
                type="button"
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseTab(tab.id)
                }}
                title="Close tab (Ctrl+W)"
              >
                <X size={11} />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          className="new-tab-btn"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onNewTab()
          }}
          title="New Tab (Ctrl+T)"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tab Context Menu */}
      {contextMenu && (
        <div
          className="tab-context-menu"
          style={{
            position: 'fixed',
            left: Math.min(contextMenu.x, window.innerWidth - 180),
            top: contextMenu.y,
            zIndex: 9999,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '4px 0',
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => {
              const tab = tabs.find(t => t.id === contextMenu.tabId)
              if (tab) onNewTab(tab.url)
              closeContextMenu()
            }}
          >
            <Copy size={13} />
            <span>Duplicate Tab</span>
          </div>
          <div
            className="context-menu-item"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => {
              if (onToggleMuteTab) onToggleMuteTab(contextMenu.tabId)
              closeContextMenu()
            }}
          >
            <VolumeX size={13} />
            <span>Toggle Mute</span>
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
          <div
            className="context-menu-item"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => {
              tabs.filter(t => t.id !== contextMenu.tabId).forEach(t => onCloseTab(t.id))
              closeContextMenu()
            }}
          >
            <X size={13} />
            <span>Close Other Tabs</span>
          </div>
          <div
            className="context-menu-item close-danger"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => {
              onCloseTab(contextMenu.tabId)
              closeContextMenu()
            }}
          >
            <X size={13} />
            <span>Close Tab</span>
          </div>
        </div>
      )}
    </div>
  )
}
