import React, { useState, useEffect } from 'react'
import { PanelShell } from './PanelShell'
import { Globe } from 'lucide-react'

export default function RequestInspector({ onClose, activeTabId }) {
  const [logs, setLogs] = useState([])
  const [filterType, setFilterType] = useState('all') // 'all' | 'xhr' | 'js' | 'css' | 'img'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchLogs = async () => {
    try {
      const data = await window.nexus?.inspector?.getLogs(activeTabId)
      setLogs(data || [])
    } catch (e) {}
  }

  useEffect(() => {
    fetchLogs()
    if (!autoRefresh) return
    const interval = setInterval(fetchLogs, 1500)
    return () => clearInterval(interval)
  }, [activeTabId, autoRefresh])

  const handleClear = async () => {
    await window.nexus?.inspector?.clearLogs(activeTabId)
    setLogs([])
    setSelectedEntry(null)
  }

  const filteredLogs = logs.filter(item => {
    if (filterType !== 'all') {
      const rt = (item.resourceType || '').toLowerCase()
      if (filterType === 'xhr' && !rt.includes('xhr') && !rt.includes('fetch')) return false
      if (filterType === 'js' && !rt.includes('script') && !item.url.includes('.js')) return false
      if (filterType === 'css' && !rt.includes('stylesheet') && !item.url.includes('.css')) return false
      if (filterType === 'img' && !rt.includes('image') && !item.url.match(/\.(png|jpg|jpeg|svg|webp|gif)/i)) return false
    }
    if (searchQuery.trim()) {
      return item.url.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <PanelShell id="panel-inspector" title="Network Request Inspector" icon={<Globe size={16} style={{ color: 'var(--green)' }} />} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 12px 12px' }}>
        
        {/* Controls Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 0',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="Filter URLs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: 120,
              background: 'var(--bg-base)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              color: 'var(--text-primary)',
              fontSize: 11,
            }}
          />

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 11,
              padding: '4px 6px',
            }}
          >
            <option value="all">All Types</option>
            <option value="xhr">Fetch / XHR</option>
            <option value="js">JS Scripts</option>
            <option value="css">CSS Styles</option>
            <option value="img">Images</option>
          </select>

          <button
            onClick={() => setAutoRefresh(v => !v)}
            title="Auto-refresh"
            style={{
              background: autoRefresh ? 'var(--accent-primary-dim)' : 'transparent',
              color: autoRefresh ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            {autoRefresh ? '● Live' : '○ Paused'}
          </button>

          <button
            onClick={handleClear}
            title="Clear logs"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>

        {/* Request Table / List */}
        <div style={{ flex: 1, overflowY: 'auto', marginTop: 8, fontSize: 11 }}>
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              No network requests recorded for this tab yet.
            </div>
          ) : (
            filteredLogs.map(req => {
              const isErr = req.status === 'failed' || (req.statusCode >= 400 && req.statusCode < 600)
              const isSelected = selectedEntry?.id === req.id

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedEntry(isSelected ? null : req)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '6px 8px',
                    borderBottom: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--t-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: req.method === 'POST' ? 'var(--yellow)' : 'var(--accent-primary)',
                      }}>
                        {req.method}
                      </span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-primary)',
                        maxWidth: 200,
                      }} title={req.url}>
                        {req.url.replace(/^https?:\/\//, '')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 10,
                        color: isErr ? 'var(--red)' : 'var(--green)',
                        fontWeight: 600,
                      }}>
                        {req.statusCode || req.status}
                      </span>
                      {req.duration > 0 && (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {req.duration}ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Inspector Details */}
                  {isSelected && (
                    <div style={{
                      marginTop: 6,
                      padding: 8,
                      backgroundColor: 'var(--bg-base)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-dim)',
                      fontSize: 10.5,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      wordBreak: 'break-all',
                    }}>
                      <div><strong>Full URL:</strong> {req.url}</div>
                      <div><strong>Type:</strong> {req.resourceType}</div>
                      <div><strong>Status:</strong> {req.statusCode} ({req.status})</div>
                      <div><strong>Duration:</strong> {req.duration} ms</div>
                      {req.size > 0 && <div><strong>Size:</strong> {req.size} bytes</div>}
                      <div><strong>Time:</strong> {req.timestamp}</div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </PanelShell>
  )
}
