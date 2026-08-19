const { app, BrowserWindow, BrowserView, ipcMain, session, dialog, shell, globalShortcut, Menu, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')
const { setupNetworkFilter } = require('./networkFilter')
const { isTrackerOrAd, privacyStats, getTabStats, resetTabStats, FINGERPRINT_SHIELD_SCRIPT } = require('./privacyFilter')
const { getTabLogs, clearTabLogs } = require('./requestInspector')
const { findEnvFiles, readEnvFile } = require('./envReader')
const { PIP_INJECTOR_SCRIPT, READER_MODE_EXTRACTOR_SCRIPT, MEDIA_HUD_CONTROL_SCRIPT } = require('./mediaInjector')
const { initTray, destroyTray } = require('./trayManager')
const { scanLocalPorts, getDetailedPortList, killProcess } = require('./portScanner')
const { createTerminal, writeToTerminal, resizeTerminal, destroyTerminal, destroyAllTerminals } = require('./terminalManager')
const { initDownloadManager, getDownloadsList, openDownloadedFile, showInFolder, clearCompletedDownloads } = require('./downloadManager')
const {
  SEARCH_ENGINES,
  getBookmarks, addBookmark, removeBookmark, isBookmarked,
  getHistory, addHistory, clearHistory, deleteHistoryItem,
  getSettings, updateSettings,
  getNotes, saveNotes, getNoteForUrl, saveNoteForUrl,
  getExtensions, saveExtensions,
  saveSession, getSession,
} = require('./storage')
const ChromeExtensionManager = require('./chromeExtensionManager')

const isDev = process.env.NODE_ENV === 'development' && !app.isPackaged
let chromeExtensionManager = null

const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
app.userAgentFallback = CHROME_USER_AGENT

// Enable GPU hardware acceleration, zero-copy video decoding, and smooth rendering
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('enable-zero-copy')
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,CanvasOopRasterization')

let mainWindow = null
const settings = getSettings()
let currentMode = settings.defaultMode || 'normal'
const tabs = new Map()
let activeTabId = null
let splitTabId = null // Right pane tab ID if split view is enabled
let isSplitView = false
let tabCounter = 0
const closedTabsStack = [] // Max 10 items for Ctrl+Shift+T

const http = require('http')

// Start internal Proxy Bridge Server for Chrome VPN & Proxy Extensions
let proxyBridgeServer = null
function startProxyBridgeServer() {
  if (proxyBridgeServer) return
  proxyBridgeServer = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/set-proxy') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', async () => {
        try {
          const val = JSON.parse(body)
          if (val.mode === 'pac_script' && val.pacScript && val.pacScript.data) {
            const pacPath = path.join(app.getPath('userData'), 'nexus_active_proxy.pac')
            fs.writeFileSync(pacPath, val.pacScript.data, 'utf8')
            const pacFileUrl = `file:///${pacPath.replace(/\\/g, '/')}`
            await session.defaultSession.setProxy({
              pacScript: pacFileUrl
            })
            console.log('[NeXusWeb Proxy Bridge] Applied Extension PAC proxy successfully from file:', pacFileUrl)
          } else if (val.mode === 'fixed_servers' && val.rules) {
            await session.defaultSession.setProxy(val.rules)
            console.log('[NeXusWeb Proxy Bridge] Applied Fixed Proxy rules:', val.rules)
          } else if (val.mode === 'direct' || val.mode === 'system') {
            await session.defaultSession.setProxy({ mode: 'direct' })
            console.log('[NeXusWeb Proxy Bridge] Reset to direct proxy.')
          }
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
          res.end(JSON.stringify({ success: true }))
        } catch (e) {
          console.error('[NeXusWeb Proxy Bridge Error]', e.message)
          res.writeHead(500)
          res.end(e.message)
        }
      })
    } else {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' })
      res.end('OK')
    }
  })

  proxyBridgeServer.listen(49152, '127.0.0.1', () => {
    console.log('[NeXusWeb Proxy Bridge] Active on http://127.0.0.1:49152')
  })
}

// Ignore self-signed certificates on localhost/127.0.0.1 for local dev servers
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  try {
    const u = new URL(url)
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '::1') {
      event.preventDefault()
      callback(true)
      return
    }
  } catch (e) {}
  callback(false)
})

// ─── Window Creation ──────────────────────────────────────────────────────────
function createWindow() {
  const iconPath = path.join(__dirname, '../src/assets/icon.png')

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 620,
    frame: false,
    backgroundColor: '#0a0d14',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
  })

  Menu.setApplicationMenu(null)

  initDownloadManager(session.defaultSession, () => mainWindow)
  startProxyBridgeServer()

  if (!chromeExtensionManager) {
    chromeExtensionManager = new ChromeExtensionManager(app.getPath('userData'))
    chromeExtensionManager.init(session.defaultSession).catch(err => {
      console.warn('[NeXusWeb] Error initializing Chrome extensions:', err.message)
    })
  }

  const loadDist = () => {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(err => {
      console.error('[NeXusWeb] Failed to load dist/index.html:', err)
    })
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      loadDist()
    })
  } else {
    loadDist()
  }

  mainWindow.webContents.on('console-message', (e, level, message, line, sourceId) => {
    console.log(`[Renderer Console ${level}] ${message} (${sourceId}:${line})`)
  })

  mainWindow.webContents.on('did-fail-load', (e, code, desc, url) => {
    console.error(`[NeXusWeb] MainWindow failed load: ${url} (${code}: ${desc})`)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    destroyAllTerminals()
    tabs.forEach((_, id) => removeTab(id))
  })

  mainWindow.on('resize', () => repositionAllViews())
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-state-change', 'maximized')
    repositionAllViews()
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-state-change', 'normal')
    repositionAllViews()
  })

  // Setup initial network filter with privacy notifications
  setupNetworkFilter(session.defaultSession, currentMode, (privacyEvent) => {
    mainWindow?.webContents.send('privacy-event', privacyEvent)
  }, () => activeTabId)
}

