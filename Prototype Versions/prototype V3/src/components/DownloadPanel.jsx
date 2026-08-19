import React, { useEffect, useState, useCallback } from 'react'
import { PanelShell } from './PanelShell'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

export default function DownloadPanel({ onClose, onToast }) {
  const [downloads, setDownloads] = useState([])

  useEffect(() => {
    window.nexus?.downloads.get().then(setDownloads)

    const handleUpdate = (updatedItem) => {
      setDownloads(prev => {
        const idx = prev.findIndex(d => d.id === updatedItem.id)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = updatedItem
          return next
        }
        return [updatedItem, ...prev]
      })
    }

    window.nexus?.downloads.onUpdate(handleUpdate)
    return () => {
      window.nexus?.downloads.offUpdate()
    }
  }, [])

  const handleClear = useCallback(async () => {
    const remaining = await window.nexus?.downloads.clear()
    setDownloads(remaining || [])
  }, [])

  const handleOpenFile = useCallback(async (id) => {
    const res = await window.nexus?.downloads.openFile(id)
    if (!res?.success && res?.error) {
      onToast?.(res.error, 'error')
    }
  }, [onToast])

  const handleShowFolder = useCallback(async (id) => {
    const res = await window.nexus?.downloads.showFolder(id)
    if (!res?.success && res?.error) {
      onToast?.(res.error, 'error')
    }
  }, [onToast])

  const clearBtn = (
    <button
      id="btn-downloads-clear"
      onClick={handleClear}
      style={{
        border: '1px solid var(--border-dim)', background: 'transparent',
        color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
        padding: '3px 8px', borderRadius: 'var(--radius-sm)',
        transition: 'all var(--t-fast)',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
    >
      Clear
    </button>
  )

  return (
    <PanelShell id="panel-downloads" title="Downloads" icon="📥" onClose={onClose} actions={clearBtn}>
      {downloads.length === 0 ? (
        <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📥</div>
          No downloads yet. Downloaded files from localhost or web will appear here.
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {downloads.map(item => {
            const percent = item.totalBytes > 0
              ? Math.min(100, Math.round((item.receivedBytes / item.totalBytes) * 100))
              : 0
            const isDone = item.state === 'completed'
            const isProgress = item.state === 'progressing'

            return (
              <div
                key={item.id}
                id={`download-item-${item.id}`}
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  transition: 'background var(--t-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220
                  }}>
                    {item.filename}
                  </span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: isDone ? 'var(--green)' : isProgress ? 'var(--accent-primary)' : 'var(--red)',
                    textTransform: 'uppercase',
                  }}>
                    {item.state}
                  </span>
                </div>

                {/* Progress bar */}
                {isProgress && (
                  <div style={{
                    height: 4, background: 'var(--bg-elevated)',
                    borderRadius: 2, overflow: 'hidden', margin: '6px 0',
                  }}>
                    <div style={{
                      width: `${percent}%`, height: '100%',
                      background: 'var(--accent-primary)',
                      transition: 'width 0.2s linear',
                    }} />
                  </div>
                )}

                {/* Sub info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>
                    {formatBytes(item.receivedBytes)}
                    {item.totalBytes > 0 && ` / ${formatBytes(item.totalBytes)}`}
                    {item.speed > 0 && ` · ${formatBytes(item.speed)}/s`}
                  </span>
                  {isProgress && <span>{percent}%</span>}
                </div>

                {/* Actions */}
                {isDone && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => handleOpenFile(item.id)}
                      style={{
                        padding: '4px 10px', fontSize: 11, fontWeight: 500,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', cursor: 'pointer',
                      }}
                    >
                      Open File
                    </button>
                    <button
                      onClick={() => handleShowFolder(item.id)}
                      style={{
                        padding: '4px 10px', fontSize: 11,
                        background: 'transparent', border: '1px solid var(--border-dim)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer',
                      }}
                    >
                      Show in Folder
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </PanelShell>
  )
}
