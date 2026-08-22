import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { PanelShell } from './PanelShell'
import {
  Download, Search, X, FolderOpen, File, FileArchive, FileCode,
  FileImage, FileVideo, FileAudio, FileText, Play, Pause,
  Trash2, Copy, ExternalLink, CheckCircle2, AlertCircle, Clock,
  ArrowDown, Check, RefreshCw, Plus, Zap, Sliders, Layers
} from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

function getFileIcon(type, filename) {
  const ext = filename ? filename.split('.').pop().toLowerCase() : ''
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) || type === 'archive') {
    return <FileArchive size={17} style={{ color: '#f59e0b' }} />
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext) || type === 'image') {
    return <FileImage size={17} style={{ color: '#38bdf8' }} />
  }
  if (['mp4', 'mkv', 'webm', 'avi', 'mov'].includes(ext) || type === 'video') {
    return <FileVideo size={17} style={{ color: '#c084fc' }} />
  }
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext) || type === 'audio') {
    return <FileAudio size={17} style={{ color: '#ec4899' }} />
  }
  if (['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'py', 'cpp', 'rs', 'go'].includes(ext) || type === 'code') {
    return <FileCode size={17} style={{ color: '#4ade80' }} />
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'csv', 'xlsx'].includes(ext) || type === 'document') {
    return <FileText size={17} style={{ color: '#60a5fa' }} />
  }
  return <File size={17} style={{ color: 'var(--text-secondary)' }} />
}

