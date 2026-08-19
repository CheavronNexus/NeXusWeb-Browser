import React, { useState, useEffect } from 'react'
import { Folder, Globe, Star } from 'lucide-react'

const DEFAULT_BOOKMARKS = [
  { id: 'def-1', title: 'Gmail', url: 'https://mail.google.com', color: '#ea4335' },
  { id: 'def-2', title: 'G-Drive', url: 'https://drive.google.com', color: '#34a853' },
  { id: 'def-3', title: 'Gemini', url: 'https://gemini.google.com', color: '#4285f4' },
  { id: 'def-4', title: 'NotebookLM', url: 'https://notebooklm.google.com', color: '#10b981' },
  { id: 'def-5', title: 'YouTube', url: 'https://youtube.com', color: '#ff0000' },
  { id: 'def-6', title: 'Music', url: 'https://music.youtube.com', color: '#ff0000' },
  { id: 'def-7', title: 'S-cloud', url: 'https://soundcloud.com', color: '#ff5500' },
  { id: 'def-8', title: 'Disney+', url: 'https://disneyplus.com', color: '#113ccf' },
  { id: 'def-9', title: 'Apple ID', url: 'https://appleid.apple.com', color: '#888888' },
  { id: 'def-10', title: 'iCloud', url: 'https://icloud.com', color: '#3b82f6' },
  { id: 'def-11', title: 'Cinevo', url: 'https://cinevo.info', color: '#a855f7' },
  { id: 'def-12', title: 'Chess', url: 'https://chess.com', color: '#769656' },
  { id: 'def-13', title: 'Data Science Cour...', url: 'https://coursera.org', color: '#0056d2' },
]

export default function BookmarksBar({ onNavigate, onOpenNewTab, onOpenBookmarksPanel }) {
  const [userBookmarks, setUserBookmarks] = useState([])

  const loadBookmarks = async () => {
    try {
      const bms = await window.nexus?.bookmarks.get()
      setUserBookmarks(bms || [])
    } catch (e) {}
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  const displayList = userBookmarks.length > 0 ? [...userBookmarks, ...DEFAULT_BOOKMARKS] : DEFAULT_BOOKMARKS

  return (
    <div className="bookmarks-bar-row">
      {displayList.slice(0, 16).map(bm => (
        <div
          key={bm.id}
          className="bookmark-quick-item"
          onClick={() => onNavigate(bm.url)}
          onContextMenu={(e) => {
            e.preventDefault()
            if (onOpenNewTab) onOpenNewTab(bm.url)
          }}
          title={`${bm.title}\n${bm.url}\n(Right-click to open in new tab)`}
        >
          {bm.favicon ? (
            <img src={bm.favicon} alt="" className="bookmark-favicon" onError={e => e.target.style.display = 'none'} />
          ) : (
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              background: bm.color || 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0
            }}>
              {bm.title?.charAt(0) || '★'}
            </span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
            {bm.title || bm.url}
          </span>
        </div>
      ))}

      {/* Right side 'Other favorites' folder */}
      <div
        className="other-favorites-btn"
        onClick={onOpenBookmarksPanel}
        title="Open Bookmarks Manager (Ctrl+B)"
      >
        <Folder size={13} style={{ color: 'var(--yellow)' }} />
        <span>Other favorites</span>
      </div>
    </div>
  )
}
