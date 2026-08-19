import React, { useState } from 'react'

function Favicon({ favicon, loading }) {
  if (loading) {
    return <span className="tab-spinner" />
  }
  if (favicon) {
    return <img src={favicon} className="tab-favicon" alt="" onError={e => e.target.style.display = 'none'} />
  }
  return <span className="tab-default-icon">⬡</span>
}

export default function TabBar({
  tabs, activeTabId, onNewTab, onCloseTab, onSwitchTab, onReorderTabs, onToggleMuteTab
}) {
  const [draggedTabId, setDraggedTabId] = useState(null)
  const [dragOverTabId, setDragOverTabId] = useState(null)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, tabId }

  const handleDragStart = (e, tabId) => {
    if (e.target.closest('.tab-close-btn') || e.target.closest('.tab-audio-btn')) {
      e.preventDefault()
      return
    }
    setDraggedTabId(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, tabId) => {
    e.preventDefault()
    if (tabId !== draggedTabId) {
      setDragOverTabId(tabId)
    }
  }

  const handleDragLeave = () => {
    setDragOverTabId(null)
  }

  const handleDrop = (e, targetTabId) => {
    e.preventDefault()
    if (draggedTabId && targetTabId && draggedTabId !== targetTabId && onReorderTabs) {
      onReorderTabs(draggedTabId, targetTabId)
    }
    setDraggedTabId(null)
    setDragOverTabId(null)
  }

  const handleDragEnd = () => {
    setDraggedTabId(null)
    setDragOverTabId(null)
  }

  const handleContextMenu = (e, tabId) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, tabId })
  }

  const closeContextMenu = () => setContextMenu(null)

  return (
    <div className="tab-bar" onClick={closeContextMenu}>
      <div className="tabs-container">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isOver = tab.id === dragOverTabId
          const isDragging = tab.id === draggedTabId
          const isAudioPlaying = tab.isPlayingAudio

          return (
            <div
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onMouseDown={(e) => {
                if (e.target.closest('.tab-close-btn') || e.target.closest('.tab-audio-btn')) return
                onSwitchTab(tab.id)
              }}
              onClick={(e) => {
                if (e.target.closest('.tab-close-btn') || e.target.closest('.tab-audio-btn')) return
                onSwitchTab(tab.id)
              }}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.id)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: isDragging ? 0.4 : 1,
                borderLeft: isOver ? '2px solid var(--accent-primary)' : undefined,
                cursor: 'pointer',
                position: 'relative',
              }}
              title={tab.title || tab.url || 'New Tab'}
            >
              <Favicon favicon={tab.favicon} loading={tab.loading} />
              
              <span className="tab-title">
                {tab.title || (tab.url === 'nexusweb://home' ? 'Home' : tab.url) || 'New Tab'}
              </span>

              {/* Audio Playing Indicator / Mute toggle */}
              {isAudioPlaying && (
                <button
                  type="button"
                  className="tab-audio-btn"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (onToggleMuteTab) onToggleMuteTab(tab.id)
                  }}
                  title="Playing audio (click to mute)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: '0 3px',
                    display: 'flex',
                    alignItems: 'center',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  🔊
                </button>
              )}

              <button
                type="button"
                className="tab-close-btn"
                id={`tab-close-${tab.id}`}
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCloseTab(tab.id)
                }}
                title="Close tab (Ctrl+W)"
              >
                ✕
              </button>
            </div>
          )
        })}

        <button
          type="button"
          className="new-tab-btn"
          id="btn-new-tab"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onNewTab()
          }}
          title="New tab (Ctrl+T)"
        >
          +
        </button>
      </div>

      {/* Tab Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="tab-context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 99999,
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '4px 0',
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              const tab = tabs.find(t => t.id === contextMenu.tabId)
              if (tab) onNewTab(tab.url)
              closeContextMenu()
            }}
          >
            📋 Duplicate Tab
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              if (onToggleMuteTab) onToggleMuteTab(contextMenu.tabId)
              closeContextMenu()
            }}
          >
            🔇 Toggle Mute
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
          <div
            className="context-menu-item"
            onClick={() => {
              tabs.filter(t => t.id !== contextMenu.tabId).forEach(t => onCloseTab(t.id))
              closeContextMenu()
            }}
          >
            ✕ Close Other Tabs
          </div>
          <div
            className="context-menu-item close-danger"
            onClick={() => {
              onCloseTab(contextMenu.tabId)
              closeContextMenu()
            }}
          >
            ✕ Close Tab
          </div>
        </div>
      )}
    </div>
  )
}
