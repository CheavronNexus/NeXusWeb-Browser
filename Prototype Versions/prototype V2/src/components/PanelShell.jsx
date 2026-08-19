import React, { useEffect, useState, useCallback } from 'react'

function PanelShell({ id, title, icon, onClose, actions, children }) {
  return (
    <div id={id} style={{
      position: 'absolute', top: 0, right: 0,
      width: 360, height: '100%',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-bright)',
      display: 'flex', flexDirection: 'column',
      zIndex: 300, animation: 'slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 14px', height: 44, flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
      }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{title}</span>
        {actions}
        <button
          id={`${id}-close`}
          onClick={onClose}
          style={{
            border: 'none', background: 'transparent', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 14, width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'all var(--t-fast)',
          }}
          title="Close (Esc)"
        >✕</button>
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
