import React, { useState, useEffect } from 'react'
import PanelShell from './PanelShell'
import { Cpu, Moon, Play, Radio, Activity, RefreshCw } from 'lucide-react'

const nexus = window.nexus

export default function ResourceMonitor({ onClose }) {
  const [tabStats, setTabStats] = useState([])
  const [ports, setPorts] = useState([])
  const [loading, setLoading] = useState(false)

  const refreshStats = async () => {
    setLoading(true)
    try {
      const stats = await nexus?.tabSuspender.getStats()
      setTabStats(stats || [])
      const foundPorts = await nexus?.scanPorts()
      setPorts(foundPorts || [])
    } catch (e) {}
    setLoading(false)
  }

  useEffect(() => {
    refreshStats()
    const interval = setInterval(refreshStats, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSuspend = async (tabId) => {
    await nexus?.tabSuspender.suspend(tabId)
    refreshStats()
  }

  const handleResume = async (tabId) => {
    await nexus?.tabSuspender.resume(tabId)
    refreshStats()
  }

  const suspendedCount = tabStats.filter(t => t.isSuspended).length

  return (
    <PanelShell
      title="RAM & Resource Monitor"
      icon={<Cpu size={16} style={{ color: 'var(--accent)' }} />}
      onClose={onClose}
      badge="Optimization"
      headerAction={
        <button
          onClick={refreshStats}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
          title="Refresh Metrics"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Open Tabs</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              {tabStats.length}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hibernated Tabs</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{suspendedCount}</span>
              <Moon size={14} />
            </div>
          </div>
        </div>

        {/* Tab Lifecycle List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Tab Memory States
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tabStats.map(tab => (
              <div
                key={tab.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'var(--bg-tertiary)',
                  border: `1px solid ${tab.isSuspended ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {tab.title || 'Tab'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tab.isSuspended ? (
                      <><Moon size={11} style={{ color: 'var(--green)' }} /> <span>Hibernated (RAM Saved)</span></>
                    ) : tab.isPlayingAudio ? (
                      <><Volume2 size={11} style={{ color: 'var(--accent-primary)' }} /> <span>Playing Audio</span></>
                    ) : (
                      <><Zap size={11} style={{ color: 'var(--accent-secondary)' }} /> <span>Active in Memory</span></>
                    )}
                  </div>
                </div>

                <div>
                  {tab.isSuspended ? (
                    <button
                      onClick={() => handleResume(tab.id)}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--accent)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Wake Up
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(tab.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '3px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                      title="Hibernate tab to free RAM"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Localhost Port Processes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active Localhost Server Processes
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ports.length === 0 ? (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                No active development servers detected.
              </div>
            ) : (
              ports.map(p => (
                <div
                  key={p.port}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      :{p.port} ({p.process || 'Node'})
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      PID: {p.pid || 'N/A'} · http://localhost:{p.port}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PanelShell>
  )
}
