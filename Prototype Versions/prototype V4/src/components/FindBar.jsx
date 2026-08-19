import React, { useState, useEffect, useRef } from 'react'

export default function FindBar({ onClose }) {
  const [text, setText] = useState('')
  const [matchInfo, setMatchInfo] = useState({ current: 0, total: 0 })
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()

    const handleResult = (res) => {
      if (res && typeof res.matches === 'number') {
        setMatchInfo({
          current: res.activeMatchOrdinal || 0,
          total: res.matches || 0,
        })
      }
    }

    window.nexus?.findInPage.onResult(handleResult)

    return () => {
      window.nexus?.findInPage.offResult()
      window.nexus?.findInPage.stop('clearSelection')
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setText(val)
    if (val.trim()) {
      window.nexus?.findInPage.start(val, true, false)
    } else {
      window.nexus?.findInPage.stop('clearSelection')
      setMatchInfo({ current: 0, total: 0 })
    }
  }

  const handleNext = (e) => {
    e?.preventDefault()
    if (text.trim()) {
      window.nexus?.findInPage.start(text, true, true)
    }
  }

  const handlePrev = (e) => {
    e?.preventDefault()
    if (text.trim()) {
      window.nexus?.findInPage.start(text, false, true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrev()
      } else {
        handleNext()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div id="find-bar" style={{
      position: 'fixed',
      top: 80,
      right: 260,
      zIndex: 10000,
      background: 'var(--bg-elevated)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--accent-primary)',
      borderRadius: 'var(--radius-md)',
      padding: '5px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      boxShadow: '0 8px 32px rgba(0,0,0,0.85)',
      animation: 'slideDown 0.15s ease',
    }}>
      <input
        ref={inputRef}
        id="find-input"
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Find in page…"
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          padding: '4px 8px',
          width: 180,
          outline: 'none',
        }}
      />

      <span style={{
        fontSize: 11,
        color: matchInfo.total > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
        minWidth: 46,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
      }}>
        {text ? (matchInfo.total > 0 ? `${matchInfo.current}/${matchInfo.total}` : '0/0') : ''}
      </span>

      <button
        id="btn-find-prev"
        onClick={handlePrev}
        disabled={!text}
        title="Previous match (Shift+Enter)"
        style={{
          border: 'none', background: 'transparent', color: 'var(--text-secondary)',
          cursor: text ? 'pointer' : 'default', padding: '3px 6px', borderRadius: 'var(--radius-sm)',
          fontSize: 11, opacity: text ? 1 : 0.4,
        }}
      >
        ▲
      </button>

      <button
        id="btn-find-next"
        onClick={handleNext}
        disabled={!text}
        title="Next match (Enter)"
        style={{
          border: 'none', background: 'transparent', color: 'var(--text-secondary)',
          cursor: text ? 'pointer' : 'default', padding: '3px 6px', borderRadius: 'var(--radius-sm)',
          fontSize: 11, opacity: text ? 1 : 0.4,
        }}
      >
        ▼
      </button>

      <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />

      <button
        id="btn-find-close"
        onClick={onClose}
        title="Close (Esc)"
        style={{
          border: 'none', background: 'transparent', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '2px 5px', fontSize: 13,
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