function getErrorPageHtml(url, errorCode, errorDesc) {
  const safeUrl = String(url).replace(/"/g, '&quot;')
  const isLocalhostUrl = url.includes('localhost') || url.includes('127.0.0.1')
  
  return `data:text/html;charset=utf-8,` + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Connection Failed · NeXusWeb</title>
      <style>
        :root {
          --bg: #0a0d14;
          --card-bg: #0f1320;
          --text: #e8eaf2;
          --muted: #8892aa;
          --accent: #00d4ff;
          --border: #1e2640;
          --amber: #f59e0b;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --bg: #f1f5f9;
            --card-bg: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --accent: #0284c7;
            --border: #cbd5e1;
            --amber: #d97706;
          }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 24px;
        }
        .card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 36px 32px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
        }
        .icon { font-size: 44px; margin-bottom: 12px; }
        h1 { font-size: 19px; font-weight: 600; margin-bottom: 8px; color: var(--accent); }
        p { font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.5; }
        .url-box {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          font-family: 'Consolas', monospace;
          font-size: 12px;
          color: var(--amber);
          word-break: break-all;
          margin-bottom: 18px;
        }
        .hint {
          background: rgba(0, 212, 255, 0.08);
          border-left: 3px solid var(--accent);
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 12px;
          text-align: left;
          margin-bottom: 20px;
          color: var(--text);
        }
        .actions { display: flex; gap: 10px; justify-content: center; }
        button {
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-retry {
          background: var(--accent);
          color: #0a0d14;
          border: none;
        }
        .btn-retry:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-home {
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
        }
        .btn-home:hover { background: var(--border); }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${isLocalhostUrl ? '🔌' : '🌐'}</div>
        <h1>${isLocalhostUrl ? 'Server Not Responding' : 'Unable to Connect'}</h1>
        <p>${isLocalhostUrl ? 'The local development server is not running or listening on this port.' : 'Could not reach the requested address (' + (errorDesc || 'Error ' + errorCode) + ').'}</p>
        <div class="url-box">${safeUrl}</div>
        ${isLocalhostUrl ? '<div class="hint">💡 <strong>Dev Hint:</strong> Start your server with <code>npm run dev</code> or <code>python app.py</code> in the terminal, then click Retry.</div>' : ''}
        <div class="actions">
          <button class="btn-retry" onclick="window.location.href='${safeUrl}'">↻ Retry Connection</button>
        </div>
      </div>
    </body>
    </html>
  `)
}

// ─── BrowserView Tab Management ───────────────────────────────────────────────
function getDefaultUrlForMode(mode) {
  if (mode === 'normal') {
    const currentSettings = getSettings()
    const engine = currentSettings.searchEngine || { homeUrl: 'https://duckduckgo.com', url: 'https://duckduckgo.com/?q={query}' }
    return engine.homeUrl || (engine.url ? engine.url.split('?')[0] : 'https://duckduckgo.com')
  }
  return 'nexusweb://home'
}

function createTab(url, isPrivate = false) {
  const targetUrl = url || getDefaultUrlForMode(currentMode)
  const tabId = ++tabCounter
  const initialTitle = targetUrl === 'nexusweb://home' ? 'Home' : (isPrivate ? 'Private Den' : 'New Tab')
  
  const partition = isPrivate ? `private-den-${Date.now()}` : undefined
  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      partition,
      webSecurity: currentMode !== 'dev',
      devTools: true,
    },
  })

  try {
    view.setAutoResize({ width: true, height: true })
  } catch (e) {}

  const tab = {
    id: tabId,
    view,
    url: targetUrl,
    title: initialTitle,
    favicon: null,
    zoomFactor: 1.0,
    isPlayingAudio: false,
    hasMedia: false,
    isPrivate: !!isPrivate,
  }
  tabs.set(tabId, tab)

  // Right-Click Context Menu: Inspect Element & DevTools
  view.webContents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      { label: 'Back', enabled: view.webContents.canGoBack(), click: () => view.webContents.goBack() },
      { label: 'Forward', enabled: view.webContents.canGoForward(), click: () => view.webContents.goForward() },
      { label: 'Reload', click: () => view.webContents.reload() },
      { type: 'separator' },
      { label: 'Inspect Element', click: () => view.webContents.inspectElement(params.x, params.y) },
      { label: 'Developer Tools (F12)', click: () => view.webContents.toggleDevTools() },
    ])
    menu.popup({ window: mainWindow })
  })

  // Keyboard zoom handler inside webContents (Ctrl + / Ctrl - / Ctrl 0)
  view.webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (input.type === 'keyDown') {
        if (input.key === '=' || input.key === '+') {
          event.preventDefault()
          setZoom(tabId, Math.min(3.0, (tab.zoomFactor || 1.0) + 0.1))
        } else if (input.key === '-') {
          event.preventDefault()
          setZoom(tabId, Math.max(0.3, (tab.zoomFactor || 1.0) - 0.1))
        } else if (input.key === '0') {
          event.preventDefault()
          setZoom(tabId, 1.0)
        }
      }
    }
  })

  // Injected Ctrl + MouseWheel smooth dynamic zooming
  view.webContents.on('dom-ready', () => {
    const currentSettings = getSettings()
    if (currentSettings.enableCtrlWheelZoom !== false) {
      view.webContents.executeJavaScript(`
        if (!window.__nexus_wheel_zoom_attached) {
          window.__nexus_wheel_zoom_attached = true;
          window.addEventListener('wheel', function(e) {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const dir = e.deltaY < 0 ? 'in' : 'out';
              window.postMessage({ type: 'nexus-zoom-wheel', dir: dir }, '*');
            }
          }, { passive: false });
        }
      `).catch(() => {})
    }
  })

  // Open target="_blank" in a new tab
  view.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    createTab(targetUrl, tab.isPrivate)
    return { action: 'deny' }
  })

  // Find in page result callback
  view.webContents.on('found-in-page', (event, result) => {
    mainWindow?.webContents.send('find-result', {
      tabId,
      activeMatchOrdinal: result.activeMatchOrdinal,
      matches: result.matches,
      selectionArea: result.selectionArea,
      finalUpdate: result.finalUpdate,
    })
  })

  // Audio Playback Tracking — only triggers when actual sound is audible
  view.webContents.on('audio-state-changed', (event, audible) => {
    const t = tabs.get(tabId)
    if (t && t.isPlayingAudio !== audible) {
      t.isPlayingAudio = audible
      mainWindow?.webContents.send('tab-audio-changed', { tabId, isPlayingAudio: audible })
    }
  })

  view.webContents.on('did-navigate', (e, navUrl) => {
    if (navUrl.startsWith('data:text/html')) return
    const tab = tabs.get(tabId)
    if (tab) {
      tab.url = navUrl
      mainWindow?.webContents.send('tab-updated', {
        tabId, url: navUrl, title: tab.title,
        bookmarked: isBookmarked(navUrl),
      })
    }
  })

  view.webContents.on('did-navigate-in-page', (e, navUrl) => {
    if (navUrl.startsWith('data:text/html')) return
    const tab = tabs.get(tabId)
    if (tab) {
      tab.url = navUrl
      mainWindow?.webContents.send('tab-updated', {
        tabId, url: navUrl, title: tab.title,
        bookmarked: isBookmarked(navUrl),
      })
    }
  })

  view.webContents.on('page-title-updated', (e, title) => {
    const tab = tabs.get(tabId)
    if (tab && !tab.url.startsWith('data:text/html')) {
      tab.title = title
      mainWindow?.webContents.send('tab-updated', { tabId, url: tab.url, title })
    }
  })

  view.webContents.on('page-favicon-updated', (e, favicons) => {
    const tab = tabs.get(tabId)
    if (tab && favicons.length > 0) {
      tab.favicon = favicons[0]
      mainWindow?.webContents.send('tab-updated', { tabId, url: tab.url, title: tab.title, favicon: favicons[0] })
    }
  })

  view.webContents.on('did-start-loading', () => {
    mainWindow?.webContents.send('tab-loading', { tabId, loading: true })
  })

  view.webContents.on('did-stop-loading', () => {
    mainWindow?.webContents.send('tab-loading', { tabId, loading: false })
    const tab = tabs.get(tabId)
    if (tab && tab.url !== 'nexusweb://home' && !tab.url.startsWith('data:text/html')) {
      const navUrl = view.webContents.getURL()
      if (navUrl && !navUrl.startsWith('devtools://') && !navUrl.startsWith('data:')) {
        tab.url = navUrl
        addHistory({ url: navUrl, title: tab.title, favicon: tab.favicon })
        mainWindow?.webContents.send('tab-updated', {
          tabId,
          url: navUrl,
          canGoBack: view.webContents.canGoBack(),
          canGoForward: view.webContents.canGoForward(),
          bookmarked: isBookmarked(navUrl),
        })

        // In Normal mode, inject DuckDuckGo-style anti-fingerprinting & media detection
        if (currentMode === 'normal') {
          view.webContents.executeJavaScript(FINGERPRINT_SHIELD_SCRIPT).catch(() => {})
        }
      }
    }
  })

  view.webContents.on('did-fail-load', (e, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return // Aborted (e.g. redirected)
    console.log(`[NeXusWeb] Page load failed: ${validatedURL} (${errorCode}: ${errorDescription})`)
    const tab = tabs.get(tabId)
    if (tab && validatedURL && !validatedURL.startsWith('devtools://') && !validatedURL.startsWith('data:')) {
      view.webContents.loadURL(getErrorPageHtml(validatedURL, errorCode, errorDescription)).catch(() => {})
    }
  })

  setActiveTab(tabId)
  if (targetUrl && targetUrl !== 'nexusweb://home') {
    navigateTab(tabId, targetUrl)
  }

  // Notify renderer that a new tab was created
  mainWindow?.webContents.send('tab-created', {
    tabId,
    url: tab.url,
    title: tab.title,
  })

  return tabId
}

function setActiveTab(tabId) {
  const id = typeof tabId === 'string' ? parseInt(tabId, 10) : tabId
  if (!mainWindow || !id) return
  tabs.forEach(({ view }) => {
    try { mainWindow.removeBrowserView(view) } catch (e) {}
  })

  activeTabId = id
  repositionAllViews()

  const tab = tabs.get(id)
  if (tab) {
    if (tab.url && tab.url !== 'nexusweb://home') {
      mainWindow.webContents.send('tab-updated', {
        tabId: id,
        url: tab.url,
        title: tab.title,
        favicon: tab.favicon,
        canGoBack: tab.view.webContents.canGoBack(),
        canGoForward: tab.view.webContents.canGoForward(),
        bookmarked: isBookmarked(tab.url),
        zoomFactor: tab.zoomFactor || 1.0,
        isPlayingAudio: !!tab.isPlayingAudio,
      })
    } else {
      mainWindow.webContents.send('show-home', id)
    }
    mainWindow.webContents.send('active-tab-changed', id)
  }
}

function setSplitTab(tabId) {
  const id = typeof tabId === 'string' ? parseInt(tabId, 10) : tabId
  if (tabs.has(id)) {
    splitTabId = id
    repositionAllViews()
    mainWindow?.webContents.send('split-view-changed', { enabled: isSplitView, splitTabId })
  }
}

function toggleSplitView(enabled) {
  isSplitView = enabled !== undefined ? enabled : !isSplitView
  if (isSplitView) {
    const validIds = [...tabs.keys()].filter(id => typeof id === 'number')
    if (!splitTabId || splitTabId === activeTabId || !tabs.has(splitTabId)) {
      const otherTabId = validIds.find(id => id !== activeTabId)
      if (otherTabId) {
        splitTabId = otherTabId
      } else {
        splitTabId = createTab('nexusweb://home')
        mainWindow?.webContents.send('tab-created', { tabId: splitTabId, url: 'nexusweb://home', title: 'Home' })
      }
    }
  } else {
    splitTabId = null
  }
  repositionAllViews()
  mainWindow?.webContents.send('split-view-changed', { enabled: isSplitView, splitTabId })
  return isSplitView
}

function removeTab(tabId) {
  const id = typeof tabId === 'string' ? parseInt(tabId, 10) : tabId
  const tab = tabs.get(id) || tabs.get(tabId)
  if (!tab) return

  // Save to closed tabs stack for Ctrl+Shift+T
  if (tab.url && tab.url !== 'nexusweb://home' && !tab.url.startsWith('data:')) {
    closedTabsStack.unshift({ url: tab.url, title: tab.title })
    if (closedTabsStack.length > 10) closedTabsStack.pop()
  }

  if (mainWindow) {
    try { mainWindow.removeBrowserView(tab.view) } catch (e) {}
  }
  try { tab.view.webContents.destroy() } catch (e) {}
  tabs.delete(id)
  tabs.delete(tabId)
  mainWindow?.webContents.send('tab-removed', id)

  if (splitTabId === id || splitTabId === tabId) {
    splitTabId = null
    isSplitView = false
    mainWindow?.webContents.send('split-view-changed', { enabled: false, splitTabId: null })
  }

  if (activeTabId === id || activeTabId === tabId) {
    const remaining = [...tabs.keys()].filter(k => typeof k === 'number')
    if (remaining.length > 0) setActiveTab(remaining[remaining.length - 1])
    else createTab()
  } else {
    repositionAllViews()
  }
}

function reopenLastClosedTab() {
  if (closedTabsStack.length === 0) return null
  const last = closedTabsStack.shift()
  if (last && last.url) {
    const newId = createTab(last.url)
    return newId
  }
  return null
}

function resolveUrl(input) {
  const str = (input || '').trim()
  if (!str) return getDefaultUrlForMode(currentMode)
  if (str === 'nexusweb://home') {
    if (currentMode === 'normal') return getDefaultUrlForMode('normal')
    return str
  }
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('file://') || str.startsWith('devtools://') || str.startsWith('chrome-extension://')) {
    return str
  }
  if (/^\d{1,5}$/.test(str)) {
    return `http://localhost:${str}`
  }
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/.*)?$/i.test(str)) {
    return `http://${str}`
  }
  if (/^(192\.168\.|10\.|172\.)/.test(str)) {
    return `http://${str}`
  }
  // Check if it's a domain name (like github.com, google.com, api.site.io/endpoint)
  if (/^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(str)) {
    return `https://${str}`
  }
  
  // Otherwise treat as search query using the configured search engine!
  const currentSettings = getSettings()
  const engine = currentSettings.searchEngine || { url: 'https://duckduckgo.com/?q={query}' }
  const searchUrlTemplate = engine.url || 'https://duckduckgo.com/?q={query}'
  return searchUrlTemplate.replace('{query}', encodeURIComponent(str))
}

