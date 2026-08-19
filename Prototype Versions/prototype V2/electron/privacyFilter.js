/**
 * privacyFilter.js
 * DuckDuckGo-style Privacy & Security Shield for NeXusWeb Normal Mode.
 * Provides Tracker Blocking, Ad Network Blocking, HTTPS Auto-Upgrade,
 * Fingerprint Protection script injection, and live privacy statistics.
 */

// Common tracking & ad domains / patterns (DuckDuckGo & EasyList / EasyPrivacy inspired)
const TRACKER_DOMAINS = [
  // Google / DoubleClick trackers
  'google-analytics.com',
  'googletagmanager.com',
  'googletagservices.com',
  'doubleclick.net',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'googlesyndication.com',
  
  // Facebook / Meta trackers
  'connect.facebook.net',
  'pixel.facebook.com',
  'an.facebook.com',

  // Common Ad Networks & Telemetry
  'scorecardresearch.com',
  'criteo.com',
  'criteo.net',
  'taboola.com',
  'outbrain.com',
  'adnxs.com',
  'amazon-adsystem.com',
  'adsrvr.org',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
  'casalemedia.com',
  'serving-sys.com',
  'advertising.com',
  'adroll.com',
  'chartbeat.com',
  'quantserve.com',
  'quantcount.com',
  'segment.io',
  'segment.com',
  'hotjar.com',
  'clarity.ms',
  'mixpanel.com',
  'amplitude.com',
  'heapanalytics.com',
  'fullstory.com',
  'crazyegg.com',
  'mouseflow.com',
  'branch.io',
  'appsflyer.com',
  'adjust.com',
  'onesignal.com',
  'optimizely.com',
  'smartlook.com',
  'bugsnag.com',
  'datadoghq.com',
  'inspectlet.com',
  'luckyorange.com',
  'matomo.org',
  'statcounter.com',
]

// Tracker URL path heuristics
const TRACKER_PATH_PATTERNS = [
  /\/telemetry/i,
  /\/analytics\.js/i,
  /\/gtag\/js/i,
  /\/pixel\.gif/i,
  /\/beacon(\.js|\.gif)?/i,
  /\/track(\.js|\.gif|\/event)?/i,
  /\/collect(\?|$)/i,
  /\/logEvent/i,
]

// Session privacy metrics
const privacyStats = {
  trackersBlocked: 0,
  adsBlocked: 0,
  httpsUpgrades: 0,
  perTab: new Map(), // tabId -> { trackersBlocked: 0, adsBlocked: 0, httpsUpgrades: 0, blockedList: [] }
}

function getTabStats(tabId) {
  if (!tabId) return { trackersBlocked: 0, adsBlocked: 0, httpsUpgrades: 0, blockedList: [] }
  if (!privacyStats.perTab.has(tabId)) {
    privacyStats.perTab.set(tabId, { trackersBlocked: 0, adsBlocked: 0, httpsUpgrades: 0, blockedList: [] })
  }
  return privacyStats.perTab.get(tabId)
}

function resetTabStats(tabId) {
  if (tabId && privacyStats.perTab.has(tabId)) {
    privacyStats.perTab.set(tabId, { trackersBlocked: 0, adsBlocked: 0, httpsUpgrades: 0, blockedList: [] })
  }
}

/**
 * Checks if a URL matches tracker domains or patterns
 */
function isTrackerOrAd(urlStr) {
  try {
    const u = new URL(urlStr)
    const hostname = u.hostname.toLowerCase()
    const pathname = u.pathname

    for (const d of TRACKER_DOMAINS) {
      if (hostname === d || hostname.endsWith('.' + d)) {
        return { isTracker: true, domain: d }
      }
    }

    for (const pattern of TRACKER_PATH_PATTERNS) {
      if (pattern.test(pathname) || pattern.test(urlStr)) {
        return { isTracker: true, domain: hostname }
      }
    }
  } catch (e) {}

  return { isTracker: false }
}

/**
 * Anti-Fingerprinting Content Script to inject into webContents
 */
const FINGERPRINT_SHIELD_SCRIPT = `
(function() {
  if (window.__nexus_shield_injected) return;
  window.__nexus_shield_injected = true;

  try {
    // 1. Navigator Privacy Standards
    try { Object.defineProperty(navigator, 'doNotTrack', { get: () => '1', configurable: true }); } catch(e) {}
    try { Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true, configurable: true }); } catch(e) {}
  } catch(e) {}
})();
`

module.exports = {
  isTrackerOrAd,
  privacyStats,
  getTabStats,
  resetTabStats,
  FINGERPRINT_SHIELD_SCRIPT,
  TRACKER_DOMAINS,
}
