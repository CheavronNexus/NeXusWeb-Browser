import React, { useState, useEffect } from 'react'
import logoImg from '../assets/logo.png'
import { Minus, Square, X, Sun, Moon, Copy, Eye } from 'lucide-react'

export default function TitleBar({ mode, isPrivateDen = false, currentTheme = 'dark', onToggleTheme }) {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const handleWindowState = (state) => {
      setIsMaximized(state === 'maximized')
    }
    window.nexus?.onWindowStateChange?.(handleWindowState)
  }, [])

  const handleMinimize = () => window.nexus?.minimize()
  const handleMaximize = () => {
    window.nexus?.maximize()
    setIsMaximized(prev => !prev)
  }
  const handleClose = () => window.nexus?.close()

  return (
    <div
      className="title-bar"
      style={{
        height: 28,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0 0 10px',
        borderBottom: '1px solid var(--glass-border)',
        userSelect: 'none',
        WebkitAppRegion: 'drag',
        boxShadow: '0 1px 0 var(--glass-specular)',
      }}
    >
      {/* Left: Clean Brand Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, WebkitAppRegion: 'no-drag' }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 'var(--radius-xs)',
            background: 'var(--bg-hover)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isPrivateDen ? (
            <Eye size={11} color="var(--accent-primary)" />
          ) : (
            <img
              src={logoImg}
              alt=""
              style={{ width: 12, height: 12, objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
        </div>

        <span style={{
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
        }}>
          {isPrivateDen ? 'NeXusWeb · Private Den' : 'NeXusWeb'}
        </span>
      </div>

      {/* Spacer (Draggable window area) */}
      <div style={{ flex: 1, height: '100%', WebkitAppRegion: 'drag' }} />

      {/* Right: Theme Switcher & Windows-Style Window Controls */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', WebkitAppRegion: 'no-drag' }}>
        {/* Theme Switcher */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            style={{
              width: 28,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background 0.12s ease, color 0.12s ease',
            }}
            title={`Switch to ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {currentTheme === 'light' ? <Moon size={11} /> : <Sun size={11} />}
          </button>
        )}

        {/* Windows Style: Minimize */}
        <button
          onClick={handleMinimize}
          style={{
            width: 44,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'background 0.12s ease, color 0.12s ease',
          }}
          title="Minimize"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <Minus size={13} />
        </button>

        {/* Windows Style: Maximize / Restore */}
        <button
          onClick={handleMaximize}
          style={{
            width: 44,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'background 0.12s ease, color 0.12s ease',
          }}
          title={isMaximized ? 'Restore' : 'Maximize'}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          {isMaximized ? <Copy size={11} style={{ transform: 'rotate(90deg)' }} /> : <Square size={11} />}
        </button>

        {/* Windows Style: Close (turns Red on hover) */}
        <button
          onClick={handleClose}
          style={{
            width: 44,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'background 0.12s ease, color 0.12s ease',
          }}
          title="Close (Ctrl+Q)"
          onMouseEnter={e => { e.currentTarget.style.background = '#e81123'; e.currentTarget.style.color = '#ffffff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
