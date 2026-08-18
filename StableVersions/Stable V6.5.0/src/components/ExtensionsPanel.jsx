import React, { useState, useEffect } from 'react'
import { PanelShell } from './PanelShell'
import { Puzzle, Plus, Trash2, Code2, Check, X, Download, FolderOpen, Power, Sparkles, RefreshCw, Shield, Globe, Wifi, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const nexus = window.nexus

export default function ExtensionsPanel({ onClose }) {
  // Native Proxy / VPN Tunnel
  const [activeProxyRegion, setActiveProxyRegion] = useState('direct')
  const [proxyStatusMsg, setProxyStatusMsg] = useState(null)
  const [customProxyStr, setCustomProxyStr] = useState('')

  // Chrome Web Store Extensions
  const [chromeExts, setChromeExts] = useState([])
  const [storeInput, setStoreInput] = useState('')
  const [isInstalling, setIsInstalling] = useState(false)
  const [installStatus, setInstallStatus] = useState(null)

  // Custom Userscripts
  const [extensions, setExtensions] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('*://*/*')
  const [newType, setNewType] = useState('js') // 'js' | 'css'
  const [newCode, setNewCode] = useState('')

  const PROXY_REGIONS = [
    { id: 'direct', label: 'Direct', code: 'OFF', desc: 'Direct connection (No VPN)' },
    { id: 'nl', label: 'Netherlands', code: 'NL', rules: 'https=https://nl126.servefaststatic.work:443;http=https://nl126.servefaststatic.work:443', desc: 'Amsterdam High-Speed (5.255.97.220)' },
    { id: 'sg', label: 'Singapore', code: 'SG', rules: 'https=https://sg4.cdnflow.net:3178;http=https://sg4.cdnflow.net:3178', desc: 'Singapore Asia-Pacific (23.106.249.36)' },
    { id: 'us', label: 'United States', code: 'US', rules: 'https=https://us25.datafrenzy.org:4463;http=https://us25.datafrenzy.org:4463', desc: 'United States (162.210.194.37)' },
    { id: 'uk', label: 'United Kingdom', code: 'UK', rules: 'https=https://uk25.contentnode.net:16927;http=https://uk25.contentnode.net:16927', desc: 'London High-Speed (23.106.56.35)' },
  ]

  const handleSelectProxyRegion = async (reg) => {
    setActiveProxyRegion(reg.id)
    if (reg.id === 'direct') {
      await nexus?.proxy?.setConfig({ mode: 'direct' })
      setProxyStatusMsg({ type: 'success', text: 'Routed traffic directly (No proxy)' })
    } else {
      await nexus?.proxy?.setConfig({ mode: 'fixed_servers', proxyRules: reg.rules, region: reg.id })
      setProxyStatusMsg({ type: 'vpn', text: `VPN Tunnel Active: ${reg.label} (${reg.code})` })
    }
    setTimeout(() => setProxyStatusMsg(null), 4000)
  }

  const handleApplyCustomProxy = async (e) => {
    e?.preventDefault()
    if (!customProxyStr.trim()) return
    setActiveProxyRegion('custom')
    await nexus?.proxy?.setConfig({ mode: 'fixed_servers', proxyRules: customProxyStr.trim(), region: 'custom' })
    setProxyStatusMsg({ type: 'vpn', text: `Custom Proxy Applied: ${customProxyStr.trim()}` })
    setTimeout(() => setProxyStatusMsg(null), 4000)
  }

  const loadAll = async () => {
    try {
      const cList = await nexus?.extensions.listChromeExtensions()
      setChromeExts(cList || [])
      const uList = await nexus?.extensions.get()
      setExtensions(uList || [])
      const pConf = await nexus?.proxy?.getConfig()
      if (pConf?.region) setActiveProxyRegion(pConf.region)
    } catch (e) {}
  }

  useEffect(() => {
    loadAll()
  }, [])

  // 1-Click Install from Chrome Web Store
  const handleInstallFromStore = async (e) => {
    e?.preventDefault()
    if (!storeInput.trim()) return

    setIsInstalling(true)
    setInstallStatus({ type: 'info', text: 'Downloading & unpacking CRX from Chrome Web Store…' })
    try {
      const res = await nexus?.extensions.installFromStore(storeInput.trim())
      if (res?.success) {
        setInstallStatus({ type: 'success', text: `Installed "${res.extension?.name || 'Extension'}" successfully!` })
        setStoreInput('')
        loadAll()
      } else {
        setInstallStatus({ type: 'error', text: res?.error || 'Installation failed' })
      }
    } catch (err) {
      setInstallStatus({ type: 'error', text: err.message })
    } finally {
      setIsInstalling(false)
      setTimeout(() => setInstallStatus(null), 5000)
    }
  }

  // Load from local folder
  const handleInstallFromFolder = async () => {
    try {
      const res = await nexus?.extensions.installFromFolder()
      if (res?.success) {
        setInstallStatus({ type: 'success', text: `Loaded "${res.extension?.name || 'Extension'}" from folder!` })
        loadAll()
      } else if (res?.error) {
        setInstallStatus({ type: 'error', text: res.error })
      }
    } catch (err) {
      setInstallStatus({ type: 'error', text: err.message })
    }
    setTimeout(() => setInstallStatus(null), 5000)
  }

  const handleToggleChromeExt = async (id, currentEnabled) => {
    const res = await nexus?.extensions.toggleChromeExtension(id, !currentEnabled)
    if (res?.success) {
      setChromeExts(res.extensions || [])
    } else {
      loadAll()
    }
  }

  const handleRemoveChromeExt = async (id) => {
    const res = await nexus?.extensions.removeChromeExtension(id)
    if (res?.success) {
      setChromeExts(res.extensions || [])
    } else {
      loadAll()
    }
  }

  // Userscripts logic
  const handleToggleUserscript = async (id) => {
    const updated = extensions.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)
    setExtensions(updated)
    await nexus?.extensions.save(updated)
  }

  const handleDeleteUserscript = async (id) => {
    const updated = extensions.filter(e => e.id !== id)
    setExtensions(updated)
    await nexus?.extensions.save(updated)
  }

  const handleCreateUserscript = async (e) => {
    e.preventDefault()
    if (!newName || !newCode) return

    const newExt = {
      id: 'ext_' + Date.now(),
      name: newName,
      description: `Custom ${newType.toUpperCase()} rule for ${newDomain}`,
      domain: newDomain || '*://*/*',
      type: newType,
      code: newCode,
      enabled: true,
    }

    const updated = [...extensions, newExt]
    setExtensions(updated)
    await nexus?.extensions.save(updated)

    setNewName('')
    setNewCode('')
    setShowAddForm(false)
  }

  return (
    <PanelShell
      title="Extensions & Store"
      icon={<Puzzle size={16} style={{ color: 'var(--accent-primary)' }} />}
      onClose={onClose}
      badge={`${chromeExts.length + extensions.length} Active`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '12px 14px 28px' }}>
        
        {/* ── Quick VPN & Global Proxy Tunnel Switcher ─────────────────── */}
        <div style={{
          background: activeProxyRegion !== 'direct' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${activeProxyRegion !== 'direct' ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, color: activeProxyRegion !== 'direct' ? 'var(--green)' : 'var(--text-primary)' }}>
              <Shield size={16} />
              <span>Quick VPN Tunnel & Proxy</span>
            </div>
            <span style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              fontWeight: 700,
              background: activeProxyRegion !== 'direct' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: activeProxyRegion !== 'direct' ? 'var(--green)' : 'var(--text-muted)',
            }}>
              {activeProxyRegion !== 'direct' ? 'PROTECTED' : 'DIRECT'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {PROXY_REGIONS.map((reg) => (
              <button
                key={reg.id}
                onClick={() => handleSelectProxyRegion(reg)}
                style={{
                  background: activeProxyRegion === reg.id ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  border: `1px solid ${activeProxyRegion === reg.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: activeProxyRegion === reg.id ? '#000' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 11,
                  padding: '7px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
                title={reg.desc}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {reg.id === 'direct' ? <Wifi size={13} /> : <Globe size={13} />}
                  <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>{reg.code}</span>
                </div>
                <span>{reg.label}</span>
              </button>
            ))}
          </div>

          {proxyStatusMsg && (
            <div style={{
              fontSize: 11,
              color: proxyStatusMsg.type === 'vpn' ? 'var(--green)' : 'var(--accent-primary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              {proxyStatusMsg.type === 'vpn' ? <Shield size={13} /> : <CheckCircle2 size={13} />}
              <span>{proxyStatusMsg.text}</span>
            </div>
          )}
        </div>

        {/* ── Chrome Web Store 1-Click Installer ───────────────────────────── */}
        <div style={{
          background: 'rgba(0, 212, 255, 0.06)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13, color: 'var(--accent-primary)' }}>
              <Sparkles size={15} />
              <span>Chrome Web Store Installer</span>
            </div>
            <button
              onClick={handleInstallFromFolder}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '3px 8px',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Load unpacked extension folder containing manifest.json"
            >
              <FolderOpen size={12} />
              <span>Load Folder</span>
            </button>
          </div>

          <form onSubmit={handleInstallFromStore} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Paste Chrome Web Store URL or 32-char ID…"
              value={storeInput}
              onChange={(e) => setStoreInput(e.target.value)}
              disabled={isInstalling}
              style={{
                flex: 1,
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '6px 10px',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isInstalling || !storeInput.trim()}
              style={{
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#000',
                fontWeight: 600,
                fontSize: 12,
                padding: '0 12px',
                cursor: isInstalling ? 'wait' : 'pointer',
                opacity: isInstalling || !storeInput.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {isInstalling ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={13} />}
              <span>{isInstalling ? 'Installing…' : 'Install'}</span>
            </button>
          </form>

          {installStatus && (
            <div style={{
              fontSize: 11,
              color: installStatus.type === 'success' ? 'var(--green)' : installStatus.type === 'error' ? 'var(--red)' : 'var(--accent-primary)',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {installStatus.type === 'success' ? <CheckCircle2 size={13} /> : installStatus.type === 'error' ? <AlertCircle size={13} /> : <Info size={13} />}
              <span>{installStatus.text}</span>
            </div>
          )}
        </div>

        {/* ── Installed Chrome Web Extensions List ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)' }}>
            Chrome Web Extensions ({chromeExts.length})
          </div>

          {chromeExts.length === 0 ? (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}>
              No Chrome extensions installed yet.<br />
              Paste any Chrome Web Store link above to install in 1 click!
            </div>
          ) : (
            chromeExts.map((ext) => (
              <div
                key={ext.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${ext.enabled ? 'var(--border-dim)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  opacity: ext.enabled ? 1 : 0.6,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{ext.name}</span>
                    <span style={{
                      fontSize: 10,
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '1px 5px',
                      borderRadius: 4,
                      color: 'var(--text-muted)',
                    }}>v{ext.version}</span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {ext.description || 'Chrome Extension'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {ext.enabled && (
                    <button
                      onClick={() => {
                        nexus?.extensions.openPopup(ext.id)
                        onClose?.()
                      }}
                      style={{
                        background: 'rgba(0, 212, 255, 0.12)',
                        border: '1px solid var(--border-bright)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                      title="Open extension popup / dashboard (e.g. Browsec VPN country selector, toggle ON/OFF)"
                    >
                      <span>Open UI</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleChromeExt(ext.id, ext.enabled)}
                    style={{
                      background: ext.enabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${ext.enabled ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: ext.enabled ? 'var(--green)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {ext.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleRemoveChromeExt(ext.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                    }}
                    title="Uninstall Extension"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Custom Domain Userscripts / CSS Rules ────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)' }}>
              Custom Userscripts & CSS ({extensions.length})
            </div>
            <button
              onClick={() => setShowAddForm(v => !v)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                padding: '3px 8px',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={12} />
              <span>{showAddForm ? 'Cancel' : 'New Script'}</span>
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleCreateUserscript}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <input
                type="text"
                placeholder="Script Name (e.g. YouTube Ad Auto-Skip)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  padding: '6px 8px',
                  fontSize: 11,
                  outline: 'none',
                }}
                required
              />

              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '6px 8px',
                    fontSize: 11,
                    outline: 'none',
                  }}
                >
                  <option value="js">JavaScript (Userscript)</option>
                  <option value="css">CSS (Styling)</option>
                </select>

                <input
                  type="text"
                  placeholder="Domain Pattern (*://*.youtube.com/*)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '6px 8px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>

              <textarea
                placeholder={newType === 'js' ? '// Write your JavaScript here\nconsole.log("NeXusWeb Userscript loaded");' : '/* Write your CSS overrides here */\nbody { filter: contrast(1.05); }'}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                rows={5}
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '8px',
                  outline: 'none',
                  resize: 'vertical',
                }}
                required
              />

              <button
                type="submit"
                style={{
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: 11,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                Save Userscript
              </button>
            </form>
          )}

          {extensions.map((ext) => (
            <div
              key={ext.id}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                opacity: ext.enabled ? 1 : 0.6,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>{ext.name}</span>
                  <span style={{
                    fontSize: 10,
                    background: ext.type === 'js' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: ext.type === 'js' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                    padding: '1px 5px',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}>{ext.type?.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {ext.domain}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => handleToggleUserscript(ext.id)}
                  style={{
                    background: ext.enabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${ext.enabled ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: ext.enabled ? 'var(--green)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {ext.enabled ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => handleDeleteUserscript(ext.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </PanelShell>
  )
}
