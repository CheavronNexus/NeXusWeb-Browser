const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nexus', {
  // ── Tab Management ──────────────────────────────────────────────────────────
  createTab:        (url)   => ipcRenderer.invoke('create-tab', url),
  closeTab:         (tabId) => ipcRenderer.invoke('close-tab', tabId),
  switchTab:        (tabId) => ipcRenderer.invoke('switch-tab', tabId),
  reopenClosedTab:  ()      => ipcRenderer.invoke('reopen-closed-tab'),
  getTabs:          ()      => ipcRenderer.invoke('get-tabs'),
  getActiveTab:     ()      => ipcRenderer.invoke('get-active-tab'),

  // ── Navigation ──────────────────────────────────────────────────────────────
  navigate:   (url, tabId) => ipcRenderer.invoke('navigate', { url, tabId }),
  goBack:     ()           => ipcRenderer.invoke('go-back'),
  goForward:  ()           => ipcRenderer.invoke('go-forward'),
  reload:     ()           => ipcRenderer.invoke('reload'),

  // ── Split View ──────────────────────────────────────────────────────────────
  splitView: {
    toggle:   (enabled) => ipcRenderer.invoke('split-view-toggle', enabled),
    setTab:   (tabId)   => ipcRenderer.invoke('split-view-set-tab', tabId),
    getState: ()        => ipcRenderer.invoke('split-view-get-state'),
    onChange: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('split-view-changed', handler)
      return () => ipcRenderer.removeListener('split-view-changed', handler)
    },
  },

  // ── Find in Page ────────────────────────────────────────────────────────────
  findInPage: {
    start:  (text, forward, findNext) => ipcRenderer.invoke('find-in-page', { text, forward, findNext }),
    stop:   (action)                  => ipcRenderer.invoke('stop-find-in-page', action),
    onResult: (cb) => {
      const handler = (_, res) => cb(res)
      ipcRenderer.on('find-result', handler)
      return () => ipcRenderer.removeListener('find-result', handler)
    },
    offResult: () => ipcRenderer.removeAllListeners('find-result'),
  },

  // ── Page Screenshot ─────────────────────────────────────────────────────────
  capturePage: () => ipcRenderer.invoke('capture-page'),
  onScreenshotCaptured: (cb) => {
    const handler = (_, res) => cb(res)
    ipcRenderer.on('screenshot-captured', handler)
    return () => ipcRenderer.removeListener('screenshot-captured', handler)
  },

  // ── Media & Picture-in-Picture ──────────────────────────────────────────────
  media: {
    triggerPiP: (tabId)             => ipcRenderer.invoke('media-pip', tabId),
    control:    (tabId, command)    => ipcRenderer.invoke('media-control', { tabId, command }),
    muteTab:    (tabId, mute)       => ipcRenderer.invoke('media-mute-tab', { tabId, mute }),
    onPiPTriggered: (cb) => {
      const handler = (_, res) => cb(res)
      ipcRenderer.on('pip-triggered', handler)
      return () => ipcRenderer.removeListener('pip-triggered', handler)
    },
    onAudioChanged: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('tab-audio-changed', handler)
      return () => ipcRenderer.removeListener('tab-audio-changed', handler)
    },
  },

  // ── Privacy & Security Shield ───────────────────────────────────────────────
  privacy: {
    getStats: () => ipcRenderer.invoke('privacy-stats-get'),
    onEvent: (cb) => {
      const handler = (_, ev) => cb(ev)
      ipcRenderer.on('privacy-event', handler)
      return () => ipcRenderer.removeListener('privacy-event', handler)
    },
  },

  // ── Search Engines ──────────────────────────────────────────────────────────
  searchEngines: {
    getList: () => ipcRenderer.invoke('search-engines-get'),
  },

  // ── Menu & Drawer Visibility ────────────────────────────────────────────────
  setMenuOpen:     (isOpen) => ipcRenderer.invoke('set-menu-open', isOpen),
  setActiveDrawer: (drawer) => ipcRenderer.invoke('set-active-drawer', drawer),
  setMediaHudOpen: (isOpen) => ipcRenderer.invoke('set-media-hud-open', isOpen),

  // ── Zoom Controls ───────────────────────────────────────────────────────────
  zoom: {
    set:      (factor, tabId) => ipcRenderer.invoke('zoom-set', { factor, tabId }),
    get:      (tabId)         => ipcRenderer.invoke('zoom-get', tabId),
    onChange: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('zoom-changed', handler)
      return () => ipcRenderer.removeListener('zoom-changed', handler)
    },
  },

  // ── Network Mode ────────────────────────────────────────────────────────────
  setMode: (mode) => ipcRenderer.invoke('set-mode', mode),
  getMode: ()     => ipcRenderer.invoke('get-mode'),

  // ── Port Scanner & Port Manager ─────────────────────────────────────────────
  scanPorts: () => ipcRenderer.invoke('scan-ports'),
  portManager: {
    getDetailedList: ()    => ipcRenderer.invoke('port-manager-get'),
    kill:            (pid) => ipcRenderer.invoke('port-manager-kill', pid),
  },

  // ── Download Manager ────────────────────────────────────────────────────────
  downloads: {
    get:        ()   => ipcRenderer.invoke('downloads-get'),
    openFile:   (id) => ipcRenderer.invoke('downloads-open-file', id),
    showFolder: (id) => ipcRenderer.invoke('downloads-show-folder', id),
    clear:      ()   => ipcRenderer.invoke('downloads-clear'),
    onUpdate:   (cb) => {
      const handler = (_, item) => cb(item)
      ipcRenderer.on('download-updated', handler)
      return () => ipcRenderer.removeListener('download-updated', handler)
    },
    offUpdate:  () => ipcRenderer.removeAllListeners('download-updated'),
  },

  // ── Dev Notes / Scratch Pad ─────────────────────────────────────────────────
  notes: {
    get:    (urlKey)          => ipcRenderer.invoke('notes-get', urlKey),
    save:   (urlKey, content) => ipcRenderer.invoke('notes-save', { urlKey, content }),
    getAll: ()                => ipcRenderer.invoke('notes-get-all'),
  },

  // ── DevTools ────────────────────────────────────────────────────────────────
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),

  // ── Multi-Terminal Session Support ──────────────────────────────────────────
  terminal: {
    create:  (id, cols, rows) => ipcRenderer.invoke('terminal-create', { id, cols, rows }),
    write:   (id, data)       => ipcRenderer.invoke('terminal-write', { id, data }),
    resize:  (id, cols, rows) => ipcRenderer.invoke('terminal-resize', { id, cols, rows }),
    destroy: (id)             => ipcRenderer.invoke('terminal-destroy', { id }),
    onData:  (cb) => {
      const handler = (_, payload) => cb(payload)
      ipcRenderer.on('terminal-data', handler)
      return () => ipcRenderer.removeListener('terminal-data', handler)
    },
    offData: () => ipcRenderer.removeAllListeners('terminal-data'),
  },

  // ── Bookmarks ────────────────────────────────────────────────────────────────
  bookmarks: {
    get:    ()        => ipcRenderer.invoke('bookmark-get'),
    add:    (data)    => ipcRenderer.invoke('bookmark-add', data),
    remove: (id)      => ipcRenderer.invoke('bookmark-remove', id),
    check:  (url)     => ipcRenderer.invoke('bookmark-check', url),
  },

  // ── History ──────────────────────────────────────────────────────────────────
  history: {
    get:        ()   => ipcRenderer.invoke('history-get'),
    clear:      ()   => ipcRenderer.invoke('history-clear'),
    deleteItem: (id) => ipcRenderer.invoke('history-delete-item', id),
  },

  // ── Settings ─────────────────────────────────────────────────────────────────
  settings: {
    get:    ()      => ipcRenderer.invoke('settings-get'),
    update: (patch) => ipcRenderer.invoke('settings-update', patch),
  },

  // ── Window Controls ──────────────────────────────────────────────────────────
  window: {
    minimize:      () => ipcRenderer.invoke('window-minimize'),
    maximize:      () => ipcRenderer.invoke('window-maximize'),
    close:         () => ipcRenderer.invoke('window-close'),
    onStateChange: (cb) => {
      const handler = (_, state) => cb(state)
      ipcRenderer.on('window-state-change', handler)
      return () => ipcRenderer.removeListener('window-state-change', handler)
    },
  },

  // ── Event Listeners ─────────────────────────────────────────────────────────
  on: {
    tabCreated: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('tab-created', handler)
      return () => ipcRenderer.removeListener('tab-created', handler)
    },
    tabUpdated: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('tab-updated', handler)
      return () => ipcRenderer.removeListener('tab-updated', handler)
    },
    tabRemoved: (cb) => {
      const handler = (_, id) => cb(id)
      ipcRenderer.on('tab-removed', handler)
      return () => ipcRenderer.removeListener('tab-removed', handler)
    },
    tabLoading: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('tab-loading', handler)
      return () => ipcRenderer.removeListener('tab-loading', handler)
    },
    tabAudioChanged: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('tab-audio-changed', handler)
      return () => ipcRenderer.removeListener('tab-audio-changed', handler)
    },
    activeTabChanged: (cb) => {
      const handler = (_, id) => cb(id)
      ipcRenderer.on('active-tab-changed', handler)
      return () => ipcRenderer.removeListener('active-tab-changed', handler)
    },
    modeChanged: (cb) => {
      const handler = (_, m) => cb(m)
      ipcRenderer.on('mode-changed', handler)
      return () => ipcRenderer.removeListener('mode-changed', handler)
    },
    navError: (cb) => {
      const handler = (_, d) => cb(d)
      ipcRenderer.on('navigation-error', handler)
      return () => ipcRenderer.removeListener('navigation-error', handler)
    },
    showHome: (cb) => {
      const handler = (_, id) => cb(id)
      ipcRenderer.on('show-home', handler)
      return () => ipcRenderer.removeListener('show-home', handler)
    },
  },

  // ── File Dialog ──────────────────────────────────────────────────────────────
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
})
