import React, { useState } from 'react'
import { Edit3, X } from 'lucide-react'

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
    if (!rightUrlInput.trim() || !splitTabId) return
    let target = rightUrlInput.trim()
    if (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('nexusweb://') && !target.startsWith('file://')) {
      target = target.includes('.') ? `https://${target}` : `https://duckduckgo.com/?q=${encodeURIComponent(target)}`
    }
    onNavigateSplitTab(splitTabId, target)
    setIsEditingRightUrl(false)
  }

  return (
    <div
      id="nexus-split-bar"
      style={{
        height: 28,
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-bright)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        fontSize: 11,
        color: 'var(--text-secondary)',
        zIndex: 50,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Left Pane Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: '40%', overflow: 'hidden' }}>
        <span style={{
          background: 'rgba(0, 212, 255, 0.15)',
          color: 'var(--accent-primary)',
          fontSize: 9.5,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 3,
          letterSpacing: '0.05em',
        }}>
          PANE 1
        </span>
        <span style={{
          color: 'var(--text-primary)',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {leftTab?.title || leftTab?.url || 'Pane 1'}
        </span>
      </div>

      {/* Center Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          id="btn-split-swap"
          onClick={onSwapPanes}
          title="Swap Left & Right Panes"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 4,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px 7px',
            fontSize: 10,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all var(--t-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'var(--border-bright)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        >
          ⇄ Swap
        </button>
      </div>

      {/* Right Pane Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: '45%', overflow: 'hidden' }}>
        <span style={{
          background: 'rgba(129, 140, 248, 0.15)',
          color: 'var(--accent-secondary)',
          fontSize: 9.5,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 3,
          letterSpacing: '0.05em',
        }}>
          PANE 2
        </span>

        {/* Tab Selector Dropdown for Pane 2 */}
        {otherTabs.length > 0 && (
          <select
            value={splitTabId || ''}
            onChange={(e) => onSelectSplitTab(parseInt(e.target.value, 10))}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 10.5,
              borderRadius: 4,
              padding: '2px 4px',
              maxWidth: 130,
              cursor: 'pointer',
            }}
          >
            {otherTabs.map(t => (
              <option key={t.id} value={t.id}>
                {t.title ? (t.title.length > 20 ? t.title.slice(0, 20) + '…' : t.title) : t.url}
              </option>
            ))}
          </select>
        )}

        {/* Quick URL Input for Right Pane */}
        {isEditingRightUrl ? (
          <form onSubmit={handleRightSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              autoFocus
              value={rightUrlInput}
              onChange={e => setRightUrlInput(e.target.value)}
              onBlur={() => setIsEditingRightUrl(false)}
              placeholder="Type URL..."
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
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{rightTab?.url === 'nexusweb://home' ? 'Open URL in Pane 2' : (rightTab?.url || 'Open URL')}</span>
            <Edit3 size={10} />
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
            padding: '2px 4px',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