export default function DownloadPanel({ onClose, onToast }) {
  const [downloads, setDownloads] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'progressing' | 'completed' | 'failed'
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newFilename, setNewFilename] = useState('')
  const [newConnections, setNewConnections] = useState(8)
  const [newSpeedLimit, setNewSpeedLimit] = useState(0)

  useEffect(() => {
    window.nexus?.downloads?.get?.().then(list => {
      if (Array.isArray(list)) setDownloads(list)
    })

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

    window.nexus?.downloads?.onUpdate?.(handleUpdate)
    return () => {
      window.nexus?.downloads?.offUpdate?.()
    }
  }, [])

  const handleClear = useCallback(async () => {
    const remaining = await window.nexus?.downloads?.clear?.()
    setDownloads(Array.isArray(remaining) ? remaining : [])
    onToast?.('Cleared completed downloads', 'info')
  }, [onToast])

  const handleOpenFile = useCallback(async (id) => {
    const res = await window.nexus?.downloads?.openFile?.(id)
    if (!res?.success && res?.error) {
      onToast?.(res.error, 'error')
    }
  }, [onToast])

  const handleShowFolder = useCallback(async (id) => {
    const res = await window.nexus?.downloads?.showFolder?.(id)
    if (!res?.success && res?.error) {
      onToast?.(res.error, 'error')
    }
  }, [onToast])

  const handlePause = useCallback(async (id) => {
    const res = await window.nexus?.downloads?.pause?.(id)
    if (res?.success) onToast?.('Download paused', 'info')
  }, [onToast])

  const handleResume = useCallback(async (id) => {
    const res = await window.nexus?.downloads?.resume?.(id)
    if (res?.success) onToast?.('Download resumed', 'info')
  }, [onToast])

  const handleCancel = useCallback(async (id) => {
    const res = await window.nexus?.downloads?.cancel?.(id)
    if (res?.success) onToast?.('Download cancelled', 'info')
  }, [onToast])

  const handleRemove = useCallback(async (id) => {
    const remaining = await window.nexus?.downloads?.remove?.(id)
    if (Array.isArray(remaining)) setDownloads(remaining)
    onToast?.('Removed from download history', 'info')
  }, [onToast])

  const handleCopyUrl = useCallback(async (id) => {
    const res = await window.nexus?.downloads?.copyUrl?.(id)
    if (res?.success) onToast?.('Download link copied to clipboard', 'success')
  }, [onToast])

  const handleAddDownload = async (e) => {
    e.preventDefault()
    if (!newUrl.trim()) return
    await window.nexus?.downloads?.addMultiPart?.({
      url: newUrl.trim(),
      filename: newFilename.trim() || null,
      connections: newConnections,
      speedLimitKB: newSpeedLimit,
    })
    setShowAddModal(false)
    setNewUrl('')
    setNewFilename('')
    onToast?.('Added Dynamic Multi-Part Download', 'success')
  }

  // Computed metrics
  const activeCount = useMemo(() => {
    return downloads.filter(d => d.state === 'progressing' || d.state === 'paused').length
  }, [downloads])

  const completedCount = useMemo(() => {
    return downloads.filter(d => d.state === 'completed').length
  }, [downloads])

  const totalVolume = useMemo(() => {
    return downloads.reduce((acc, d) => acc + (d.receivedBytes || 0), 0)
  }, [downloads])

  // Filtered list
  const filteredDownloads = useMemo(() => {
    return downloads.filter(item => {
      if (statusFilter === 'progressing') {
        if (item.state !== 'progressing' && item.state !== 'paused') return false
      } else if (statusFilter === 'completed') {
        if (item.state !== 'completed') return false
      } else if (statusFilter === 'failed') {
        if (item.state !== 'cancelled' && item.state !== 'interrupted') return false
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchName = item.filename?.toLowerCase().includes(q)
        const matchUrl = item.url?.toLowerCase().includes(q)
        if (!matchName && !matchUrl) return false
      }

      return true
    })
  }, [downloads, statusFilter, searchQuery])

  // Top Drawer Header Actions
  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => setShowAddModal(true)}
        className="glass-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 9px',
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 'var(--radius-xs)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
        title="Add URL for Dynamic Multi-Part Download"
      >
        <Plus size={13} style={{ color: 'var(--accent-primary)' }} />
        <span>Add URL</span>
      </button>

      {completedCount > 0 && (
        <button
          id="btn-downloads-clear"
          onClick={handleClear}
          className="glass-btn-icon"
          style={{
            width: 26,
            height: 26,
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--glass-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
          }}
          title="Clear all completed downloads"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )

  return (
    <PanelShell
      id="panel-downloads"
      title="Download Manager"
      icon={<Download size={16} style={{ color: 'var(--accent-primary)' }} />}
      onClose={onClose}
      actions={headerActions}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px' }}>
        
        {/* 1. Theme-Adaptive Unified Metric Overview Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'var(--glass-bg-card)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--glass-shadow-sm)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 10px',
            textAlign: 'center',
            borderRight: '1px solid var(--glass-border-subtle)',
          }}>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: activeCount > 0 ? 'var(--accent-primary)' : 'var(--text-primary)', marginTop: 1 }}>
              {activeCount}
            </div>
          </div>

          <div style={{
            padding: '8px 10px',
            textAlign: 'center',
            borderRight: '1px solid var(--glass-border-subtle)',
          }}>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green)', marginTop: 1 }}>
              {completedCount}
            </div>
          </div>

          <div style={{
            padding: '8px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Volume
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              {formatBytes(totalVolume)}
            </div>
          </div>
        </div>

        {/* 2. Sleek Search & Filter Omnibox */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          transition: 'border-color 0.15s ease',
        }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search downloads by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 11.5,
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* 3. Segmented Control Category Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          background: 'var(--bg-surface)',
          padding: 3,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--glass-border)',
        }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'progressing', label: `Active (${activeCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'failed', label: 'Cancelled' },
          ].map(tab => {
            const isActive = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: isActive ? 'var(--text-primary)' : 'transparent',
                  color: isActive ? 'var(--bg-base)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '5px 4px',
                  fontSize: 10.5,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? 'var(--glass-shadow-sm)' : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 4. Downloads Item List */}
        {filteredDownloads.length === 0 ? (
          <div style={{
            padding: '48px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--bg-hover)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}>
              <Download size={24} style={{ opacity: 0.6 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                {searchQuery ? 'No Matching Downloads' : 'No Active Downloads'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxWidth: 240, lineHeight: 1.5 }}>
                {searchQuery
                  ? `No downloads found matching "${searchQuery}"`
                  : downloads.length === 0
                    ? 'Downloaded files from the web or localhost will appear here.'
                    : 'No downloads matching this category filter.'}
              </div>
            </div>

            {!searchQuery && downloads.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="glass-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                <Plus size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>Add Download URL</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDownloads.map(item => {
              const percent = item.totalBytes > 0
                ? Math.min(100, Math.round((item.receivedBytes / item.totalBytes) * 100))
                : 0
              const isDone = item.state === 'completed'
              const isProgress = item.state === 'progressing'
              const isPaused = item.state === 'paused' || item.isPaused
              const isCancelled = item.state === 'cancelled' || item.state === 'interrupted'
              const isTurbo = item.turboMode || (item.connections > 1)

              return (
                <div
                  key={item.id}
                  id={`download-item-${item.id}`}
                  style={{
                    background: 'var(--glass-bg-card)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--glass-shadow-sm)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 7,
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Top Row: File Icon + Filename + Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {getFileIcon(item.fileType, item.filename)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }} title={item.filename}>
                        {item.filename}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {item.url && (
                          <div style={{
                            fontSize: 10.5,
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 150,
                          }}>
                            {item.url.replace(/^https?:\/\//, '').split('/')[0]}
                          </div>
                        )}

                        {isTurbo && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}>
                            <Zap size={9} />
                            <span>{item.connections || 8} Segments</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: isDone ? 'var(--green)' : isProgress ? 'var(--accent-primary)' : isPaused ? 'var(--yellow)' : 'var(--red)',
                      background: isDone ? 'rgba(34, 197, 94, 0.12)' : isProgress ? 'var(--bg-hover)' : isPaused ? 'rgba(234, 179, 8, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${isDone ? 'var(--green)' : isProgress ? 'var(--glass-border)' : isPaused ? 'var(--yellow)' : 'var(--red)'}`,
                    }}>
                      {isDone && <CheckCircle2 size={10} />}
                      {isPaused && <Pause size={10} />}
                      {isCancelled && <AlertCircle size={10} />}
                      {isProgress && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 1s infinite' }} />}
                      <span>{item.state?.toUpperCase()}</span>
                    </span>
                  </div>

                  {/* Progress Bar (Active or Paused) */}
                  {(isProgress || isPaused) && (
                    <div style={{
                      height: 4,
                      background: 'var(--bg-surface)',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid var(--glass-border-subtle)',
                    }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: isPaused ? 'var(--yellow)' : 'var(--accent-primary)',
                        transition: 'width 0.2s linear',
                      }} />
                    </div>
                  )}

                  {/* Multi-Part Segmentation Visualizer Blocks */}
                  {Array.isArray(item.segments) && item.segments.length > 1 && (isProgress || isPaused) && (
                    <div style={{
                      display: 'flex',
                      gap: 2,
                      height: 3.5,
                      background: 'var(--bg-surface)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      {item.segments.map(seg => (
                        <div
                          key={seg.id}
                          style={{
                            flex: 1,
                            height: '100%',
                            background: seg.completed
                              ? 'var(--green)'
                              : seg.active
                                ? 'var(--accent-primary)'
                                : 'var(--bg-hover)',
                            opacity: seg.active ? 1 : 0.5,
                            transition: 'all 0.2s ease',
                          }}
                          title={`Segment #${seg.id}: ${seg.progress}%`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Metadata: Bytes / Speed / ETA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <span>
                      {formatBytes(item.receivedBytes)}
                      {item.totalBytes > 0 && ` / ${formatBytes(item.totalBytes)}`}
                      {isProgress && item.speed > 0 && ` · ${formatBytes(item.speed)}/s`}
                      {isProgress && item.eta && ` · ${item.eta}`}
                    </span>
                    {(isProgress || isPaused) && <span>{percent}%</span>}
                  </div>

                  {/* Action Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 2,
                    paddingTop: 6,
                    borderTop: '1px solid var(--glass-border-subtle)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isDone && (
                        <>
                          <button
                            onClick={() => handleOpenFile(item.id)}
                            className="glass-btn"
                            style={{
                              padding: '3px 9px',
                              fontSize: 11,
                              fontWeight: 600,
                              background: 'var(--text-primary)',
                              color: 'var(--bg-base)',
                              border: 'none',
                              borderRadius: 'var(--radius-xs)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                            }}
                          >
                            <ExternalLink size={11} />
                            <span>Open</span>
                          </button>
                          <button
                            onClick={() => handleShowFolder(item.id)}
                            className="glass-btn"
                            style={{
                              padding: '3px 9px',
                              fontSize: 11,
                              fontWeight: 500,
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: 'var(--radius-xs)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                            }}
                          >
                            <FolderOpen size={11} />
                            <span>Folder</span>
                          </button>
                        </>
                      )}

                      {isProgress && (
                        <button
                          onClick={() => handlePause(item.id)}
                          className="glass-btn"
                          style={{
                            padding: '3px 9px',
                            fontSize: 11,
                            fontWeight: 500,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--radius-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <Pause size={11} />
                          <span>Pause</span>
                        </button>
                      )}

                      {isPaused && (
                        <button
                          onClick={() => handleResume(item.id)}
                          className="glass-btn"
                          style={{
                            padding: '3px 9px',
                            fontSize: 11,
                            fontWeight: 600,
                            background: 'var(--text-primary)',
                            color: 'var(--bg-base)',
                            border: 'none',
                            borderRadius: 'var(--radius-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <Play size={11} />
                          <span>Resume</span>
                        </button>
                      )}

                      {(isProgress || isPaused) && (
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="glass-btn"
                          style={{
                            padding: '3px 9px',
                            fontSize: 11,
                            fontWeight: 500,
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--red)',
                            borderRadius: 'var(--radius-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <X size={11} />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => handleCopyUrl(item.id)}
                        className="glass-btn-icon"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 'var(--radius-xs)',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                        }}
                        title="Copy Download URL"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="glass-btn-icon"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 'var(--radius-xs)',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                        }}
                        title="Remove from history"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Modern Frosted Glass "+ Add Download URL" Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <form
            onSubmit={handleAddDownload}
            style={{
              background: 'var(--bg-base)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              width: 440,
              maxWidth: '92vw',
              padding: '20px 22px',
              boxShadow: 'var(--glass-shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Add Multi-Part Download</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="glass-btn-icon"
                style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Target Download URL
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/file.zip"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Custom Save Filename (Optional)
              </label>
              <input
                type="text"
                placeholder="file.zip"
                value={newFilename}
                onChange={e => setNewFilename(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Parallel Connections
                </label>
                <select
                  value={newConnections}
                  onChange={e => setNewConnections(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '7px 10px',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  <option value={4}>4 Segments</option>
                  <option value={8}>8 Segments (Turbo)</option>
                  <option value={16}>16 Segments (Max)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Speed Limiter
                </label>
                <select
                  value={newSpeedLimit}
                  onChange={e => setNewSpeedLimit(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '7px 10px',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  <option value={0}>Unlimited</option>
                  <option value={1024}>1 MB/s</option>
                  <option value={2048}>2 MB/s</option>
                  <option value={5120}>5 MB/s</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="glass-btn"
                style={{
                  fontSize: 11.5,
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glass-btn"
                style={{
                  fontSize: 11.5,
                  padding: '6px 16px',
                  background: 'var(--text-primary)',
                  color: 'var(--bg-base)',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Download size={13} />
                <span>Start Turbo Download</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </PanelShell>
  )
}
