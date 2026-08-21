import React, { useState, useEffect, useCallback, useRef } from 'react'
import TitleBar from './components/TitleBar'
import TabBar from './components/TabBar'
import BookmarksBar from './components/BookmarksBar'
import AddressBar from './components/AddressBar'
import SplitBar from './components/SplitBar'
import HomePage from './components/HomePage'
import Terminal from './components/Terminal'
import StatusBar from './components/StatusBar'
import BookmarksPanel from './components/BookmarksPanel'
import HistoryPanel from './components/HistoryPanel'
import SettingsPanel from './components/SettingsPanel'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import DownloadPanel from './components/DownloadPanel'
import PortManager from './components/PortManager'
import ScratchPad from './components/ScratchPad'
import RequestInspector from './components/RequestInspector'
import EnvPanel from './components/EnvPanel'
import ReaderMode from './components/ReaderMode'
import CommandPalette from './components/CommandPalette'
import FindBar from './components/FindBar'
import ToastNotification from './components/ToastNotification'
import AboutPanel from './components/AboutPanel'
import HelpPanel from './components/HelpPanel'
import MenuDrawer from './components/MenuDrawer'
import MediaPanel from './components/MediaPanel'
import ApiWorkbench from './components/ApiWorkbench'
import ExtensionsPanel from './components/ExtensionsPanel'
import ThemeCustomizer from './components/ThemeCustomizer'
import ContextMenu from './components/ContextMenu'
import QuickToolsDrawer from './components/QuickToolsDrawer'
import PrivateDenStartPage from './components/PrivateDenStartPage'
import SplitResizeBar from './components/SplitResizeBar'
import ErrorBoundary from './components/ErrorBoundary'

const nexus = window.nexus