function navigateTab(tabId, url) {
  const id = typeof tabId === 'string' ? parseInt(tabId, 10) : (tabId || activeTabId)
  const tab = tabs.get(id)
  if (!tab || !mainWindow) return

  const targetUrl = url || getDefaultUrlForMode(currentMode)

  if (targetUrl === 'nexusweb://home') {
    if (currentMode === 'normal') {
      const searchHome = getDefaultUrlForMode('normal')
      tab.url = searchHome
      repositionAllViews()
      tab.view.webContents.loadURL(searchHome).catch(() => {})
      return
    }
    tab.url = 'nexusweb://home'
    tab.title = 'Home'
    repositionAllViews()
    mainWindow.webContents.send('show-home', id)
    mainWindow.webContents.send('tab-updated', { tabId: id, url: 'nexusweb://home', title: 'Home', favicon: null })
    return
  }

  const finalUrl = resolveUrl(targetUrl)
  tab.url = finalUrl
  repositionAllViews()

  tab.view.webContents.loadURL(finalUrl).catch(err => {
    console.error(`[NeXusWeb] loadURL error on ${finalUrl}:`, err.message)
    mainWindow.webContents.send('navigation-error', { tabId: id, error: err.message, url: finalUrl })
  })
}

let isMenuOpen = false
let activeDrawer = null
let isMediaHudOpen = false
let isReaderModeOpen = false
let isTerminalOpen = false
let isTerminalMinimized = false

