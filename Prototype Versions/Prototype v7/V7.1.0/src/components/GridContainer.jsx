import React from 'react'
import { LayoutGrid, Columns2, Rows2, Maximize2, ExternalLink } from 'lucide-react'

export default function GridContainer({
  layout,
  paneTabIds = [],
  tabs = [],
  onSelectPaneTab,
  onOpenPanel,
}) {
  if (layout === 'single') {
    return null // Single view is rendered directly as native BrowserView
  }

  const renderPaneHeader = (paneIdx, titleDefault) => {
    const assignedTabId = paneTabIds[paneIdx]
    const assignedTab = tabs.find(t => t.id === assignedTabId)

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '24px',
        padding: '0 8px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        fontSize: '11px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: '700', color: 'var(--accent)' }}>Pane {paneIdx + 1}:</span>
          <select
            value={assignedTabId || ''}
            onChange={(e) => onSelectPaneTab(paneIdx, Number(e.target.value))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '160px',
            }}
          >
            <option value="" disabled>Select Tab...</option>
            {tabs.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#111622', color: '#fff' }}>
                {t.title || t.url}
              </option>
            ))}
          </select>
        </div>

        {assignedTab?.url && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {assignedTab.url.replace(/^https?:\/\//, '').slice(0, 20)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none', // Allow clicks to pass through to underlying native BrowserViews
      display: 'grid',
      gridTemplateColumns: layout === 'split-h' || layout === 'grid-2x2' ? '1fr 1fr' : '1fr',
      gridTemplateRows: layout === 'split-v' || layout === 'grid-2x2' ? '1fr 1fr' : '1fr',
      border: '1px solid var(--border)',
      zIndex: 5,
    }}>
      {/* Pane 0 */}
      <div style={{ borderRight: layout === 'split-h' || layout === 'grid-2x2' ? '1px solid var(--border)' : 'none', borderBottom: layout === 'split-v' || layout === 'grid-2x2' ? '1px solid var(--border)' : 'none', pointerEvents: 'auto' }}>
        {renderPaneHeader(0, 'Pane 1')}
      </div>

      {/* Pane 1 */}
      {(layout === 'split-h' || layout === 'split-v' || layout === 'grid-2x2') && (
        <div style={{ borderBottom: layout === 'grid-2x2' ? '1px solid var(--border)' : 'none', pointerEvents: 'auto' }}>
          {renderPaneHeader(1, 'Pane 2')}
        </div>
      )}

      {/* Pane 2 & 3 for 2x2 Quad Grid */}
      {layout === 'grid-2x2' && (
        <>
          <div style={{ borderRight: '1px solid var(--border)', pointerEvents: 'auto' }}>
            {renderPaneHeader(2, 'Pane 3')}
          </div>
          <div style={{ pointerEvents: 'auto' }}>
            {renderPaneHeader(3, 'Pane 4')}
          </div>
        </>
      )}
    </div>
  )
}
