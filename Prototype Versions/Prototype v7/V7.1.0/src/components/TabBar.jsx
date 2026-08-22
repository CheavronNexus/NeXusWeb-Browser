import React, { useState, useRef } from 'react'
import { Volume2, VolumeX, Copy, X, Plus, Globe, Eye } from 'lucide-react'

function Favicon({ favicon, loading, isPrivateDen }) {
  if (loading) {
    return (
      <span
        style={{
          width: 12,
          height: 12,
          border: '1.5px solid var(--border-subtle)',
          borderTopColor: 'var(--text-primary)',
          borderRadius: '50%',
          animation: 'spin-anim 0.7s linear infinite',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    )
  }
  if (favicon) {
    return (
      <img
        src={favicon}
        alt=""
        style={{ width: 13, height: 13, borderRadius: 2, flexShrink: 0 }}
        onError={e => e.target.style.display = 'none'}
      />
    )
  }
  return (
    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
      {isPrivateDen ? <Eye size={12} style={{ color: 'var(--accent-primary)' }} /> : <Globe size={12} />}
    </span>
  )
}

export default function TabBar({
  tabs,
  activeTabId,
  onNewTab,
  onCloseTab,
  onSwitchTab,
  onReorderTabs,
  onToggleMuteTab,
  isPrivateDen = false,
}) {
  const [draggedTabId, setDraggedTabId] = useState(null)
  const [dragOverTabId, setDragOverTabId] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const tabsContainerRef = useRef(null)

  const handleWheel = (e) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft += e.deltaY * 0.7
    }
  }

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
    setContextMenu({ x: e.clientX, y: e.clientY, tabId })
  }

  const closeContextMenu = () => setContextMenu(null)

  return (
    <div
      style={{
        height: 'var(--tabbar-h)',
        background: 'var(--bg-surface)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        borderBottom: '1px solid var(--glass-border)',
      }}
      onClick={closeContextMenu}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={handleWheel}
    >
      <div
        ref={tabsContainerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: 1,
          padding: '2px 0',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isDragging = tab.id === draggedTabId
          const isOver = tab.id === dragOverTabId
          const displayTitle = tab.title?.trim() || (tab.url === 'nexusweb://home' ? 'Home Dashboard' : tab.url?.replace(/^https?:\/\//, '') || 'New Tab')

          return (
            <div
              key={tab.id}
              id={`tab-item-${tab.id}`}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.id)}
              onClick={() => onSwitchTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className="tab-item"
              style={{
                height: 26,
                minWidth: 120,
                maxWidth: 200,
                padding: '0 8px 0 10px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--glass-bg-card)' : 'transparent',
                border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--glass-shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                cursor: 'pointer',
                opacity: isDragging ? 0.4 : 1,
                borderLeft: isOver ? '2px solid var(--accent-primary)' : undefined,
                transition: 'background 0.12s ease, border-color 0.12s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Favicon favicon={tab.favicon} loading={tab.loading} isPrivateDen={isPrivateDen} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
                title={tab.title || tab.url}
              >
                {displayTitle}
              </span>

              {/* Mute Audio Indicator */}
              {tab.isPlayingAudio && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleMuteTab?.(tab.id)
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={tab.isAudioMuted ? 'Unmute Tab' : 'Mute Tab'}
                >
                  {tab.isAudioMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>
              )}

              {/* Close Tab Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseTab(tab.id)
                }}
                className="tab-close-btn"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
                title="Close Tab (Ctrl+W)"
              >
                <X size={11} />
              </button>
            </div>
          )
        })}

        {/* New Tab (+) Button */}
        <button
          onClick={() => onNewTab()}
          className="tab-add-btn"
          style={{
            width: 26,
            height: 26,
            borderRadius: 'var(--radius-xs)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.12s ease, color 0.12s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          title="New Tab (Ctrl+T)"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--bg-base)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--glass-shadow-lg)',
            backdropFilter: 'var(--glass-blur)',
            padding: 4,
            zIndex: 1000,
            minWidth: 150,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              const tab = tabs.find(t => t.id === contextMenu.tabId)
              if (tab) onNewTab(tab.url)
              closeContextMenu()
            }}
          >
            <Copy size={12} />
            <span>Duplicate Tab</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              if (onToggleMuteTab) onToggleMuteTab(contextMenu.tabId)
              closeContextMenu()
            }}
          >
            <VolumeX size={12} />
            <span>Toggle Mute</span>
          </div>

          <div style={{ height: 1, background: 'var(--glass-border)', margin: '3px 0' }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--red)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              onCloseTab(contextMenu.tabId)
              closeContextMenu()
            }}
          >
            <X size={12} />
            <span>Close Tab</span>
          </div>
        </div>
      )}
    </div>
  )
}