export default function App() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [tabs, setTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [splitTabId, setSplitTabId] = useState(null)
  const [splitRatio, setSplitRatio] = useState(0.5)
  const [mode, setMode] = useState('normal') // Default to Normal Privacy Web
  const [theme, setTheme] = useState('dark')
  const [isPrivateDen, setIsPrivateDen] = useState(() => {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('private') === '1'
  })
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalMinimized, setTerminalMinimized] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [zoomFactor, setZoomFactor] = useState(1.0)
  const [isSplitView, setIsSplitView] = useState(false)
  const [showFindBar, setShowFindBar] = useState(false)
  const [showBookmarksBar, setShowBookmarksBar] = useState(false) // Removed from default view
  const [showReaderMode, setShowReaderMode] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showMediaHUD, setShowMediaHUD] = useState(false)
  const [detectedServers, setDetectedServers] = useState([])
  const [detectedServersCount, setDetectedServersCount] = useState(0)
  const [settingsSection, setSettingsSection] = useState('privacy')
  const [contextMenu, setContextMenu] = useState(null)
  const [showOtherBookmarks, setShowOtherBookmarks] = useState(true)
  const [bookmarksToolbarState, setBookmarksToolbarState] = useState('never')

  // DuckDuckGo Privacy Stats
  const [privacyStats, setPrivacyStats] = useState({ trackersBlocked: 0, adsBlocked: 0, httpsUpgrades: 0 })

  // Side Drawers: 'bookmarks' | 'history' | 'settings' | 'shortcuts' | 'downloads' | 'ports' | 'notes' | 'inspector' | 'env'
  const [activePanel, setActivePanel] = useState(null)
  const [toasts, setToasts] = useState([])

  const addressInputRef = useRef(null)
  const activeTabIdRef = useRef(activeTabId)
  activeTabIdRef.current = activeTabId
  const splitTabIdRef = useRef(splitTabId)
  splitTabIdRef.current = splitTabId
  const zoomFactorRef = useRef(zoomFactor)
  zoomFactorRef.current = zoomFactor

  // ── Callbacks (Defined BEFORE Effects to prevent TDZ ReferenceErrors) ─────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const applyTheme = useCallback((newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [])

  const handleWipeAndExit = useCallback(async () => {
    await nexus?.wipeAndExit?.()
  }, [])

  const handleNewTab = useCallback(async (url) => {
    let targetUrl = url
    if (!targetUrl) {
      if (isPrivateDen) {
        targetUrl = 'https://duckduckgo.com'
      } else if (mode === 'normal') {
        const s = await nexus?.settings.get()
        const engine = s?.searchEngine
        targetUrl = engine?.homeUrl || (engine?.url ? engine.url.split('?')[0] : 'https://duckduckgo.com')
      } else {
        targetUrl = 'nexusweb://home'
      }
    }
    const newTabId = await nexus?.createTab(targetUrl)
    if (newTabId) {
      setTabs(prev => {
        if (prev.some(t => t.id === newTabId)) return prev
        return [
          ...prev,
          {
            id: newTabId,
            url: targetUrl,
            title: targetUrl === 'nexusweb://home' ? 'Home' : (isPrivateDen ? 'Private Den' : 'New Tab'),
            favicon: null,
            loading: targetUrl !== 'nexusweb://home',
            isPlayingAudio: false,
          }
        ]
      })
      setActiveTabId(newTabId)
      setCurrentUrl(targetUrl)
    }
  }, [mode, isPrivateDen])

  const handleCloseTab = useCallback((tabId) => {
    const id = typeof tabId === 'string' ? parseInt(tabId, 10) : tabId
    setTabs(prev => prev.filter(t => t.id !== id && t.id !== tabId))
    nexus?.closeTab(id)
  }, [])

  const handleReopenClosedTab = useCallback(async () => {
    const res = await nexus?.reopenClosedTab()
    if (res) {
      addToast('Reopened closed tab', 'info')
    }
  }, [addToast])

  const handleSwitchTab = useCallback((tabId) => {
    nexus?.switchTab(tabId)
    setActiveTabId(tabId)
  }, [])

  const handleToggleMuteTab = useCallback(async (tabId) => {
    const tab = tabs.find(t => t.id === tabId)
    const nextMute = !tab?.isMuted
    await nexus?.media?.muteTab(tabId, nextMute)
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, isMuted: nextMute } : t))
    addToast(nextMute ? 'Tab muted' : 'Tab unmuted', 'info')
  }, [tabs, addToast])

  const handleReorderTabs = useCallback((from, to) => {
    setTabs(prev => {
      const draggedIdx = typeof from === 'number' ? from : prev.findIndex(t => t.id === from)
      const targetIdx = typeof to === 'number' ? to : prev.findIndex(t => t.id === to)
      if (draggedIdx === -1 || targetIdx === -1) return prev
      const next = [...prev]
      const [removed] = next.splice(draggedIdx, 1)
      next.splice(targetIdx, 0, removed)
      return next
    })
  }, [])

  const handleNavigate = useCallback((url) => {
    const targetUrl = url || 'nexusweb://home'
    setCurrentUrl(targetUrl)
    nexus?.navigate(targetUrl, activeTabIdRef.current)
  }, [])

  const handleModeChange = useCallback(async (newMode) => {
    await nexus?.setMode(newMode)
    setMode(newMode)
    const label = {
      normal: 'Normal Web (Privacy Shield Active)',
      strict: 'Strict Offline Mode',
      lan: 'Local Network Mode',
      dev: 'Developer Mode',
    }[newMode] || newMode
    addToast(`Mode: ${label}`, 'info')

    // In normal mode, if on the developer Home page, automatically open default search engine!
    if (newMode === 'normal' && (currentUrl === 'nexusweb://home' || !currentUrl)) {
      const s = await nexus?.settings.get()
      const engine = s?.searchEngine
      const searchHome = engine?.homeUrl || (engine?.url ? engine.url.split('?')[0] : 'https://duckduckgo.com')
      handleNavigate(searchHome)
    }
  }, [addToast, currentUrl, handleNavigate])

  const handleThemeChange = useCallback(async (newTheme) => {
    applyTheme(newTheme)
    await nexus?.settings.update({ theme: newTheme })
    addToast(`Theme set to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info')
  }, [applyTheme, addToast])

  const handleToggleTheme = useCallback(async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    await handleThemeChange(nextTheme)
  }, [theme, handleThemeChange])

  const handleClosePanel = useCallback(() => {
    setActivePanel(null)
    nexus?.setActiveDrawer(null)
  }, [])

  const togglePanel = useCallback((panel) => {
    setActivePanel(p => {
      const next = p === panel ? null : panel
      nexus?.setActiveDrawer(next)
      return next
    })
  }, [])

  const handlePortClick = useCallback((url) => {
    handleClosePanel()
    handleNavigate(url)
  }, [handleNavigate, handleClosePanel])

  const handleToggleBookmark = useCallback(async () => {
    if (!currentUrl || currentUrl === 'nexusweb://home') return
    if (bookmarked) {
      const bms = await nexus?.bookmarks.get()
      const existing = bms?.find(b => b.url === currentUrl)
      if (existing) {
        await nexus?.bookmarks.remove(existing.id)
        setBookmarked(false)
        addToast('Removed bookmark', 'info')
      }
    } else {
      const activeTab = tabs.find(t => t.id === activeTabIdRef.current)
      await nexus?.bookmarks.add({
        url: currentUrl,
        title: activeTab?.title || currentUrl,
        favicon: activeTab?.favicon || null,
      })
      setBookmarked(true)
      addToast('Saved bookmark ★', 'success')
    }
  }, [currentUrl, bookmarked, tabs, addToast])

  const handleToggleSplitView = useCallback(async () => {
    const nextState = await nexus?.splitView.toggle()
    setIsSplitView(nextState)
    addToast(nextState ? 'Split View Enabled (2 Apps)' : 'Split View Closed', 'info')
  }, [addToast])

  const handleSplitRatioChange = useCallback(async (newRatio) => {
    setSplitRatio(newRatio)
    await nexus?.splitView?.setRatio?.(newRatio)
  }, [])

  const handleSelectSplitTab = useCallback((tabId) => {
    nexus?.splitView.setTab(tabId)
    setSplitTabId(tabId)
  }, [])

  const handleNavigateSplitTab = useCallback((tabId, url) => {
    nexus?.navigate(url, tabId)
  }, [])

  const handleSwapPanes = useCallback(() => {
    if (!splitTabIdRef.current || !activeTabIdRef.current) return
    const curActive = activeTabIdRef.current
    const curSplit = splitTabIdRef.current
    nexus?.switchTab(curSplit)
    nexus?.splitView.setTab(curActive)
    setActiveTabId(curSplit)
    setSplitTabId(curActive)
  }, [])

  const handleCaptureScreenshot = useCallback(async () => {
    addToast('Capturing screenshot…', 'info')
    const res = await nexus?.capturePage()
    if (res?.success) {
      addToast(`Screenshot saved to Desktop: ${res.filename}`, 'success')
    } else {
      addToast(`Failed to capture: ${res?.error || 'Unknown error'}`, 'error')
    }
  }, [addToast])

  const handleTriggerPiP = useCallback(async () => {
    addToast('Requesting Floating Video PiP…', 'info')
    const res = await nexus?.media?.triggerPiP(activeTabIdRef.current)
    if (res?.success) {
      addToast(res.message || 'Picture-in-Picture active', 'success')
    } else {
      addToast(res?.error || 'No video detected on page', 'error')
    }
  }, [addToast])

  const handleZoomIn = useCallback(() => {
    const currentZoom = zoomFactorRef.current || 1.0
    const next = Math.min(3.0, Math.round((currentZoom + 0.1) * 10) / 10)
    nexus?.zoom.set(next, activeTabIdRef.current)
    setZoomFactor(next)
  }, [])

  const handleZoomOut = useCallback(() => {
    const currentZoom = zoomFactorRef.current || 1.0
    const next = Math.max(0.3, Math.round((currentZoom - 0.1) * 10) / 10)
    nexus?.zoom.set(next, activeTabIdRef.current)
    setZoomFactor(next)
  }, [])

  const handleZoomReset = useCallback(() => {
    nexus?.zoom.set(1.0, activeTabIdRef.current)
    setZoomFactor(1.0)
  }, [])

  const handleToggleReaderMode = useCallback(() => {
    setShowReaderMode(v => {
      const next = !v
      nexus?.setReaderModeActive(next)
      return next
    })
  }, [])

  const handleOpenNewWindow = useCallback((url = null) => {
    nexus?.openNewWindow(url, false)
  }, [])

  const handleOpenNewPrivateWindow = useCallback((url = null) => {
    nexus?.openNewWindow(url, true)
  }, [addToast])

  const handleCreatePrivateDen = useCallback(async () => {
    nexus?.openNewWindow('https://duckduckgo.com', true)
    addToast('Opened Private Den Window (Zero History & Traces)', 'info')
  }, [addToast])

  // Synchronize Terminal Viewport state so BrowserView doesn't cover Terminal
  useEffect(() => {
    nexus?.setTerminalState(showTerminal, terminalMinimized)
  }, [showTerminal, terminalMinimized])

  // Synchronize Reader Mode state with Electron
  useEffect(() => {
    nexus?.setReaderModeActive(showReaderMode)
  }, [showReaderMode])

  // Synchronize Active Drawer / Settings state with Electron
  useEffect(() => {
    nexus?.setActiveDrawer(activePanel)
  }, [activePanel])

  // Synchronize Bookmarks Bar state with Electron Viewport
  useEffect(() => {
    nexus?.setBookmarksBarOpen(showBookmarksBar && !isPrivateDen)
  }, [showBookmarksBar, isPrivateDen])

  // Window-level Ctrl + Mouse Wheel listener
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) {
          handleZoomIn()
        } else if (e.deltaY > 0) {
          handleZoomOut()
        }
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [handleZoomIn, handleZoomOut])

  // ── One-Time Startup & IPC Registration ───────────────────────────────────
  useEffect(() => {
    if (!nexus) return

    // 1. Initial State Fetch
    nexus.getMode().then(m => { if (m) setMode(m) })
    nexus.settings.get().then(s => {
      applyTheme(s?.theme || 'dark')
      if (s?.defaultMode) setMode(s.defaultMode)
      if (s?.showBookmarksBar) setShowBookmarksBar(s.showBookmarksBar)
    })
    nexus.privacy.getStats().then(st => {
      if (st) setPrivacyStats(st)
    })
    nexus.getTabs().then(initialTabs => {
      if (initialTabs && initialTabs.length > 0) {
        setTabs(initialTabs.map(t => ({
          id: t.id, url: t.url, title: t.title, favicon: t.favicon, loading: false,
          isPlayingAudio: !!t.isPlayingAudio
        })))
      }
    })
    nexus.getActiveTab().then(id => {
      if (id) setActiveTabId(id)
    })
    nexus.splitView.getState().then(st => {
      if (st) {
        setIsSplitView(!!st.enabled)
        setSplitTabId(st.splitTabId || null)
        if (typeof st.splitRatio === 'number') setSplitRatio(st.splitRatio)
      }
    })

    // 2. Localhost Server Poller
    const updateServerCount = async () => {
      try {
        const found = await nexus.scanPorts()
        setDetectedServers(found || [])
        setDetectedServersCount(found?.length || 0)
      } catch (e) {}
    }
    updateServerCount()
    const serverInterval = setInterval(updateServerCount, 3000)

    // 3. Register Safe Event Handlers
    const unbindCreated = nexus.on.tabCreated(({ tabId, url, title }) => {
      setTabs(prev => {
        if (prev.some(t => t.id === tabId)) return prev
        return [...prev, { id: tabId, url, title: title || 'Home', favicon: null, loading: false, isPlayingAudio: false }]
      })
      setActiveTabId(tabId)
      setCurrentUrl(url || 'nexusweb://home')
    })

    const unbindUpdated = nexus.on.tabUpdated(({ tabId, url, title, favicon, canGoBack: back, canGoForward: fwd, bookmarked: bm, zoomFactor: zf, isPlayingAudio: audio }) => {
      setTabs(prev => prev.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            url: url !== undefined ? url : t.url,
            title: title !== undefined ? title : t.title,
            favicon: favicon !== undefined ? favicon : t.favicon,
            isPlayingAudio: audio !== undefined ? audio : t.isPlayingAudio,
          }
        }
        return t
      }))

      if (tabId === activeTabIdRef.current) {
        if (url !== undefined)  setCurrentUrl(url)
        if (back !== undefined) setCanGoBack(back)
        if (fwd !== undefined)  setCanGoForward(fwd)
        if (bm !== undefined)   setBookmarked(bm)
        if (zf !== undefined)   setZoomFactor(zf)
      }
    })

    const unbindAudio = nexus.media?.onAudioChanged?.(({ tabId, isPlayingAudio }) => {
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, isPlayingAudio } : t))
    })

    const unbindPrivacy = nexus.privacy.onEvent((ev) => {
      setPrivacyStats(prev => ({
        ...prev,
        trackersBlocked: (prev.trackersBlocked || 0) + 1,
      }))
    })

    const unbindRemoved = nexus.on.tabRemoved((tabId) => {
      const id = typeof tabId === 'string' ? parseInt(tabId, 10) : tabId
      setTabs(prev => prev.filter(t => t.id !== id && t.id !== tabId))
    })

    const unbindLoading = nexus.on.tabLoading(({ tabId, loading: l }) => {
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, loading: l } : t))
      if (tabId === activeTabIdRef.current) setLoading(l)
    })

    const unbindActive = nexus.on.activeTabChanged((tabId) => {
      setActiveTabId(tabId)
    })

    const unbindMode = nexus.on.modeChanged(setMode)

    const unbindHome = nexus.on.showHome(() => {
      setCurrentUrl('nexusweb://home')
      setBookmarked(false)
    })

    const unbindSplit = nexus.splitView.onChange(({ enabled, splitTabId: stId, splitRatio: sRatio }) => {
      setIsSplitView(enabled)
      if (stId !== undefined) setSplitTabId(stId)
      if (typeof sRatio === 'number') setSplitRatio(sRatio)
    })

    const unbindZoom = nexus.zoom.onChange(({ tabId, zoomFactor: zf }) => {
      if (tabId === activeTabIdRef.current) setZoomFactor(zf)
    })

    const unbindDownload = nexus.downloads.onUpdate((item) => {
      if (item.state === 'completed') {
        addToast(`Downloaded: ${item.filename}`, 'success')
      }
    })

    const unbindScreenshot = nexus.onScreenshotCaptured((res) => {
      if (res?.success) {
        addToast(`Screenshot saved to Desktop: ${res.filename}`, 'success')
      } else {
        addToast(`Screenshot failed: ${res?.error || 'Unknown error'}`, 'error')
      }
    })

    const unbindInitUrl = nexus.on.initialUrl?.(({ url, isPrivate }) => {
      if (url && url !== 'nexusweb://home') {
        handleNavigate(url)
      }
    })

    return () => {
      clearInterval(serverInterval)
      unbindCreated?.()
      unbindUpdated?.()
      unbindRemoved?.()
      unbindLoading?.()
      unbindAudio?.()
      unbindPrivacy?.()
      unbindActive?.()
      unbindMode?.()
      unbindHome?.()
      unbindSplit?.()
      unbindZoom?.()
      unbindDownload?.()
      unbindScreenshot?.()
      unbindInitUrl?.()
    }
  }, [applyTheme, addToast, handleNavigate])

  // ── Sync Active Tab URL ───────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTabId) return
    const active = tabs.find(t => t.id === activeTabId)
    if (active) {
      setCurrentUrl(active.url || 'nexusweb://home')
      if (active.url && active.url !== 'nexusweb://home') {
        nexus?.bookmarks.check(active.url).then(setBookmarked)
      } else {
        setBookmarked(false)
      }
    }
  }, [activeTabId, tabs])

  // ── Global Custom Context Menu (Right Click) ──────────────────────────────
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
      const sel = window.getSelection()?.toString() || ''
      const link = e.target.closest('a')?.href || currentUrl
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetUrl: link,
        selectedText: sel,
      })
    }
    window.addEventListener('contextmenu', handleContextMenu)
    return () => window.removeEventListener('contextmenu', handleContextMenu)
  }, [currentUrl])

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K — Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCommandPalette(v => !v)
      }
      // Ctrl+Shift+B — Toggle Bookmarks Bar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setShowBookmarksBar(v => !v)
      }
      // Ctrl+Shift+R — Toggle Reader Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        setShowReaderMode(v => !v)
      }
      // Ctrl+Shift+I — Request Inspector
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        togglePanel('inspector')
      }
      // Ctrl+T — new tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't' && !e.shiftKey) {
        e.preventDefault()
        handleNewTab()
      }
      // Ctrl+N — new window
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault()
        handleOpenNewWindow()
      }
      // Ctrl+Shift+N — new private window
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleCreatePrivateDen()
      }
      // Ctrl+Shift+T — reopen closed tab
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        handleReopenClosedTab()
      }
      // Ctrl+W — close tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault()
        if (activeTabIdRef.current) handleCloseTab(activeTabIdRef.current)
      }
      // Ctrl+L — focus address bar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l' && !e.shiftKey) {
        e.preventDefault()
        addressInputRef.current?.focus()
        addressInputRef.current?.select()
      }
      // Ctrl+Shift+P — Floating Video PiP
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        handleTriggerPiP()
      }
      // Ctrl+Shift+L — auto-detect servers
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        nexus?.scanPorts().then(servers => {
          setDetectedServers(servers || [])
          setDetectedServersCount(servers?.length || 0)
          addToast(`Detected ${servers?.length || 0} active server(s)`, 'info')
        })
      }
      // Ctrl+F — find in page
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setShowFindBar(v => !v)
      }
      // F9 or Ctrl+Shift+S — screenshot
      if (e.key === 'F9' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's')) {
        e.preventDefault()
        handleCaptureScreenshot()
      }
      // Ctrl+\ — toggle split view
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault()
        handleToggleSplitView()
      }
      // Ctrl+= / Ctrl++ — zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        handleZoomIn()
      }
      // Ctrl+- — zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
      // Ctrl+0 — zoom reset
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
      // Ctrl+` — toggle terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        setShowTerminal(v => !v)
      }
      // Ctrl+J — downloads panel
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        togglePanel('downloads')
      }
      // Ctrl+Shift+N — scratch pad / notes
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        togglePanel('notes')
      }
      // Ctrl+Shift+M — Media HUD Controller
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        togglePanel('media')
      }
      // Ctrl+B — bookmarks
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !e.shiftKey) {
        e.preventDefault()
        togglePanel('bookmarks')
      }
      // Ctrl+H — history
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        togglePanel('history')
      }
      // Ctrl+D — bookmark
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        handleToggleBookmark()
      }
      // F12 — DevTools
      if (e.key === 'F12') {
        e.preventDefault()
        nexus?.toggleDevTools()
      }
      // F1 — Help Center & Documentation
      if (e.key === 'F1') {
        e.preventDefault()
        togglePanel('help')
      }
      // Escape — close panel or find bar or command palette
      if (e.key === 'Escape') {
        if (showCommandPalette) setShowCommandPalette(false)
        else if (showReaderMode) setShowReaderMode(false)
        else if (showFindBar) setShowFindBar(false)
        else handleClosePanel()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    showFindBar,
    showCommandPalette,
    showReaderMode,
    handleNewTab,
    handleReopenClosedTab,
    handleCloseTab,
    handleTriggerPiP,
    handleCaptureScreenshot,
    handleToggleSplitView,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleToggleBookmark,
    handleClosePanel,
    togglePanel,
    addToast
  ])

  const leftTab = tabs.find(t => t.id === activeTabId)
  const rightTab = tabs.find(t => t.id === splitTabId)
  const isLeftHome = !currentUrl || currentUrl === 'nexusweb://home' || leftTab?.url === 'nexusweb://home'
  const isRightHome = rightTab?.url === 'nexusweb://home'
  const isAudioPlaying = !!leftTab?.isPlayingAudio

  // Sync Media HUD visibility with Electron BrowserView layout offset
  useEffect(() => {
    window.nexus?.setMediaHudOpen(isAudioPlaying || showMediaHUD)
  }, [isAudioPlaying, showMediaHUD])

  return (
    <div className={`browser-shell ${isPrivateDen ? 'private-den-shell' : ''}`} data-theme={theme} data-private-den={isPrivateDen ? 'true' : 'false'}>
      {/* Chrome Top Bar */}
      <div className="browser-chrome">
        <TitleBar
          mode={mode}
          isPrivateDen={isPrivateDen}
          currentTheme={theme}
          onToggleTheme={handleToggleTheme}
        />
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onNewTab={handleNewTab}
          onCloseTab={handleCloseTab}
          onSwitchTab={handleSwitchTab}
          onReorderTabs={handleReorderTabs}
          onToggleMuteTab={handleToggleMuteTab}
          isPrivateDen={isPrivateDen}
        />

        <AddressBar
          url={currentUrl}
          mode={mode}
          loading={loading}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          bookmarked={bookmarked}
          activePanel={activePanel}
          isSplitView={isSplitView}
          currentTheme={theme}
          detectedServersCount={detectedServersCount}
          addressInputRef={addressInputRef}
          privacyStats={privacyStats}
          isPrivateDen={isPrivateDen}
          onWipeAndExit={handleWipeAndExit}
          onNavigate={handleNavigate}
          onBack={() => nexus?.goBack()}
          onForward={() => nexus?.goForward()}
          onReload={() => nexus?.reload()}
          onToggleTerminal={() => setShowTerminal(v => !v)}
          onToggleDevTools={() => nexus?.toggleDevTools()}
          showTerminal={showTerminal}
          onModeChange={handleModeChange}
          onToggleBookmark={handleToggleBookmark}
          onTogglePanel={togglePanel}
          onToggleFind={() => setShowFindBar(v => !v)}
          onCaptureScreenshot={handleCaptureScreenshot}
          onCreatePrivateDen={handleCreatePrivateDen}
          onTriggerPiP={handleTriggerPiP}
          onToggleReaderMode={() => setShowReaderMode(v => !v)}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onToggleSplitView={handleToggleSplitView}
          onAutoDetectScan={(servers) => {
            setDetectedServers(servers || [])
            setDetectedServersCount(servers?.length || 0)
          }}
          onToggleTheme={handleToggleTheme}
          onToggleMediaHUD={() => setShowMediaHUD(v => !v)}
          showMediaHUD={showMediaHUD}
          isAudioPlaying={isAudioPlaying}
          activeTabId={activeTabId}
        />

        {/* Collapsible Bookmarks Strip (Screenshot 1) */}
        {showBookmarksBar && !isPrivateDen && (
          <BookmarksBar
            onNavigate={handleNavigate}
            onOpenNewTab={handleNewTab}
            onOpenBookmarksPanel={() => togglePanel('bookmarks')}
          />
        )}

        {/* Dual-Pane Split View Controller Bar */}
        {isSplitView && (
          <SplitBar
            tabs={tabs}
            activeTabId={activeTabId}
            splitTabId={splitTabId}
            onSelectSplitTab={handleSelectSplitTab}
            onNavigateSplitTab={handleNavigateSplitTab}
            onSwapPanes={handleSwapPanes}
            onCloseSplitView={handleToggleSplitView}
            detectedServers={detectedServers}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="browser-content" style={{ position: 'relative' }}>
        {showFindBar && (
          <FindBar onClose={() => setShowFindBar(false)} />
        )}

        {/* Distraction-Free Reader Mode Overlay */}
        {showReaderMode && (
          <ReaderMode
            activeTabId={activeTabId}
            onClose={() => setShowReaderMode(false)}
          />
        )}

        {/* Single View Home Dashboard / Private Den Start Page */}
        {!isSplitView && isLeftHome && !showReaderMode && (
          isPrivateDen ? (
            <PrivateDenStartPage
              onNavigate={handleNavigate}
              onWipeAndExit={handleWipeAndExit}
            />
          ) : (
            <HomePage
              mode={mode}
              onPortClick={handlePortClick}
              onModeChange={handleModeChange}
              onNewTab={handleNewTab}
              onOpenSettings={() => {
                setSettingsSection('privacy')
                togglePanel('settings')
              }}
              onOpenPanel={togglePanel}
            />
          )
        )}

        {/* Split View: Left Pane Home Dashboard */}
        {isSplitView && isLeftHome && !showReaderMode && (
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: `${Math.round(splitRatio * 100)}%`, height: '100%',
            overflowY: 'auto',
            borderRight: '1px solid var(--border-subtle)',
          }}>
            <HomePage
              mode={mode}
              onPortClick={handlePortClick}
              onModeChange={handleModeChange}
              onNewTab={handleNewTab}
              onOpenSettings={() => {
                setSettingsSection('privacy')
                togglePanel('settings')
              }}
              onOpenPanel={togglePanel}
            />
          </div>
        )}

        {/* Split View: Right Pane Home Dashboard */}
        {isSplitView && isRightHome && !showReaderMode && (
          <div style={{
            position: 'absolute', right: 0, top: 0,
            width: `${Math.round((1 - splitRatio) * 100)}%`, height: '100%',
            overflowY: 'auto',
            borderLeft: '1px solid var(--border-subtle)',
          }}>
            <HomePage
              mode={mode}
              onPortClick={(url) => handleNavigateSplitTab(splitTabId, url)}
              onModeChange={handleModeChange}
              onNewTab={handleNewTab}
              onOpenSettings={() => {
                setSettingsSection('privacy')
                togglePanel('settings')
              }}
              onOpenPanel={togglePanel}
            />
          </div>
        )}

        {/* Vertical Resize Bar for Split View (Apps) */}
        {isSplitView && !showReaderMode && (
          <SplitResizeBar
            splitRatio={splitRatio}
            onRatioChange={handleSplitRatioChange}
            topOffset={0}
            bottomOffset={0}
            drawerWidth={activePanel ? (activePanel === 'menu' ? 260 : 380) : 0}
          />
        )}

        {/* Side Drawers */}
        {activePanel === 'bookmarks' && (
          <BookmarksPanel
            onClose={handleClosePanel}
            onNavigate={handlePortClick}
          />
        )}
        {activePanel === 'history' && (
          <HistoryPanel
            onClose={handleClosePanel}
            onNavigate={handlePortClick}
          />
        )}
        {activePanel === 'ports' && (
          <PortManager
            onClose={handleClosePanel}
            onNavigate={handlePortClick}
            onToast={addToast}
          />
        )}
        {activePanel === 'inspector' && (
          <RequestInspector
            activeTabId={activeTabId}
            onClose={handleClosePanel}
          />
        )}
        {activePanel === 'env' && (
          <EnvPanel
            onClose={handleClosePanel}
            onToast={addToast}
          />
        )}
        {activePanel === 'downloads' && (
          <DownloadPanel
            onClose={handleClosePanel}
            onToast={addToast}
          />
        )}
        {activePanel === 'notes' && (
          <ScratchPad
            onClose={handleClosePanel}
            currentUrl={currentUrl}
            onToast={addToast}
          />
        )}
        {activePanel === 'settings' && (
          <SettingsPanel
            onClose={handleClosePanel}
            initialSection={settingsSection}
            onModeChange={handleModeChange}
            currentMode={mode}
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            onOpenPanel={togglePanel}
            onToast={addToast}
          />
        )}
        {activePanel === 'help' && (
          <HelpPanel
            onClose={handleClosePanel}
            onOpenSettings={() => {
              setSettingsSection('privacy')
              togglePanel('settings')
            }}
            onOpenAbout={() => togglePanel('about')}
          />
        )}
        {activePanel === 'shortcuts' && (
          <HelpPanel
            onClose={handleClosePanel}
            onOpenSettings={() => {
              setSettingsSection('privacy')
              togglePanel('settings')
            }}
            onOpenAbout={() => togglePanel('about')}
          />
        )}
        {activePanel === 'about' && (
          <AboutPanel
            onClose={handleClosePanel}
            onOpenShortcuts={() => togglePanel('help')}
            onOpenSettings={() => {
              setSettingsSection('about')
              togglePanel('settings')
            }}
          />
        )}
        {activePanel === 'menu' && (
          <MenuDrawer
            onClose={handleClosePanel}
            onNewTab={handleNewTab}
            onOpenNewWindow={handleOpenNewWindow}
            onCreatePrivateDen={handleCreatePrivateDen}
            onOpenPanel={togglePanel}
            onOpenCommandPalette={() => {
              handleClosePanel()
              setShowCommandPalette(true)
            }}
            onToggleReaderMode={() => {
              handleClosePanel()
              handleToggleReaderMode()
            }}
            onTriggerPiP={() => {
              handleClosePanel()
              handleTriggerPiP()
            }}
            onToggleTerminal={() => {
              handleClosePanel()
              setShowTerminal(v => !v)
            }}
            onToggleSplitView={() => {
              handleClosePanel()
              handleToggleSplitView()
            }}
            onToggleDevTools={() => {
              handleClosePanel()
              nexus?.toggleDevTools(activeTabId)
            }}
            onToggleFind={() => {
              handleClosePanel()
              setShowFindBar(v => !v)
            }}
            onCaptureScreenshot={() => {
              handleClosePanel()
              handleCaptureScreenshot()
            }}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={(section) => {
              setSettingsSection(section || 'privacy')
              togglePanel('settings')
            }}
            zoomFactor={zoomFactor}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onToggleBookmarksBar={() => setShowBookmarksBar(v => !v)}
            mode={mode}
          />
        )}
        {activePanel === 'media' && (
          <MediaPanel
            activeTabId={activeTabId}
            tabs={tabs}
            onSwitchTab={handleSwitchTab}
            onToggleMuteTab={handleToggleMuteTab}
            onTriggerPiP={handleTriggerPiP}
            isAudioPlaying={isAudioPlaying}
            onClose={handleClosePanel}
          />
        )}
        {activePanel === 'api-workbench' && (
          <ApiWorkbench onClose={handleClosePanel} />
        )}
        {activePanel === 'extensions' && (
          <ExtensionsPanel onClose={handleClosePanel} />
        )}
        <ErrorBoundary>
          {activePanel === 'quick-tools' && (
            <QuickToolsDrawer
              onClose={handleClosePanel}
              onOpenPanel={togglePanel}
              onToggleReaderMode={handleToggleReaderMode}
              onTriggerPiP={handleTriggerPiP}
              onToggleSplitView={handleToggleSplitView}
              onToggleDevTools={() => nexus?.toggleDevTools(activeTabId)}
              onToggleTerminal={() => setShowTerminal(v => !v)}
              showTerminal={showTerminal}
              detectedServersCount={detectedServersCount}
              isSplitView={isSplitView}
              isAudioPlaying={isAudioPlaying}
              privacyStats={privacyStats}
              mode={mode}
              onToast={addToast}
              isPrivateDen={isPrivateDen}
              onWipeAndExit={handleWipeAndExit}
            />
          )}
          {activePanel === 'theme' && (
            <ThemeCustomizer
              currentTheme={theme}
              onThemeChange={handleThemeChange}
              onClose={handleClosePanel}
            />
          )}
        </ErrorBoundary>

        {/* Multi-Terminal Panel */}
        {showTerminal && (
          <Terminal
            minimized={terminalMinimized}
            onMinimize={() => setTerminalMinimized(v => !v)}
            onClose={() => setShowTerminal(false)}
          />
        )}
      </div>

      {/* Status Bar */}
      <StatusBar
        mode={mode}
        url={currentUrl}
        loading={loading}
        detectedServersCount={detectedServersCount}
        zoomFactor={zoomFactor}
        isSplitView={isSplitView}
        privacyStats={privacyStats}
        isAudioPlaying={isAudioPlaying}
        onToggleMediaHUD={() => togglePanel('media')}
        onShortcutsHelp={() => togglePanel('shortcuts')}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onOpenPorts={() => togglePanel('ports')}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleNavigate}
        onModeChange={handleModeChange}
        onToggleTheme={handleToggleTheme}
        onToggleSplitView={handleToggleSplitView}
        onOpenPanel={togglePanel}
        onNewTab={handleNewTab}
        onTriggerPiP={handleTriggerPiP}
        onToggleTerminal={() => setShowTerminal(v => !v)}
        onCaptureScreenshot={handleCaptureScreenshot}
        currentMode={mode}
        currentTheme={theme}
        tabs={tabs}
        onSwitchTab={handleSwitchTab}
        onToggleMediaHUD={() => togglePanel('media')}
      />

      {/* Global Custom Right Click Menu (Screenshot) */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetUrl={contextMenu.targetUrl}
          selectedText={contextMenu.selectedText}
          onClose={() => setContextMenu(null)}
          onNewTab={handleNewTab}
          onOpenNewWindow={handleOpenNewWindow}
          onCreatePrivateDen={handleCreatePrivateDen}
          onOpenContainerTab={(container, url) => {
            handleNewTab(url)
