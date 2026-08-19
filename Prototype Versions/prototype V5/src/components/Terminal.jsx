import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

const THEME = {
  background: '#07090e',
  foreground: '#c9d1d9',
  cursor: '#00d4ff',
  cursorAccent: '#07090e',
  selectionBackground: 'rgba(0, 212, 255, 0.25)',
  black: '#0a0d14',
  red: '#ff5f56',
  green: '#27c93f',
  yellow: '#ffbd2e',
  blue: '#00d4ff',
  magenta: '#a855f7',
  cyan: '#00d4ff',
  white: '#e8eaf2',
  brightBlack: '#4a5568',
  brightRed: '#ff7b72',
  brightGreen: '#56d364',
  brightYellow: '#e3b341',
  brightBlue: '#79c0ff',
  brightMagenta: '#d2a8ff',
  brightCyan: '#56d364',
  brightWhite: '#ffffff',
}

export default function Terminal({ minimized, onMinimize, onClose }) {
  const [sessions, setSessions] = useState([{ id: 'term-1', title: 'Terminal 1' }])
  const [activeSessionId, setActiveSessionId] = useState('term-1')
  const terminalContainersRef = useRef(new Map())
  const xtermInstancesRef = useRef(new Map())
  const fitAddonsRef = useRef(new Map())

  // Initialize a terminal session
  const initTerminalSession = useCallback((sessionId, containerEl) => {
    if (!containerEl || xtermInstancesRef.current.has(sessionId)) return

    const term = new XTerm({
      theme: THEME,
      fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.3,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
      scrollback: 2000,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerEl)

    xtermInstancesRef.current.set(sessionId, term)
    fitAddonsRef.current.set(sessionId, fitAddon)

    setTimeout(() => {
      try {
        fitAddon.fit()
        window.nexus?.terminal.create(sessionId, term.cols, term.rows)
      } catch (e) {}
    }, 100)

    term.onData(data => {
      window.nexus?.terminal.write(sessionId, data)
    })
  }, [])

  // Listen for terminal incoming data from main process
  useEffect(() => {
    const handleData = ({ id, data }) => {
      const term = xtermInstancesRef.current.get(id)
      if (term) term.write(data)
    }

    window.nexus?.terminal.onData(handleData)
    return () => {
      window.nexus?.terminal.offData()
    }
  }, [])

  // Window resize observer to fit active terminal
  useEffect(() => {
    const handleResize = () => {
      const fit = fitAddonsRef.current.get(activeSessionId)
      const term = xtermInstancesRef.current.get(activeSessionId)
      if (fit && term) {
        try {
          fit.fit()
          window.nexus?.terminal.resize(activeSessionId, term.cols, term.rows)
        } catch (e) {}
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeSessionId])

  // Fit when active session changes or unminimized
  useEffect(() => {
    if (!minimized) {
      setTimeout(() => {
        const fit = fitAddonsRef.current.get(activeSessionId)
        const term = xtermInstancesRef.current.get(activeSessionId)
        if (fit && term) {
          try {
            fit.fit()
            term.focus()
            window.nexus?.terminal.resize(activeSessionId, term.cols, term.rows)
          } catch (e) {}
        }
      }, 150)
    }
  }, [activeSessionId, minimized])

  const addSession = () => {
    const newId = `term-${Date.now()}`
    const newTitle = `Terminal ${sessions.length + 1}`
    setSessions(prev => [...prev, { id: newId, title: newTitle }])
    setActiveSessionId(newId)
  }

  const closeSession = (sessionId, e) => {
    e.stopPropagation()
    window.nexus?.terminal.destroy(sessionId)
    const term = xtermInstancesRef.current.get(sessionId)
    if (term) term.dispose()
    xtermInstancesRef.current.delete(sessionId)
    fitAddonsRef.current.delete(sessionId)

    const remaining = sessions.filter(s => s.id !== sessionId)
    if (remaining.length === 0) {
      onClose()
    } else {
      setSessions(remaining)
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[remaining.length - 1].id)
      }
    }
  }

  return (
    <div className={`terminal-panel ${minimized ? 'minimized' : ''}`} id="terminal-panel">
      {/* Header */}
      <div className="terminal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflowX: 'auto' }}>
          <span style={{ color: 'var(--accent-primary)', fontSize: 13, marginLeft: 4, flexShrink: 0 }}>⌨</span>
          
          {/* Multi-Terminal Tabs */}
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: activeSessionId === s.id ? 'var(--bg-base)' : 'transparent',
                color: activeSessionId === s.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: activeSessionId === s.id ? '1px solid var(--border-dim)' : '1px solid transparent',
              }}
            >
              <span>{s.title}</span>
              {sessions.length > 1 && (
                <span
                  onClick={(e) => closeSession(s.id, e)}
                  style={{ fontSize: 10, opacity: 0.6, cursor: 'pointer' }}
                  title="Close session"
                >
                  ✕
                </span>
              )}
            </div>
          ))}

          <button
            onClick={addSession}
            title="New Terminal Session"
            style={{
              padding: '1px 6px', fontSize: 12, fontWeight: 700,
              background: 'transparent', border: '1px dashed var(--border-dim)',
              color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>

        <div className="terminal-actions">
          <button
            className="terminal-btn"
            id="btn-terminal-min"
            onClick={onMinimize}
            title={minimized ? 'Restore terminal' : 'Minimize terminal'}
          >
            {minimized ? '▲' : '▼'}
          </button>
          <button
            className="terminal-btn"
            id="btn-terminal-close"
            onClick={onClose}
            title="Close terminal (Ctrl+`)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Containers */}
      {!minimized && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {sessions.map(s => (
            <div
              key={s.id}
              ref={el => {
                if (el) {
                  terminalContainersRef.current.set(s.id, el)
                  initTerminalSession(s.id, el)
                }
              }}
              id={`terminal-container-${s.id}`}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: activeSessionId === s.id ? 'block' : 'none',
                padding: '4px 6px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
