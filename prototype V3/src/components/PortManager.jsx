import React, { useEffect, useState, useCallback, useRef } from 'react'
import { PanelShell } from './PanelShell'

export default function PortManager({ onClose, onNavigate, onToast }) {
  const [ports, setPorts] = useState([])
  const [loading, setLoading] = useState(false)
  const [killingPid, setKillingPid] = useState(null)
  const intervalRef = useRef(null)

  const fetchPorts = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const list = await window.nexus?.portManager.getDetailedList()
      setPorts(list || [])
    } catch (e) {
      console.error('Failed to get ports:', e)
    }
    if (isManual) setLoading(false)
  }, [])

  useEffect(() => {
    fetchPorts(true)
    intervalRef.current = setInterval(() => {
      fetchPorts(false)
    }, 2500)
    return () => clearInterval(intervalRef.current)
  }, [fetchPorts])

  const handleKill = useCallback(async (pid, port, processName) => {
    if (!window.confirm(`Terminate process ${processName || ''} (PID ${pid}) on port ${port}?`)) {
      return
    }
    setKillingPid(pid)
    const res = await window.nexus?.portManager.kill(pid)
    setKillingPid(null)
    if (res?.success) {
      onToast?.(`Killed process on port ${port} (PID ${pid})`, 'success')
      fetchPorts(true)
    } else {
      onToast?.(`Failed to kill process: ${res?.error || 'Access denied'}`, 'error')
    }
  }, [fetchPorts, onToast])

  const refreshBtn = (
    <button
      id="btn-ports-refresh"
      onClick={() => fetchPorts(true)}
      disabled={loading}
      style={{
        border: '1px solid var(--border-dim)', background: 'transparent',
        color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
        padding: '3px 8px', borderRadius: 'var(--radius-sm)',
        transition: 'all var(--t-fast)',
      }}
    >
      {loading ? 'Scanning…' : '↻ Refresh'}
    </button>
  )

  return (
    <PanelShell id="panel-port-manager" title="Port Manager" icon="🔌" onClose={onClose} actions={refreshBtn}>
      <div style={{ padding: '8px 14px 4px', fontSize: 11, color: 'var(--text-muted)' }}>
        Active listening ports on your machine. Kill hung processes with 1-click.
      </div>

      {ports.length === 0 ? (
        <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔌</div>
          {loading ? 'Scanning active TCP ports…' : 'No active developer servers listening on localhost.'}
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {ports.map(p => (
            <div
              key={p.port + '-' + p.pid}
              id={`port-manager-item-${p.port}`}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                    color: 'var(--accent-primary)',
                  }}>
                    :{p.port}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {p.label}
                  </span>
                </div>
                <div style={{
                  fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2,
                }}>
                  {p.processName || 'Unknown'} · PID: {p.pid} · {p.address}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => { onNavigate(p.url); onClose() }}
                  title="Open in Tab"
                  style={{
                    padding: '4px 8px', fontSize: 11, fontWeight: 500,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', cursor: 'pointer',
                  }}
                >
                  Open ↗
                </button>
                {p.pid > 0 && (
                  <button
                    onClick={() => handleKill(p.pid, p.port, p.processName)}
                    disabled={killingPid === p.pid}
                    title="Kill process on this port"
                    style={{
                      padding: '4px 8px', fontSize: 11, fontWeight: 500,
                      background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--red)', cursor: 'pointer',
                    }}
                  >
                    {killingPid === p.pid ? 'Killing…' : 'Kill ✕'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  )
}