function repositionAllViews() {
  if (!mainWindow) return
  const bounds = mainWindow.getContentBounds()
  const HUD_OFFSET = isMediaHudOpen ? 42 : 0
  const TOP_OFFSET = (isSplitView ? 156 : 122) + HUD_OFFSET
  
  // Terminal bottom offset: 280px when open, 32px when minimized, 0 when closed
  const TERMINAL_OFFSET = isTerminalOpen ? (isTerminalMinimized ? 32 : 280) : 0
  const BOTTOM_OFFSET = 28 + TERMINAL_OFFSET
  const contentHeight = Math.max(0, bounds.height - TOP_OFFSET - BOTTOM_OFFSET)
  const DRAWER_WIDTH = activeDrawer ? 360 : 0
  const availableWidth = Math.max(0, bounds.width - DRAWER_WIDTH)

  // Clear all views first and attach active view with drawer offset
  tabs.forEach(({ view }) => {
    try { mainWindow.removeBrowserView(view) } catch (e) {}
  })

  // If Reader Mode is active, do NOT attach BrowserView so Reader View is 100% full-screen & visible!
  if (isReaderModeOpen) {
    return
  }

  if (!isSplitView) {
    // Single View
    const mainTab = tabs.get(activeTabId)
    if (mainTab && mainTab.url && mainTab.url !== 'nexusweb://home') {
      try {
        mainWindow.addBrowserView(mainTab.view)
        mainTab.view.setBounds({
          x: 0,
          y: TOP_OFFSET,
          width: availableWidth,
          height: contentHeight,
        })
      } catch (e) {}
    }
  } else {
    // Split View: 50% left, 50% right
    const halfWidth = Math.floor(availableWidth / 2)

    const leftTab = tabs.get(activeTabId)
    if (leftTab && leftTab.url && leftTab.url !== 'nexusweb://home') {
      try {
        mainWindow.addBrowserView(leftTab.view)
        leftTab.view.setBounds({
          x: 0,
          y: TOP_OFFSET,
          width: halfWidth - 1,
          height: contentHeight,
        })
      } catch (e) {}
    }

    const rightTab = tabs.get(splitTabId)
    if (rightTab && rightTab.url && rightTab.url !== 'nexusweb://home') {
      try {
        mainWindow.addBrowserView(rightTab.view)
        rightTab.view.setBounds({
          x: halfWidth + 1,
          y: TOP_OFFSET,
          width: availableWidth - halfWidth - 1,
          height: contentHeight,
        })
      } catch (e) {}
    }
  }
}

