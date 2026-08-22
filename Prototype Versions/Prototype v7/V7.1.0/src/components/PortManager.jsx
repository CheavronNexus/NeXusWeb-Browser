import React, { useEffect, useState, useCallback, useRef } from 'react'
import { PanelShell } from './PanelShell'
import { Cpu, RefreshCw, XCircle, ExternalLink } from 'lucide-react'

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
    try {
      const ok = await window.nexus?.portManager.killProcess(pid)
      if (ok) {
        onToast?.(`Terminated PID ${pid} (${processName})`, 'success')
        setPorts(prev => prev.filter(p => p.pid !== pid))
      } else {
        onToast?.(`Failed to terminate PID ${pid}. Try running as Administrator.`, 'error')
      }
    } catch (e) {
      onToast?.(`Error: ${e.message}`, 'error')
    }
    setKillingPid(null)
  }, [onToast])

  const refreshBtn = (
    <button
      onClick={() => fetchPorts(true)}
      title="Refresh active port list"
      style={{
        border: '1px solid var(--border-dim)', background: 'transparent',
        color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
        padding: '3px 8px', borderRadius: 'var(--radius-sm)',
        transition: 'all var(--t-fast)', display: 'flex', alignItems: 'center', gap: 4,
      }}
    >
      <RefreshCw size={11} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
      <span>{loading ? 'Scanning…' : 'Refresh'}</span>
    </button>
  )

  return (
    <PanelShell id="panel-port-manager" title="Port Manager" icon={<Cpu size={16} style={{ color: 'var(--accent-primary)' }} />} onClose={onClose} actions={refreshBtn}>
      <div style={{ padding: '8px 14px 4px', fontSize: 11, color: 'var(--text-muted)' }}>
        Active listening ports on your machine. Kill hung processes with 1-click.
      </div>

      {ports.length === 0 ? (
        <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <Cpu size={36} style={{ margin: '0 auto 10px', color: 'var(--text-muted)', display: 'block' }} />
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
                    fontSize: 11, fontWeight: 600, color: 'var(--text-primary)',
                    background: 'var(--bg-elevated)', padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                  }}>
                    {p.processName || 'Unknown'}
                  </span>
                  {p.framework && (
                    <span style={{
                      fontSize: 10, color: 'var(--accent-secondary)',
                      background: 'rgba(129, 140, 248, 0.1)', padding: '1px 5px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {p.framework}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2,
                  fontFamily: 'var(--font-mono)',
                }}>
                  PID {p.pid} · {p.protocol?.toUpperCase() || 'TCP'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => {
                    onNavigate?.(`http://localhost:${p.port}`)
                    onClose?.()
                  }}
                  title={`Open http://localhost:${p.port} in browser`}
                  style={{
                    padding: '4px 8px', fontSize: 11, fontWeight: 500,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  <ExternalLink size={11} />
                  <span>Open</span>
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
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}
                  >
                    <XCircle size={11} />
                    <span>{killingPid === p.pid ? 'Killing…' : 'Kill'}</span>
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
