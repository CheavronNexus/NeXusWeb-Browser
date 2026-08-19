import React, { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'

function PanelShell({ id, title, icon, onClose, actions, children }) {
  return (
    <div id={id} className="panel-drawer" style={{
      position: 'absolute', top: 0, right: 0,
      width: 360, height: '100%',
      background: 'rgba(12, 16, 28, 0.78)',
      backdropFilter: 'blur(32px) saturate(200%)',
      WebkitBackdropFilter: 'blur(32px) saturate(200%)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.16)',
      display: 'flex', flexDirection: 'column',
      zIndex: 300, animation: 'slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '-12px 0 40px rgba(0,0,0,0.65)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 14px', height: 44, flexShrink: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.04)',
        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
      }}>
        <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{title}</span>
        {actions}
        <button
          id={`${id}-close`}
          onClick={onClose}
          style={{
            border: 'none', background: 'transparent', color: 'var(--text-muted)',
            cursor: 'pointer', width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'all var(--t-fast)',
          }}
          title="Close (Esc)"
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        ><X size={15} /></button>
      </div>
      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
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