// ─── Find in Page ─────────────────────────────────────────────────────────────
function findInPage(text, forward = true, findNext = false) {
  const tab = tabs.get(activeTabId)
  if (tab && tab.view && text) {
    return tab.view.webContents.findInPage(text, { forward, findNext })
  }
  return null
}

function stopFindInPage(action = 'clearSelection') {
  const tab = tabs.get(activeTabId)
  if (tab && tab.view) {
    tab.view.webContents.stopFindInPage(action)
  }
}

// ─── Screenshot Capture ───────────────────────────────────────────────────────
async function captureCurrentPage() {
  try {
    const tab = tabs.get(activeTabId)
    let img = null

    if (tab && tab.view && tab.url && tab.url !== 'nexusweb://home') {
      try {
        img = await tab.view.webContents.capturePage()
      } catch (e) {}
    }

    if (!img || img.isEmpty()) {
      img = await mainWindow.capturePage()
    }

    if (!img || img.isEmpty()) {
      return { success: false, error: 'Screenshot capture returned empty buffer' }
    }

    return saveScreenshot(img)
  } catch (err) {
    console.error('[NeXusWeb] captureCurrentPage error:', err)
    return { success: false, error: err.message }
  }
}

function saveScreenshot(nativeImg) {
  try {
    const desktopPath = app.getPath('desktop')
    const filename = `nexusweb_screenshot_${Date.now()}.png`
    const filePath = path.join(desktopPath, filename)
    const pngBuffer = nativeImg.toPNG()
    if (!pngBuffer || pngBuffer.length === 0) {
      return { success: false, error: 'PNG buffer is empty' }
    }
    fs.writeFileSync(filePath, pngBuffer)
    console.log(`[NeXusWeb] Screenshot saved: ${filePath} (${pngBuffer.length} bytes)`)
    return { success: true, filePath, filename }
  } catch (err) {
    console.error('[NeXusWeb] saveScreenshot error:', err)
    return { success: false, error: err.message }
  }
}

