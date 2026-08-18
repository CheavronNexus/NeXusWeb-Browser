import React, { useEffect, useState, useCallback } from 'react'
import { PanelShell } from './PanelShell'

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0)  return `${d}d ago`
  if (h > 0)  return `${h}h ago`
  if (m > 0)  return `${m}m ago`
  return 'just now'
}

function groupByDate(history) {
  const groups = {}
  history.forEach(h => {
    const d = new Date(h.visitedAt)
    const key = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(h)
  })
  return groups
}

export default function HistoryPanel({ onClose, onNavigate }) {
  const [history, setHistory] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    window.nexus?.history.get().then(setHistory)
  }, [])

  const handleClear = useCallback(async () => {
    if (window.confirm('Clear all browsing history?')) {
      await window.nexus?.history.clear()
      setHistory([])
    }
  }, [])

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation()
    const updated = await window.nexus?.history.deleteItem(id)
    setHistory(updated || [])
  }, [])

  const filtered = search
    ? history.filter(h =>
        h.title?.toLowerCase().includes(search.toLowerCase()) ||
        h.url?.toLowerCase().includes(search.toLowerCase())
      )
    : history

  const groups = groupByDate(filtered)

  const clearBtn = (
    <button
      id="history-clear-btn"
      onClick={handleClear}
      style={{
        border: '1px solid var(--border-dim)', background: 'transparent',
        color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
        padding: '3px 8px', borderRadius: 'var(--radius-sm)',
        transition: 'all var(--t-fast)',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-dim)' }}
    >
      Clear All
    </button>
  )

  return (
    <PanelShell id="panel-history" title="History" icon="🕐" onClose={onClose} actions={clearBtn}>
      {/* Search */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <input
          id="history-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search history…"
          style={{
            width: '100%', padding: '7px 10px',
            background: 'var(--bg-base)', border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)', fontSize: 12, outline: 'none',
          }}
          autoFocus
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🕐</div>
          {search ? 'No history matches your search' : 'No history yet. Browse some pages!'}
        </div>
      ) : (
        <div style={{ padding: '4px 0' }}>
          {Object.entries(groups).map(([date, items]) => (
            <div key={date}>
              <div style={{
                padding: '6px 14px 3px',
                fontSize: 10, fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {date}
              </div>
              {items.map(h => (
                <div
                  key={h.id}
                  id={`history-item-${h.id}`}
                  onClick={() => { onNavigate(h.url); onClose() }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 14px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--t-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {h.favicon
                    ? <img src={h.favicon} width={14} height={14} style={{ flexShrink: 0, objectFit: 'contain' }} alt="" />
                    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="var(--border-dim)" strokeWidth="1.2"/><circle cx="7" cy="7" r="2" fill="var(--border-dim)"/></svg>
                  }
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.title || h.url}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.url}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {timeAgo(h.visitedAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    id={`history-delete-${h.id}`}
                    onClick={(e) => handleDelete(e, h.id)}
                    title="Remove"
                    style={{
                      border: 'none', background: 'transparent', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: 11, padding: '2px 4px',
                      borderRadius: 'var(--radius-sm)', flexShrink: 0,
                      transition: 'color var(--t-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  )
}
