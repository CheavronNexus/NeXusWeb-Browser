import React, { useState } from 'react'

export default function SplitBar({
  tabs,
  activeTabId,
  splitTabId,
  onSelectSplitTab,
  onNavigateSplitTab,
  onSwapPanes,
  onCloseSplitView,
  detectedServers = [],
}) {
  const [rightUrlInput, setRightUrlInput] = useState('')
  const [isEditingRightUrl, setIsEditingRightUrl] = useState(false)

  const leftTab = tabs.find(t => t.id === activeTabId)
  const rightTab = tabs.find(t => t.id === splitTabId)
  const otherTabs = tabs.filter(t => t.id !== activeTabId)

  const handleRightSubmit = (e) => {
    e.preventDefault()
    if (rightUrlInput.trim() && splitTabId) {
      onNavigateSplitTab(splitTabId, rightUrlInput.trim())
      setIsEditingRightUrl(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 34,
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 12px',
      fontSize: 11.5,
      zIndex: 300,
      gap: 12,
    }}>
      {/* Left Pane Info */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflow: 'hidden',
      }}>
        <span style={{
          background: 'rgba(6, 182, 212, 0.15)',
          color: 'var(--accent-primary)',
          fontSize: 9.5,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 3,
          letterSpacing: '0.05em',
        }}>
          PANE 1 (LEFT)
        </span>
        <span style={{
          color: 'var(--text-primary)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {leftTab?.title || 'Tab 1'}
        </span>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: 10.5,
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {leftTab?.url === 'nexusweb://home' ? 'Home Dashboard' : leftTab?.url}
        </span>
      </div>

      {/* Center Divider & Swap Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />
        <button
          onClick={onSwapPanes}
          title="Swap Left & Right Panes"
          style={{
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ⇄ Swap
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />
      </div>

      {/* Right Pane Controls */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}>
        <span style={{
          background: 'rgba(139, 92, 246, 0.15)',
          color: '#a78bfa',
          fontSize: 9.5,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 3,
          letterSpacing: '0.05em',
        }}>
          PANE 2 (RIGHT)
        </span>

        {/* Tab Selector Dropdown for Right Pane */}
        {otherTabs.length > 0 && (
          <select
            value={splitTabId || ''}
            onChange={(e) => onSelectSplitTab(parseInt(e.target.value, 10))}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-dim)',
              color: 'var(--text-primary)',
              fontSize: 11,
              borderRadius: 4,
              padding: '2px 6px',
              maxWidth: 140,
              cursor: 'pointer',
            }}
          >
            {otherTabs.map(t => (
              <option key={t.id} value={t.id}>
                {t.title || `Tab ${t.id}`}
              </option>
            ))}
          </select>
        )}

        {/* Right Pane URL Form or Quick Input */}
        {isEditingRightUrl ? (
          <form onSubmit={handleRightSubmit} style={{ display: 'flex', gap: 4 }}>
            <input
              type="text"
              autoFocus
              value={rightUrlInput}
              onChange={(e) => setRightUrlInput(e.target.value)}
              onBlur={() => setIsEditingRightUrl(false)}
              placeholder="e.g. 5000 or localhost:8000"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--accent-primary)',
                color: 'var(--text-primary)',
                fontSize: 10.5,
                borderRadius: 4,
                padding: '2px 6px',
                width: 140,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--accent-primary)',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 10.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              setRightUrlInput(rightTab?.url === 'nexusweb://home' ? '' : (rightTab?.url || ''))
              setIsEditingRightUrl(true)
            }}
            title="Click to type URL for Right Pane"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: 10.5,
              borderRadius: 4,
              padding: '2px 8px',
              cursor: 'pointer',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {rightTab?.url === 'nexusweb://home' ? 'Open URL in Pane 2 ✏️' : (rightTab?.url || 'Open URL ✏️')}
          </button>
        )}

        {/* Quick Launch Localhost Port Chips */}
        {detectedServers.slice(0, 3).map(s => (
          <button
            key={s.port}
            onClick={() => splitTabId && onNavigateSplitTab(splitTabId, s.url)}
            title={`Open ${s.label} (${s.url}) in Right Pane`}
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: 'var(--green)',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            :{s.port}
          </button>
        ))}

        {/* Close Split View */}
        <button
          onClick={onCloseSplitView}
          title="Exit Split View (Ctrl+\)"
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 13,
            padding: '2px 4px',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
