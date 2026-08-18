import React, { useEffect, useRef, useState } from 'react'

let termIdCounter = 0

export default function Terminal({ minimized, onMinimize, onClose }) {
  const containerRef = useRef(null)
  const xtermRef = useRef(null)
  const fitAddonRef = useRef(null)
  const termId = useRef(`term-${++termIdCounter}`)
  const [ready, setReady] = useState(false)
  const [shellInfo, setShellInfo] = useState('')

  useEffect(() => {
    let mounted = true

    async function initTerminal() {
      if (!containerRef.current || minimized) return

      try {
        // Dynamic import of xterm to avoid SSR issues
        const { Terminal: XTerm } = await import('@xterm/xterm')
        const { FitAddon } = await import('@xterm/addon-fit')
        const { WebLinksAddon } = await import('@xterm/addon-web-links')

        if (!mounted || !containerRef.current) return

        const term = new XTerm({
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: 12.5,
          lineHeight: 1.4,
          theme: {
            background:    '#0a0d14',
            foreground:    '#e8eaf2',
            cursor:        '#00d4ff',
            cursorAccent:  '#0a0d14',
            selection:     '#00d4ff33',
            black:         '#1a2035',
            red:           '#ef4444',
            green:         '#22c55e',
            yellow:        '#f59e0b',
            blue:          '#3b82f6',
            magenta:       '#8b5cf6',
            cyan:          '#00d4ff',
            white:         '#e8eaf2',
            brightBlack:   '#4a5568',
            brightRed:     '#f87171',
            brightGreen:   '#4ade80',
            brightYellow:  '#fcd34d',
            brightBlue:    '#60a5fa',
            brightMagenta: '#a78bfa',
            brightCyan:    '#67e8f9',
            brightWhite:   '#f8fafc',
          },
          cursorBlink: true,
          cursorStyle: 'bar',
          scrollback: 5000,
          allowProposedApi: true,
        })

        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()

        term.loadAddon(fitAddon)
        term.loadAddon(webLinksAddon)
        term.open(containerRef.current)
        fitAddon.fit()

        xtermRef.current = term
        fitAddonRef.current = fitAddon

        // Create backend terminal
        if (window.nexus) {
          const { cols, rows } = term
          const result = await window.nexus.terminal.create(termId.current, cols, rows)

          if (result?.success) {
            setShellInfo(result.shell || 'shell')

            // Receive data from backend
            window.nexus.terminal.onData(({ id, data }) => {
              if (id === termId.current) {
                term.write(data)
              }
            })

            // Send keystrokes to backend
            term.onData((data) => {
              window.nexus.terminal.write(termId.current, data)
            })

            if (mounted) setReady(true)
          } else {
            term.write('\r\n\x1b[31m Terminal unavailable: node-pty not installed.\x1b[0m\r\n')
            term.write('\x1b[33m Run: npm install\x1b[0m\r\n')
            if (mounted) setReady(true)
          }
        }

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
          try {
            fitAddon.fit()
            const { cols, rows } = term
            window.nexus?.terminal.resize(termId.current, cols, rows)
          } catch (e) {}
        })

        if (containerRef.current) {
          resizeObserver.observe(containerRef.current)
        }

        return () => {
          resizeObserver.disconnect()
        }
      } catch (err) {
        console.error('Terminal init error:', err)
      }
    }

    initTerminal()

    return () => {
      mounted = false
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
      window.nexus?.terminal.destroy(termId.current)
      window.nexus?.terminal.offData()
    }
  }, [minimized])

  // Re-fit on un-minimize
  useEffect(() => {
    if (!minimized && fitAddonRef.current) {
      setTimeout(() => {
        try { fitAddonRef.current?.fit() } catch(e) {}
      }, 50)
    }
  }, [minimized])

  return (
    <div className={`terminal-overlay ${minimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="terminal-header">
        <div className="terminal-header-left">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1" y="2" width="12" height="10" rx="1.5"/>
            <polyline points="3,5 5.5,7 3,9"/>
            <line x1="6.5" y1="9" x2="10" y2="9"/>
          </svg>
          TERMINAL
          {shellInfo && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              · {shellInfo}
            </span>
          )}
          {!ready && (
            <span className="tab-spinner" style={{ width: 10, height: 10 }} />
          )}
        </div>
        <div className="terminal-header-controls">
          <button className="term-ctrl-btn" id="term-minimize" onClick={onMinimize} title={minimized ? 'Expand' : 'Minimize'}>
            {minimized ? '▲' : '▼'}
          </button>
          <button className="term-ctrl-btn close-btn" id="term-close" onClick={onClose} title="Close Terminal">✕</button>
        </div>
      </div>

      {/* xterm.js mount point */}
      {!minimized && (
        <div className="terminal-body" ref={containerRef} style={{ flex: 1, overflow: 'hidden' }} />
      )}

      {/* xterm CSS */}
      <style>{`
        .xterm { height: 100% !important; }
        .xterm-viewport { overflow-y: auto !important; }
        .xterm-screen { height: 100% !important; }
      `}</style>
    </div>
  )
}
