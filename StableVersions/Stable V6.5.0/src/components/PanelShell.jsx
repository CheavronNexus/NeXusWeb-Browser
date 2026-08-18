import React, { useEffect, useState, useCallback, useRef } from 'react'
import { X, GripVertical } from 'lucide-react'

function PanelShell({ id, title, icon, onClose, actions, children, defaultWidth = 380, minWidth = 115, maxWidth = 900 }) {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(`nexus_panel_width_${id}`)
    return saved ? Math.min(maxWidth, Math.max(minWidth, parseInt(saved, 10))) : defaultWidth
  })
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef(null)

  // Notify Electron of current drawer width on mount and on unmount
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
      className="panel-drawer"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: width,
        height: '100%',
        background: 'rgba(12, 16, 28, 0.86)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.16)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 300,
        animation: 'slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '-14px 0 45px rgba(0,0,0,0.7)',
        userSelect: isResizing ? 'none' : 'auto',
      }}
    >
      {/* Draggable Vertical Left-Edge Resize Bar */}
      <div
        ref={resizeRef}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleResetWidth}
        title="Drag left/right to resize drawer (Double-click to reset)"
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
          transition: 'background 0.15s ease',
          background: isResizing ? 'rgba(0, 212, 255, 0.6)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!isResizing) e.currentTarget.style.background = 'rgba(0, 212, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          if (!isResizing) e.currentTarget.style.background = 'transparent'
        }}
      >
        <div style={{
          width: 2,
          height: 32,
          borderRadius: 2,
          background: isResizing ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)',
          boxShadow: isResizing ? '0 0 8px #00d4ff' : 'none',
        }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 14px',
        height: 44,
        flexShrink: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.04)',
        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
      }}>
        <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </span>
        {actions}
        <button
          id={`${id}-close`}
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'all var(--t-fast)',
          }}
          title="Close (Esc)"
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export { PanelShell }
export default PanelShell
