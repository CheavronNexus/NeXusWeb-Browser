import React, { useEffect, useState, useCallback, useRef } from 'react'
import { X, GripVertical } from 'lucide-react'

export function PanelShell({ id, title, icon, onClose, actions, children, defaultWidth = 380, minWidth = 115, maxWidth = 900 }) {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(`nexus_panel_width_${id}`)
    return saved ? Math.min(maxWidth, Math.max(minWidth, parseInt(saved, 10))) : defaultWidth
  })
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef(null)

  useEffect(() => {
    window.nexus?.setDrawerWidth?.(width)
    return () => {
      window.nexus?.setDrawerWidth?.(0)
    }
  }, [])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = width

    const handlePointerMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX
      const newWidth = Math.min(Math.min(maxWidth, window.innerWidth * 0.85), Math.max(minWidth, startWidth + delta))
      setWidth(newWidth)
      window.nexus?.setDrawerWidth?.(newWidth)
    }

    const handlePointerUp = () => {
      setIsResizing(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      localStorage.setItem(`nexus_panel_width_${id}`, width.toString())
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [width, id, minWidth, maxWidth])

  const handleResetWidth = () => {
    setWidth(defaultWidth)
    localStorage.setItem(`nexus_panel_width_${id}`, defaultWidth.toString())
    window.nexus?.setDrawerWidth?.(defaultWidth)
  }

  return (
    <div
      id={id}
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: width,
        height: '100%',
        borderRadius: 0,
        borderLeft: '1px solid var(--glass-border)',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 300,
        userSelect: isResizing ? 'none' : 'auto',
      }}
    >
      {/* Draggable Vertical Left-Edge Resize Handle */}
      <div
        ref={resizeRef}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleResetWidth}
        title="Drag left/right to resize (Double-click to reset)"
        style={{
          position: 'absolute',
          top: 0,
          left: -4,
          width: 8,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 310,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isResizing ? 'var(--accent-primary)' : 'transparent',
          transition: 'background 0.15s ease',
        }}
      >
        <div
          style={{
            width: 2,
            height: 32,
            borderRadius: 2,
            background: isResizing ? 'var(--bg-base)' : 'var(--glass-border)',
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--bg-hover)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {icon && (
            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              {icon}
            </div>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {actions}
          <button
            onClick={onClose}
            className="glass-btn-icon"
            style={{ width: 24, height: 24, borderRadius: 'var(--radius-xs)', border: 'none' }}
            title="Close Drawer (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}

export default PanelShell
