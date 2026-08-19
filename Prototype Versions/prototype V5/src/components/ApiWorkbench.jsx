import React, { useState } from 'react'
import PanelShell from './PanelShell'
import { Send, Play, Copy, Check, Clock, Database, Layers } from 'lucide-react'

const nexus = window.nexus

export default function ApiWorkbench({ onClose }) {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('http://localhost:5173')
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [body, setBody] = useState('{\n  "key": "value"\n}')
  const [authType, setAuthType] = useState('none')
  const [authToken, setAuthToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [activeTab, setActiveTab] = useState('body') // 'body' | 'headers' | 'auth'
  const [copied, setCopied] = useState(false)

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!url) return
    setLoading(true)
    setResponse(null)

    try {
      let parsedHeaders = {}
      try {
        parsedHeaders = JSON.parse(headers)
      } catch (e) {}

      let parsedBody = null
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        try {
          parsedBody = JSON.parse(body)
        } catch (e) {
          parsedBody = body
        }
      }

      const res = await nexus?.apiWorkbench.sendRequest({
        method,
        url,
        headers: parsedHeaders,
        body: parsedBody,
        auth: authType === 'bearer' ? { type: 'bearer', token: authToken } : null,
      })

      setResponse(res)
    } catch (err) {
      setResponse({ success: false, error: err.message, duration: 0 })
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    if (!response?.data) return
    const text = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : String(response.data)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PanelShell
      title="REST / GraphQL Workbench"
      icon={<Send size={16} style={{ color: 'var(--accent)' }} />}
      onClose={onClose}
      badge="Offline Client"
      width={380}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Request Line */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '6px' }}>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent)',
              fontWeight: '700',
              padding: '6px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8000/api..."
            style={{
              flex: 1,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: '#0a0d14',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              padding: '0 12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Send Request"
          >
            {loading ? <Clock size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          </button>
        </form>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          gap: '12px',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {['body', 'headers', 'auth'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                padding: '6px 2px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontSize: '11px',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Views */}
        {activeTab === 'body' && (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="JSON Request Body..."
            rows={5}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '8px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        )}

        {activeTab === 'headers' && (
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder="Headers JSON..."
            rows={5}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '8px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        )}

        {activeTab === 'auth' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setAuthType('none')}
                style={{
                  flex: 1,
                  padding: '5px',
                  fontSize: '11px',
                  background: authType === 'none' ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: authType === 'none' ? 'var(--accent)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                No Auth
              </button>
              <button
                onClick={() => setAuthType('bearer')}
                style={{
                  flex: 1,
                  padding: '5px',
                  fontSize: '11px',
                  background: authType === 'bearer' ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: authType === 'bearer' ? 'var(--accent)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                Bearer Token
              </button>
            </div>
            {authType === 'bearer' && (
              <input
                type="text"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Paste JWT / API Bearer Token..."
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '6px 8px',
                  outline: 'none',
                }}
              />
            )}
          </div>
        )}

        {/* Response Panel */}
        {response && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
          }}>
            {/* Status Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: response.status >= 200 && response.status < 300 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: response.status >= 200 && response.status < 300 ? 'var(--success)' : 'var(--error)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {response.status ? `${response.status} ${response.statusText}` : 'ERROR'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ⏱ {response.duration}ms
                </span>
              </div>

              <button
                onClick={copyResponse}
                title="Copy Response Body"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? 'var(--success)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>

            {/* Response Body Output */}
            <pre style={{
              maxHeight: '180px',
              overflow: 'auto',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              background: 'var(--bg-primary)',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}>
              {response.error ? response.error : (
                typeof response.data === 'object'
                  ? JSON.stringify(response.data, null, 2)
                  : String(response.data)
              )}
            </pre>
          </div>
        )}
      </div>
    </PanelShell>
  )
}
