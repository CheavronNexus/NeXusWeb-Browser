import React, { useState, useCallback, useRef } from 'react'
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

  // Keep local ratio synced with prop when not actively dragging
  React.useEffect(() => {
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
      title="Drag left/right to resize split apps (Double-click for 50/50)"
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
          ? 'rgba(0, 212, 255, 0.4)'
          : isHovered
            ? 'rgba(0, 212, 255, 0.2)'
            : 'transparent',
        transition: 'background 0.15s ease',
        userSelect: 'none',
      }}
    >
      {/* Center divider line */}
      <div
        style={{
          width: isDragging ? 3 : isHovered ? 2 : 1,
          height: '100%',
          background: isDragging
            ? '#00d4ff'
            : isHovered
              ? 'rgba(0, 212, 255, 0.8)'
              : 'rgba(255, 255, 255, 0.18)',
          boxShadow: isDragging ? '0 0 10px #00d4ff' : isHovered ? '0 0 6px rgba(0,212,255,0.5)' : 'none',
          transition: 'all 0.15s ease',
        }}
      />

      {/* Center Grip Handle */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 20,
          height: 48,
          borderRadius: 6,
          background: isDragging ? '#00d4ff' : isHovered ? '#0e1726' : '#0a0f1d',
          border: isDragging ? '1px solid #00d4ff' : '1px solid rgba(0, 212, 255, 0.4)',
          color: isDragging ? '#000' : '#00d4ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDragging ? '0 0 15px #00d4ff' : '0 4px 12px rgba(0,0,0,0.6)',
          transition: 'all 0.15s ease',
          pointerEvents: 'none',
        }}
      >
        <GripVertical size={14} />
      </div>

      {/* Floating Ratio Tooltip when Hovering or Dragging */}
      {(isDragging || isHovered) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(50% + 36px)',
            transform: 'translateX(-50%)',
            background: 'rgba(9, 13, 24, 0.92)',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'var(--font-mono, monospace)',
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 290,
          }}
        >
          <span style={{ color: '#00d4ff' }}>{leftPercent}%</span>
          <span style={{ color: '#64748b', margin: '0 4px' }}>|</span>
          <span style={{ color: '#c084fc' }}>{rightPercent}%</span>
        </div>
      )}
    </div>
  )
}
