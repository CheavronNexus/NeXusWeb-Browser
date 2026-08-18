/**
 * networkFilter.js
 * Enforces network access rules per NeXusWeb mode using precise URL parsing
 * and DuckDuckGo-style privacy & security enforcement in Normal Mode.
 */

const { isTrackerOrAd, privacyStats, getTabStats } = require('./privacyFilter')

function isLocalhost(urlStr) {
  try {
    const u = new URL(urlStr)
    const h = u.hostname.toLowerCase()
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '0.0.0.0' ||
      h === '::1' ||
      h === '[::1]' ||
      h.endsWith('.localhost') ||
      h.endsWith('.local')
    )
  } catch (e) {
    return (
      urlStr.startsWith('http://localhost') ||
      urlStr.startsWith('https://localhost') ||
      urlStr.startsWith('ws://localhost') ||
      urlStr.startsWith('wss://localhost') ||
      urlStr.startsWith('http://127.0.0.1') ||
      urlStr.startsWith('https://127.0.0.1') ||
      urlStr.startsWith('ws://127.0.0.1') ||
      urlStr.startsWith('wss://127.0.0.1') ||
      urlStr.startsWith('http://0.0.0.0') ||
      urlStr.startsWith('https://0.0.0.0') ||
      urlStr.startsWith('http://[::1]') ||
      urlStr.startsWith('https://[::1]')
    )
  }
}

function isLAN(urlStr) {
  try {
    const u = new URL(urlStr)
    const h = u.hostname.toLowerCase()
    if (/^192\.168\.\d+\.\d+$/.test(h)) return true
    if (/^10\.\d+\.\d+\.\d+$/.test(h)) return true
    if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(h)) return true
    return false
  } catch (e) {
    return false
  }
}

function isFile(urlStr) {
  return (
    urlStr.startsWith('file://') ||
    urlStr.startsWith('data:') ||
    urlStr.startsWith('blob:')
  )
}

function isInternal(urlStr) {
  return (
    urlStr.startsWith('devtools://') ||
    urlStr.startsWith('chrome-devtools://') ||
    urlStr.startsWith('chrome-extension://') ||
    urlStr.startsWith('chrome://') ||
    urlStr.startsWith('about:') ||
    urlStr.startsWith('nexusweb://')
  )
}

/**
 * Applies request filtering rules to a session based on the current mode.
 * @param {Electron.Session} sess
 * @param {'strict'|'lan'|'normal'|'dev'} mode
 * @param {Function} [onPrivacyEvent] Callback when a tracker or ad is blocked
 */
function setupNetworkFilter(sess, mode, onPrivacyEvent) {
  sess.webRequest.onBeforeRequest(null)
  sess.webRequest.onBeforeSendHeaders(null)

  // Configure Referrer Policy & DNT headers
  sess.webRequest.onBeforeSendHeaders({ urls: ['*://*/*'] }, (details, callback) => {
    const requestHeaders = details.requestHeaders || {}
    if (mode === 'normal') {
      requestHeaders['DNT'] = '1'
      requestHeaders['Sec-GPC'] = '1'
      // Strip third-party referrers for privacy
      if (details.referrer && details.url) {
        try {
          const refHost = new URL(details.referrer).hostname
          const reqHost = new URL(details.url).hostname
          if (refHost !== reqHost) {
            delete requestHeaders['Referer']
          }
        } catch (e) {}
      }
    }
    callback({ requestHeaders })
  })

  // Filter requests according to mode
  sess.webRequest.onBeforeRequest({ urls: ['*://*/*', 'ws://*/*', 'wss://*/*', 'file://*/*'] }, (details, callback) => {
    const url = details.url

    // Always allow internal resources, local files, and data/blob URLs
    if (isInternal(url) || isFile(url)) {
      return callback({ cancel: false })
    }

    // Always allow localhost in all modes
    if (isLocalhost(url)) {
      return callback({ cancel: false })
    }

    switch (mode) {
      case 'strict':
        // STRICT OFFLINE: Block everything that is not localhost / file
        return callback({ cancel: true })

      case 'lan':
        // LOCAL NETWORK: Allow LAN + Localhost, block wide internet
        if (isLAN(url)) {
          return callback({ cancel: false })
        }
        return callback({ cancel: true })

      case 'normal': {
        // NORMAL WEB MODE with Privacy & Security Shield
        const trackerCheck = isTrackerOrAd(url)
        if (trackerCheck.isTracker) {
          privacyStats.trackersBlocked++
          if (onPrivacyEvent) {
            onPrivacyEvent({
              type: 'tracker-blocked',
              domain: trackerCheck.domain,
              url,
              totalBlocked: privacyStats.trackersBlocked,
            })
          }
          return callback({ cancel: true })
        }

        // HTTPS Auto-Upgrade for HTTP links outside LAN
        if (url.startsWith('http://') && !isLAN(url) && !isLocalhost(url)) {
          const upgradedUrl = url.replace(/^http:\/\//, 'https://')
          privacyStats.httpsUpgrades++
          return callback({ redirectURL: upgradedUrl })
        }

        return callback({ cancel: false })
      }

      case 'dev':
        // DEVELOPER MODE: Full unrestricted access
        return callback({ cancel: false })

      default:
        return callback({ cancel: false })
    }
  })

  console.log(`[NeXusWeb] Network filter updated: mode = ${mode}`)
}

module.exports = { setupNetworkFilter, isLocalhost, isLAN, isFile }
