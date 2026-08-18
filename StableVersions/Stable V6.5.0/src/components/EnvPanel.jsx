import React, { useState, useEffect } from 'react'
import { PanelShell } from './PanelShell'
import { Key, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react'

export default function EnvPanel({ onClose, onToast }) {
  const [envFiles, setEnvFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [showSecrets, setShowSecrets] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const loadFiles = async () => {
    setLoading(true)
    try {
      const files = await window.nexus?.env?.getFiles()
      setEnvFiles(files || [])
      if (files && files.length > 0 && !selectedFile) {
        setSelectedFile(files[0])
      }
    } catch (e) {
      if (onToast) onToast('Failed to scan .env files', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const toggleSecret = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    if (onToast) onToast(`Copied ${label} to clipboard`, 'success')
  }

  const variables = (selectedFile?.variables || []).filter(v => {
    if (v.isComment) return false
    if (!searchQuery.trim()) return true
    return v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
           v.value.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <PanelShell id="panel-env" title="Environment Variables" icon={<Key size={16} style={{ color: 'var(--yellow)' }} />} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 12px 12px' }}>
        
        {/* Header toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {envFiles.length > 0 ? (
            <select
              value={selectedFile?.filePath || ''}
              onChange={e => {
                const f = envFiles.find(file => file.filePath === e.target.value)
                if (f) setSelectedFile(f)
              }}
              style={{
                flex: 1,
                background: 'var(--bg-base)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 11,
                padding: '4px 6px',
              }}
            >
              {envFiles.map(f => (
                <option key={f.filePath} value={f.filePath}>
                  {f.dirName} / {f.fileName} ({f.varCount} vars)
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {loading ? 'Scanning workspace...' : 'No .env files found in workspace'}
            </div>
          )}

          <button
            onClick={loadFiles}
            title="Rescan project directory"
            style={{
              background: 'transparent',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={11} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            <span>Scan</span>
          </button>
        </div>

        {/* Search input */}
        {selectedFile && (
          <div style={{ marginTop: 8 }}>
            <input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 8px',
                color: 'var(--text-primary)',
                fontSize: 11,
              }}
            />
          </div>
        )}

        {/* Variables List */}
        <div style={{ flex: 1, overflowY: 'auto', marginTop: 10 }}>
          {!selectedFile ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 12 }}>
              No .env file selected. Place a <code>.env</code> file in your project directory to inspect variables.
            </div>
          ) : variables.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: 12 }}>
              No matching variables found.
            </div>
          ) : (
            variables.map((item, idx) => {
              const isRevealed = showSecrets[item.key]
              const displayVal = item.isSecret && !isRevealed ? '••••••••••••••••' : item.value

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px 10px',
                    marginBottom: 6,
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      wordBreak: 'break-all',
                    }}>
                      {item.key}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {item.isSecret && (
                        <button
                          onClick={() => toggleSecret(item.key)}
                          title={isRevealed ? 'Mask value' : 'Show secret value'}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      )}

                      <button
                        onClick={() => copyToClipboard(item.value, item.key)}
                        title="Copy value"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: item.isSecret && !isRevealed ? 'var(--text-muted)' : 'var(--text-secondary)',
                    marginTop: 4,
                    wordBreak: 'break-all',
                  }}>
                    {displayVal || <em style={{ opacity: 0.5 }}>empty</em>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </PanelShell>
  )
}
