import React, { useState, useEffect } from 'react'

export default function BookmarksBar({ onNavigate, onOpenNewTab }) {
  const [bookmarks, setBookmarks] = useState([])

  const loadBookmarks = async () => {
    try {
      const bms = await window.nexus?.bookmarks.get()
      setBookmarks(bms || [])
    } catch (e) {}
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  if (bookmarks.length === 0) {
    return (
      <div style={{
        height: 28,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: 11,
        color: 'var(--text-muted)',
        gap: 8,
      }}>
        <span>★ Quick Bookmarks Bar</span>
        <span style={{ opacity: 0.5 }}>— Press Ctrl+D to bookmark any page</span>
      </div>
    )
  }

  return (
    <div style={{
      height: 28,
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      gap: 4,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {bookmarks.slice(0, 15).map(bm => (
        <button
          key={bm.id}
          onClick={() => onNavigate(bm.url)}
          onContextMenu={(e) => {
            e.preventDefault()
            if (onOpenNewTab) onOpenNewTab(bm.url)
          }}
          title={`${bm.title}\n${bm.url}\n(Right-click to open in new tab)`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 8px',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: 11,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'all var(--t-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {bm.favicon ? (
            <img src={bm.favicon} alt="" style={{ width: 12, height: 12, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
          ) : (
            <span style={{ fontSize: 10, color: 'var(--accent-primary)' }}>★</span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{bm.title || bm.url}</span>
        </button>
      ))}
    </div>
  )
}