// ─── Picture-in-Picture & Media Controls ──────────────────────────────────────
async function triggerPictureInPicture(tabId) {
  const targetId = tabId || activeTabId
  const tab = tabs.get(targetId)
  if (!tab || !tab.view) return { success: false, error: 'No active web view' }

  try {
    const res = await tab.view.webContents.executeJavaScript(`
      (async function() {
        const videos = Array.from(document.querySelectorAll('video'));
        if (videos.length === 0) return { success: false, error: 'No video element found on this page' };
        const targetVideo = videos.find(v => !v.paused) || videos.sort((a,b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0];
        if (!targetVideo) return { success: false, error: 'No video element found' };
        
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          return { success: true, pip: false, message: 'Exited Picture-in-Picture' };
        } else {
          await targetVideo.requestPictureInPicture();
          return { success: true, pip: true, message: 'Floating video active' };
        }
      })()
    `)
    return res
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function executeMediaCommand(tabId, command) {
  const targetId = tabId || activeTabId
  const tab = tabs.get(targetId)
  if (!tab || !tab.view) return { success: false }

  try {
    const script = `
      (function() {
        const media = Array.from(document.querySelectorAll('video, audio'));
        if (media.length === 0) return { success: false, error: 'No media found' };
        const primary = media.find(m => !m.paused) || media[0];
        
        switch ('${command}') {
          case 'play-pause':
            if (primary.paused) primary.play();
            else primary.pause();
            return { success: true, paused: primary.paused };
          case 'skip-forward':
            primary.currentTime = Math.min(primary.duration || Infinity, primary.currentTime + 10);
            return { success: true, currentTime: primary.currentTime };
          case 'skip-backward':
            primary.currentTime = Math.max(0, primary.currentTime - 10);
            return { success: true, currentTime: primary.currentTime };
          case 'mute-toggle':
            primary.muted = !primary.muted;
            return { success: true, muted: primary.muted };
          default:
            return { success: true };
        }
      })()
    `
    return await tab.view.webContents.executeJavaScript(script)
  } catch (e) {
    return { success: false, error: e.message }
  }
}

// ─── Zoom Controls ────────────────────────────────────────────────────────────
function setZoom(tabId, factor) {
  const targetId = tabId || activeTabId
  const tab = tabs.get(targetId)
  if (tab && tab.view) {
    const clamped = Math.max(0.25, Math.min(3.0, factor))
    tab.zoomFactor = clamped
    tab.view.webContents.setZoomFactor(clamped)
    mainWindow?.webContents.send('zoom-changed', { tabId: targetId, zoomFactor: clamped })
    return clamped
  }
  return 1.0
}

function getZoom(tabId) {
  const tab = tabs.get(tabId || activeTabId)
  return tab ? tab.zoomFactor || 1.0 : 1.0
}

// ─── IPC: Tabs & Navigation ───────────────────────────────────────────────────
ipcMain.handle('create-tab',   (_, url)   => createTab(url))
ipcMain.handle('close-tab',    (_, tabId) => removeTab(tabId))
ipcMain.handle('switch-tab',   (_, tabId) => setActiveTab(tabId))
ipcMain.handle('reopen-closed-tab', ()    => reopenLastClosedTab())
ipcMain.handle('navigate',     (_, { tabId, url }) => navigateTab(tabId || activeTabId, url))
ipcMain.handle('go-back',      () => { const t = tabs.get(activeTabId); if (t?.view.webContents.canGoBack()) t.view.webContents.goBack() })
ipcMain.handle('go-forward',   () => { const t = tabs.get(activeTabId); if (t?.view.webContents.canGoForward()) t.view.webContents.goForward() })
ipcMain.handle('reload',       () => { tabs.get(activeTabId)?.view.webContents.reload() })
ipcMain.handle('get-active-tab', () => activeTabId)
ipcMain.handle('get-tabs', () =>
  [...tabs.entries()].map(([id, t]) => ({
    id, url: t.url, title: t.title, favicon: t.favicon,
    zoomFactor: t.zoomFactor || 1.0,
    isPlayingAudio: !!t.isPlayingAudio,
  }))
)

// ─── IPC: Split View ──────────────────────────────────────────────────────────
ipcMain.handle('split-view-toggle', (_, enabled) => toggleSplitView(enabled))
ipcMain.handle('split-view-set-tab', (_, tabId) => setSplitTab(tabId))
ipcMain.handle('split-view-get-state', () => ({ enabled: isSplitView, splitTabId, activeTabId }))

// ─── IPC: Find in Page ────────────────────────────────────────────────────────
ipcMain.handle('find-in-page',      (_, { text, forward, findNext }) => findInPage(text, forward, findNext))
ipcMain.handle('stop-find-in-page', (_, action) => stopFindInPage(action))

// ─── IPC: Screenshot Capture ──────────────────────────────────────────────────
ipcMain.handle('capture-page', async () => captureCurrentPage())

// ─── IPC: Media Controls & Picture-in-Picture ─────────────────────────────────
ipcMain.handle('media-pip', (_, tabId) => triggerPictureInPicture(tabId))
ipcMain.handle('media-control', (_, { tabId, command }) => executeMediaCommand(tabId, command))
ipcMain.handle('media-mute-tab', (_, { tabId, mute }) => {
  const tab = tabs.get(tabId || activeTabId)
  if (tab && tab.view) {
    tab.view.webContents.setAudioMuted(mute)
    return { success: true, muted: mute }
  }
  return { success: false }
})

// ─── IPC: Zoom ────────────────────────────────────────────────────────────────
ipcMain.handle('zoom-set', (_, { tabId, factor }) => setZoom(tabId, factor))
ipcMain.handle('zoom-get', (_, tabId) => getZoom(tabId))

// ─── IPC: Port Manager ────────────────────────────────────────────────────────
ipcMain.handle('scan-ports', async () => scanLocalPorts())
ipcMain.handle('port-manager-get', async () => getDetailedPortList())
ipcMain.handle('port-manager-kill', async (_, pid) => killProcess(pid))

// ─── IPC: Download Manager ────────────────────────────────────────────────────
ipcMain.handle('downloads-get',        () => getDownloadsList())
ipcMain.handle('downloads-open-file',  (_, id) => openDownloadedFile(id))
ipcMain.handle('downloads-show-folder',(_, id) => showInFolder(id))
ipcMain.handle('downloads-clear',      () => clearCompletedDownloads())

// ─── IPC: Scratch Pad / Notes ─────────────────────────────────────────────────
ipcMain.handle('notes-get',       (_, urlKey) => getNoteForUrl(urlKey))
ipcMain.handle('notes-save',      (_, { urlKey, content }) => saveNoteForUrl(urlKey, content))
ipcMain.handle('notes-get-all',   () => getNotes())

// ─── IPC: Request Inspector (Network Logger) ──────────────────────────────────
ipcMain.handle('inspector-get-logs', (_, tabId) => getTabLogs(tabId || activeTabId))
ipcMain.handle('inspector-clear-logs', (_, tabId) => clearTabLogs(tabId || activeTabId))

// ─── IPC: Environment Variables (.env Reader) ─────────────────────────────────
ipcMain.handle('env-get-files', (_, dir) => findEnvFiles(dir))
ipcMain.handle('env-read-file', (_, filePath) => readEnvFile(filePath))

// ─── IPC: Reader Mode (Distraction-Free Extractor) ─────────────────────────────
ipcMain.handle('reader-mode-extract', async (_, tabId) => {
  const targetId = tabId || activeTabId
  const tab = tabs.get(targetId)
  if (!tab || !tab.view) return { success: false, error: 'No active page view' }
  try {
    return await tab.view.webContents.executeJavaScript(READER_MODE_EXTRACTOR_SCRIPT)
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ─── IPC: Media HUD Controls ──────────────────────────────────────────────────
ipcMain.handle('media-hud-control', async (_, { tabId, command, value }) => {
  const targetId = tabId || activeTabId
  const tab = tabs.get(targetId)
  if (!tab || !tab.view) return { success: false, error: 'No active view' }
  try {
    return await tab.view.webContents.executeJavaScript(MEDIA_HUD_CONTROL_SCRIPT(command, value))
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ─── IPC: Network Mode & Privacy ──────────────────────────────────────────────
ipcMain.handle('set-mode', (_, mode) => {
  currentMode = mode
  setupNetworkFilter(session.defaultSession, mode, (privacyEvent) => {
    mainWindow?.webContents.send('privacy-event', privacyEvent)
  }, () => activeTabId)
  mainWindow?.webContents.send('mode-changed', mode)
  return { success: true, mode }
})
ipcMain.handle('get-mode', () => currentMode)
ipcMain.handle('privacy-stats-get', () => ({
  trackersBlocked: privacyStats.trackersBlocked,
  adsBlocked: privacyStats.adsBlocked,
  httpsUpgrades: privacyStats.httpsUpgrades,
}))

// ─── IPC: Search Engines ──────────────────────────────────────────────────────
ipcMain.handle('search-engines-get', () => SEARCH_ENGINES)

// ─── IPC: DevTools ────────────────────────────────────────────────────────────
ipcMain.handle('toggle-devtools', () => {
  const tab = tabs.get(activeTabId)
  if (tab && (currentMode === 'dev' || currentMode === 'normal')) {
    tab.view.webContents.isDevToolsOpened()
      ? tab.view.webContents.closeDevTools()
      : tab.view.webContents.openDevTools({ mode: 'detach' })
  }
})

// ─── IPC: Terminal ────────────────────────────────────────────────────────────
ipcMain.handle('terminal-create',  (_, { id, cols, rows }) =>
  createTerminal(id, cols, rows, (data) => mainWindow?.webContents.send('terminal-data', { id, data }))
)
ipcMain.handle('terminal-write',   (_, { id, data }) => writeToTerminal(id, data))
ipcMain.handle('terminal-resize',  (_, { id, cols, rows }) => resizeTerminal(id, cols, rows))
ipcMain.handle('terminal-destroy', (_, { id }) => destroyTerminal(id))

// ─── IPC: Bookmarks & History & Settings ──────────────────────────────────────
ipcMain.handle('bookmark-get',    () => getBookmarks())
ipcMain.handle('bookmark-add',    (_, data) => addBookmark(data))
ipcMain.handle('bookmark-remove', (_, id) => removeBookmark(id))
ipcMain.handle('bookmark-check',  (_, url) => isBookmarked(url))
ipcMain.handle('history-get',         () => getHistory())
ipcMain.handle('history-clear',       () => clearHistory())
ipcMain.handle('history-delete-item', (_, id) => deleteHistoryItem(id))
ipcMain.handle('settings-get',    () => getSettings())
ipcMain.handle('settings-update', (_, patch) => updateSettings(patch))

// ─── IPC: Menu & Drawer Visibility ───────────────────────────────────────────
ipcMain.handle('set-menu-open', (_, isOpen) => {
  isMenuOpen = !!isOpen
  repositionAllViews()
  return true
})
ipcMain.handle('set-active-drawer', (_, drawer) => {
  activeDrawer = drawer || null
  repositionAllViews()
  return true
})
ipcMain.handle('set-media-hud-open', (_, isOpen) => {
  isMediaHudOpen = !!isOpen
  repositionAllViews()
  return true
})
ipcMain.handle('set-reader-mode-active', (_, isOpen) => {
  isReaderModeOpen = !!isOpen
  repositionAllViews()
  return true
})
ipcMain.handle('set-terminal-state', (_, { isOpen, isMinimized }) => {
  isTerminalOpen = !!isOpen
  isTerminalMinimized = !!isMinimized
  repositionAllViews()
  return true
})
ipcMain.handle('create-private-tab', (_, url) => {
  const tabId = createTab(url, true)
  switchTab(tabId)
  return tabId
})
ipcMain.handle('chrome-extension-install-store', async (_, input) => {
  if (currentMode !== 'normal' && currentMode !== 'dev') {
    return { success: false, error: 'Chrome extensions are supported in Normal and Developer modes only.' }
  }
  return chromeExtensionManager ? chromeExtensionManager.installFromStore(input, session.defaultSession) : { success: false, error: 'Manager not ready' }
})

ipcMain.handle('chrome-extension-install-folder', async () => {
  if (currentMode !== 'normal' && currentMode !== 'dev') {
    return { success: false, error: 'Chrome extensions are supported in Normal and Developer modes only.' }
  }
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Unpacked Chrome Extension Folder (containing manifest.json)',
    properties: ['openDirectory'],
  })
  if (result.canceled || !result.filePaths.length) return { success: false, canceled: true }
  
  const extPath = result.filePaths[0]
  return chromeExtensionManager ? chromeExtensionManager.installFromFolder(extPath, session.defaultSession) : { success: false, error: 'Manager not ready' }
})

ipcMain.handle('chrome-extension-list', () => {
  return chromeExtensionManager ? chromeExtensionManager.list() : []
})

ipcMain.handle('chrome-extension-toggle', (_, { id, enabled }) => {
  return chromeExtensionManager ? chromeExtensionManager.toggleExtension(id, enabled, session.defaultSession) : { success: false }
})

ipcMain.handle('chrome-extension-remove', (_, id) => {
  return chromeExtensionManager ? chromeExtensionManager.removeExtension(id, session.defaultSession) : { success: false }
})

let extensionPopupWindow = null

ipcMain.handle('chrome-extension-open-popup', (_, extId) => {
  if (!chromeExtensionManager) return { success: false, error: 'Manager not ready' }
  const ext = chromeExtensionManager.getDb().find(e => e.id === extId)
  if (!ext) return { success: false, error: 'Extension not found' }

  let popupFile = 'popup/popup.html'
  if (ext.path && fs.existsSync(ext.path)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(ext.path, 'manifest.json'), 'utf8'))
      popupFile = manifest.action?.default_popup ||
                  manifest.browser_action?.default_popup ||
                  manifest.options_page ||
                  manifest.options_ui?.page ||
                  'popup/popup.html'
      if (popupFile.startsWith('/')) popupFile = popupFile.slice(1)
    } catch (e) {}
  }

  // Find exact registered runtime extension ID
  const allLoaded = session.defaultSession.getAllExtensions()
  const loadedExt = allLoaded.find(e => e.path === ext.path || e.id === extId)
  const realExtId = loadedExt ? loadedExt.id : (ext.runtimeId || extId)

  // Close existing popup if any
  if (extensionPopupWindow && !extensionPopupWindow.isDestroyed()) {
    extensionPopupWindow.close()
  }

  const mainBounds = mainWindow ? mainWindow.getBounds() : { x: 100, y: 100, width: 1200 }
  const popWidth = 380
  const popHeight = 560
  const posX = Math.max(0, mainBounds.x + mainBounds.width - popWidth - 30)
  const posY = Math.max(0, mainBounds.y + 110)

  extensionPopupWindow = new BrowserWindow({
    width: popWidth,
    height: popHeight,
    x: posX,
    y: posY,
    parent: mainWindow || undefined,
    modal: false,
    frame: true,
    title: ext.name || 'Extension Dashboard',
    resizable: true,
    alwaysOnTop: true,
    backgroundColor: '#0a0d14',
    webPreferences: {
      session: session.defaultSession,
      contextIsolation: true,
      sandbox: false,
      devTools: true,
    },
  })

  const popupUrl = `chrome-extension://${realExtId}/${popupFile}`
  extensionPopupWindow.loadURL(popupUrl).catch((err) => {
    console.warn('[NeXusWeb] Failed to load extension popup URL:', err.message)
  })

  return { success: true, url: popupUrl }
})

ipcMain.handle('extensions-get', () => getExtensions())
ipcMain.handle('extensions-save', (_, list) => saveExtensions(list))

let currentProxyConfig = { mode: 'direct', region: 'direct' }
ipcMain.handle('proxy-get-config', () => currentProxyConfig)
ipcMain.handle('proxy-set-config', async (_, config) => {
  try {
    if (!config || config.mode === 'direct') {
      currentProxyConfig = { mode: 'direct', region: 'direct' }
      await session.defaultSession.setProxy({ mode: 'direct' })
      return { success: true, config: currentProxyConfig }
    }

    if (config.mode === 'fixed_servers' && config.proxyRules) {
      currentProxyConfig = config
      await session.defaultSession.setProxy({ proxyRules: config.proxyRules })
      return { success: true, config: currentProxyConfig }
    }

    if (config.mode === 'pac' && config.pacScript) {
      const pacPath = path.join(app.getPath('userData'), 'nexus_active_proxy.pac')
      fs.writeFileSync(pacPath, config.pacScript, 'utf8')
      const pacFileUrl = `file:///${pacPath.replace(/\\/g, '/')}`
      currentProxyConfig = config
      await session.defaultSession.setProxy({ pacScript: pacFileUrl })
      return { success: true, config: currentProxyConfig }
    }

    return { success: false, error: 'Unknown proxy format' }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// ─── IPC: REST & GraphQL API Workbench ──────────────────────────────────────
ipcMain.handle('api-workbench-send', async (_, { method = 'GET', url, headers = {}, body = null, auth = null }) => {
  const startTime = Date.now()
  try {
    const finalHeaders = { ...headers }
    if (auth && auth.type === 'bearer' && auth.token) {
      finalHeaders['Authorization'] = `Bearer ${auth.token}`
    } else if (auth && auth.type === 'basic' && auth.username) {
      const creds = Buffer.from(`${auth.username}:${auth.password || ''}`).toString('base64')
      finalHeaders['Authorization'] = `Basic ${creds}`
    }

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: finalHeaders,
    }

    if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method)) {
      fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : String(body)
    }

    const response = await fetch(url, fetchOptions)
    const duration = Date.now() - startTime
    const contentType = response.headers.get('content-type') || ''
    
    let responseData
    if (contentType.includes('application/json')) {
      try { responseData = await response.json() } catch (e) { responseData = await response.text() }
    } else {
      responseData = await response.text()
    }

    const resHeaders = {}
    response.headers.forEach((val, key) => { resHeaders[key] = val })

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
      data: responseData,
      duration,
      size: typeof responseData === 'string' ? responseData.length : JSON.stringify(responseData).length,
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
      duration: Date.now() - startTime,
    }
  }
})

// ─── IPC: Window Controls ─────────────────────────────────────────────────────
ipcMain.handle('window-minimize', () => mainWindow?.minimize())
ipcMain.handle('window-maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize())
ipcMain.handle('window-close',    () => mainWindow?.close())
ipcMain.handle('open-file-dialog', async () =>
  dialog.showOpenDialog(mainWindow, { properties: ['openFile', 'openDirectory'] })
)

// ─── Global Keyboard Shortcuts ────────────────────────────────────────────────
function registerShortcuts() {
  globalShortcut.register('CommandOrControl+T', () => createTab())
  globalShortcut.register('CommandOrControl+W', () => { if (activeTabId) removeTab(activeTabId) })
  globalShortcut.register('CommandOrControl+Shift+T', () => reopenLastClosedTab())
  globalShortcut.register('CommandOrControl+R', () => { tabs.get(activeTabId)?.view.webContents.reload() })
  globalShortcut.register('F5', () => { tabs.get(activeTabId)?.view.webContents.reload() })
  globalShortcut.register('CommandOrControl+Shift+S', async () => {
    const res = await captureCurrentPage()
    mainWindow?.webContents.send('screenshot-captured', res)
  })
  globalShortcut.register('F9', async () => {
    const res = await captureCurrentPage()
    mainWindow?.webContents.send('screenshot-captured', res)
  })
  globalShortcut.register('CommandOrControl+Shift+P', async () => {
    const res = await triggerPictureInPicture(activeTabId)
    mainWindow?.webContents.send('pip-triggered', res)
  })
  globalShortcut.register('Alt+Left', () => {
    const t = tabs.get(activeTabId)
    if (t?.view.webContents.canGoBack()) t.view.webContents.goBack()
  })
  globalShortcut.register('Alt+Right', () => {
    const t = tabs.get(activeTabId)
    if (t?.view.webContents.canGoForward()) t.view.webContents.goForward()
  })
  globalShortcut.register('CommandOrControl+Tab', () => {
    const tabIds = [...tabs.keys()].filter(k => typeof k === 'number')
    if (tabIds.length <= 1) return
    const idx = tabIds.indexOf(activeTabId)
    const next = tabIds[(idx + 1) % tabIds.length]
    if (next !== undefined) setActiveTab(next)
  })
  globalShortcut.register('CommandOrControl+Shift+Tab', () => {
    const tabIds = [...tabs.keys()].filter(k => typeof k === 'number')
    if (tabIds.length <= 1) return
    const idx = tabIds.indexOf(activeTabId)
    const prev = tabIds[(idx - 1 + tabIds.length) % tabIds.length]
    if (prev !== undefined) setActiveTab(prev)
  })
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()
  registerShortcuts()

  // Initialize System Tray
  try {
    initTray({
      getMainWindow: () => mainWindow,
      onNewTab: (url) => createTab(url),
      onTriggerPiP: () => triggerPictureInPicture(activeTabId),
      onModeChange: (newMode) => {
        currentMode = newMode
        setupNetworkFilter(session.defaultSession, newMode, (privacyEvent) => {
          mainWindow?.webContents.send('privacy-event', privacyEvent)
        }, () => activeTabId)
        mainWindow?.webContents.send('mode-changed', newMode)
      },
      getMode: () => currentMode,
      getServers: () => scanLocalPorts(),
    })
  } catch (e) {
    console.error('[NeXusWeb] Tray init failed:', e)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  mainWindow.webContents.once('did-finish-load', () => {
    // Check saved session
    const saved = getSession()
    if (saved && Array.isArray(saved.tabs) && saved.tabs.length > 0) {
      saved.tabs.forEach((item, idx) => {
        const tid = createTab(item.url)
        if (idx === 0) setTimeout(() => setActiveTab(tid), 200)
      })
    } else {
      setTimeout(() => createTab(), 200)
    }
  })
})

app.on('before-quit', () => {
  // Persist current session
  try {
    const openTabs = [...tabs.entries()]
      .filter(([id, t]) => typeof id === 'number' && t.url && !t.url.startsWith('data:'))
      .map(([_, t]) => ({ url: t.url, title: t.title }))
    saveSession({
      tabs: openTabs,
      mode: currentMode,
    })
  } catch (e) {}
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  destroyTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
