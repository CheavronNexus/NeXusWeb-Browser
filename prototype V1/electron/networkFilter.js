/**
 * networkFilter.js
 * Enforces network access rules per NeXusWeb mode using precise URL parsing.
 */

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
    // If relative or non-standard, check raw string
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
 * @param {'strict'|'lan'|'dev'} mode
 */
function setupNetworkFilter(sess, mode) {
  // Clear any existing request filter
  sess.webRequest.onBeforeRequest(null)

  sess.webRequest.onBeforeRequest({ urls: ['*://*/*', 'ws://*/*', 'wss://*/*', 'file://*/*'] }, (details, callback) => {
    const url = details.url

    // Always allow internal Electron resources, file://, and data:/blob: URLs
    if (isInternal(url) || isFile(url)) {
      return callback({ cancel: false })
    }

    // Always allow localhost (any port, HTTP, HTTPS, WS, WSS)
    if (isLocalhost(url)) {
      return callback({ cancel: false })
    }

    switch (mode) {
      case 'strict':
        // STRICT OFFLINE: Only localhost and local files allowed
        callback({ cancel: true })
        break

      case 'lan':
        // LOCAL NETWORK: Localhost + LAN allowed, internet blocked
        if (isLAN(url)) {
          callback({ cancel: false })
        } else {
          callback({ cancel: true })
        }
        break

      case 'dev':
        // DEVELOPER MODE: Everything permitted
        callback({ cancel: false })
        break

      default:
        callback({ cancel: false })
    }
  })

  console.log(`[NeXusWeb] Network filter updated: mode = ${mode}`)
}

module.exports = { setupNetworkFilter, isLocalhost, isLAN, isFile }
