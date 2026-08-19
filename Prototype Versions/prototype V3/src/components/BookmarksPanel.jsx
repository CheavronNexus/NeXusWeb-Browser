import React, { useEffect, useState, useCallback } from 'react'
import { PanelShell } from './PanelShell'

function FaviconPlaceholder() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" fill="none" stroke="var(--border-dim)" strokeWidth="1.2"/>
      <circle cx="7" cy="7" r="2" fill="var(--border-dim)"/>
    </svg>
  )
}

export default function BookmarksPanel({ onClose, onNavigate }) {
  const [bookmarks, setBookmarks] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    window.nexus?.bookmarks.get().then(setBookmarks)
  }, [])

  const filtered = search
    ? bookmarks.filter(b =>
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.url?.toLowerCase().includes(search.toLowerCase())
      )
    : bookmarks

  const handleRemove = useCallback(async (e, id) => {
    e.stopPropagation()
    const updated = await window.nexus?.bookmarks.remove(id)
    setBookmarks(updated || [])
  }, [])

  return (
    <PanelShell id="panel-bookmarks" title="Bookmarks" icon="★" onClose={onClose}>
      {/* Search */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <input
          id="bookmark-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search bookmarks…"
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
          <div style={{ fontSize: 28, marginBottom: 8 }}>★</div>
          {search ? 'No bookmarks match your search' : 'No bookmarks yet. Press Ctrl+D to bookmark a page.'}
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {filtered.map(b => (
            <div
              key={b.id}
              id={`bookmark-item-${b.id}`}
              onClick={() => { onNavigate(b.url); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', cursor: 'pointer',
                transition: 'background var(--t-fast)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {b.favicon
                ? <img src={b.favicon} width={14} height={14} style={{ flexShrink: 0, objectFit: 'contain' }} alt="" />
                : <FaviconPlaceholder />
              }
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.title || b.url}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                  {b.url}
                </div>
              </div>
              <button
                id={`bookmark-remove-${b.id}`}
                onClick={(e) => handleRemove(e, b.id)}
                title="Remove bookmark"
                style={{
                  border: 'none', background: 'transparent', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 12, padding: '2px 4px',
                  borderRadius: 'var(--radius-sm)', flexShrink: 0,
                  transition: 'color var(--t-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  )
}
