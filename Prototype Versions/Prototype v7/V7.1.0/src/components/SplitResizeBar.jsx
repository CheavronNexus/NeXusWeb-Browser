import React, { useState, useCallback, useEffect } from 'react'
import { GripVertical } from 'lucide-react'

export default function SplitResizeBar({
  splitRatio = 0.5,
  onRatioChange,
  topOffset = 40,
  bottomOffset = 22,
  drawerWidth = 0,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [currentRatio, setCurrentRatio] = useState(splitRatio)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isDragging) {
      setCurrentRatio(splitRatio)
    }
  }, [splitRatio, isDragging])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)

    const availableWidth = window.innerWidth - drawerWidth
    if (availableWidth <= 0) return

    const handlePointerMove = (moveEvent) => {
      const clientX = moveEvent.clientX
      const clampedX = Math.max(115, Math.min(availableWidth - 115, clientX))
      const newRatio = Math.max(0.10, Math.min(0.90, clampedX / availableWidth))
      setCurrentRatio(newRatio)
      onRatioChange?.(newRatio)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [drawerWidth, onRatioChange])

  const handleDoubleClick = () => {
    setCurrentRatio(0.5)
    onRatioChange?.(0.5)
  }

  const leftPercent = Math.round(currentRatio * 100)
  const rightPercent = 100 - leftPercent

  return (
    <div
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Drag left/right to resize split view (Double-click for 50/50)"
      style={{
        position: 'absolute',
        top: topOffset,
        bottom: bottomOffset,
        left: `calc(${currentRatio * 100}% - 4px)`,
        width: 8,
        zIndex: 280,
        cursor: 'col-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDragging
          ? 'var(--bg-hover)'
          : isHovered
            ? 'var(--bg-hover)'
            : 'transparent',
        transition: 'background 0.15s ease',
        userSelect: 'none',
      }}
    >
      {/* Center Divider Line */}
      <div
        style={{
          width: isDragging ? 2 : 1,
          height: '100%',
          background: isDragging
            ? 'var(--accent-primary)'
            : isHovered
              ? 'var(--text-secondary)'
              : 'var(--border-subtle)',
          transition: 'all 0.15s ease',
        }}
      />

      {/* Frosted Glass Grip Handle */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 20,
          height: 42,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)',
          pointerEvents: 'none',
          boxShadow: isDragging ? '0 0 16px rgba(0,0,0,0.5)' : 'var(--glass-shadow-sm)',
        }}
      >
        <GripVertical size={12} />
      </div>

      {/* Ratio Tooltip */}
      {(isDragging || isHovered) && (
        <div
          className="glass-pill"
          style={{
            position: 'absolute',
            top: 'calc(50% + 32px)',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 290,
          }}
        >
          <span>{leftPercent}%</span>
          <span style={{ opacity: 0.4, margin: '0 4px' }}>|</span>
          <span>{rightPercent}%</span>
        </div>
      )}
    </div>
  )
}
