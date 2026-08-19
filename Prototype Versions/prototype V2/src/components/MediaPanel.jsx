import React, { useState, useEffect } from 'react'
import { PanelShell } from './PanelShell'

export default function MediaPanel({
  activeTabId,
  tabs = [],
  onSwitchTab,
  onToggleMuteTab,
  onTriggerPiP,
  isAudioPlaying,
  onClose,
}) {
  const [mediaState, setMediaState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  const pollMediaState = async () => {
    if (!activeTabId) return
    try {
      const res = await window.nexus?.media?.hudControl(activeTabId, 'get-state')
      if (res?.success && res.hasMedia) {
        setMediaState(res)
        if (typeof res.volume === 'number') setVolume(res.volume)
        if (typeof res.muted === 'boolean') setIsMuted(res.muted)
        if (typeof res.playbackRate === 'number') setPlaybackRate(res.playbackRate)
      } else {
        setMediaState(null)
      }
    } catch (e) {
      setMediaState(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    pollMediaState()
    const interval = setInterval(pollMediaState, 1000)
    return () => clearInterval(interval)
  }, [activeTabId])

  const sendCommand = async (command, value) => {
    if (!activeTabId) return
    try {
      const res = await window.nexus?.media?.hudControl(activeTabId, command, value)
      if (res?.success) {
        pollMediaState()
      }
    } catch (e) {}
  }

  const handleVolumeChange = (newVol) => {
    setVolume(newVol)
    sendCommand('volume', newVol)
  }

  const handleRateChange = (newRate) => {
    setPlaybackRate(newRate)
    sendCommand('rate', newRate)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    sendCommand('mute-toggle')
  }

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const currentTab = tabs.find(t => t.id === activeTabId)
  const isPlaying = mediaState?.isPlaying ?? isAudioPlaying
  const currentTime = mediaState?.currentTime || 0
  const duration = mediaState?.duration || 0
  const title = mediaState?.videoTitle || currentTab?.title || 'Active Tab Media'

  // Other tabs playing audio
  const audioTabs = tabs.filter(t => t.isPlayingAudio)

  return (
    <PanelShell id="media-panel" title="Media HUD Controller" icon="🎵" onClose={onClose}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Main Track Card */}
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: isPlaying ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-elevated)',
              border: `1px solid ${isPlaying ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
              color: isPlaying ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}>
              {isPlaying ? '🎵' : '⏸'}
            </div>

            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }} title={title}>
                {title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: isPlaying ? 'var(--green)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isPlaying ? 'var(--green)' : 'var(--text-muted)',
                    animation: isPlaying ? 'pulse 1.5s infinite' : 'none'
                  }} />
                  {isPlaying ? 'Active Playback' : 'Paused / Idle'}
                </span>
                {currentTab?.url && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    • {currentTab.url.replace(/^https?:\/\//, '').split('/')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Time & Scrub Bar */}
          {duration > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={e => sendCommand('seek', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                  height: 5,
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10.5,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}>
            <button
              onClick={() => sendCommand('skip-backward')}
              title="Rewind 10 Seconds (⏮)"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ⏮ -10s
            </button>

            <button
              onClick={() => sendCommand('play-pause')}
              title={isPlaying ? 'Pause' : 'Play'}
              style={{
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#0a0d14',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '8px 20px',
                fontSize: 13,
                boxShadow: '0 0 14px var(--accent-primary-dim)',
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={() => sendCommand('skip-forward')}
              title="Forward 10 Seconds (⏭)"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              +10s ⏭
            </button>
          </div>

          {/* Float PiP Action */}
          <button
            onClick={() => onTriggerPiP?.()}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid var(--border-bright)',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
            }}
          >
            <span>📺 Pop-out Floating Video (PiP)</span>
          </button>
        </div>

        {/* Volume & Mute Section */}
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Volume Control</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleMuteToggle}
              style={{
                background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-elevated)',
                border: `1px solid ${isMuted ? 'var(--red)' : 'var(--border-dim)'}`,
                color: isMuted ? 'var(--red)' : 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇 Muted' : '🔊 Mute'}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
                height: 5,
              }}
            />
          </div>
        </div>

        {/* Playback Speed Section */}
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Playback Speed</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
              <button
                key={speed}
                onClick={() => handleRateChange(speed)}
                style={{
                  padding: '5px 0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: playbackRate === speed ? '1px solid var(--accent-primary)' : '1px solid var(--border-dim)',
                  background: playbackRate === speed ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-elevated)',
                  color: playbackRate === speed ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Open Tabs with Audio */}
        {audioTabs.length > 0 && (
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              Tabs with Playing Audio ({audioTabs.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {audioTabs.map(t => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: t.id === activeTabId ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-elevated)',
                    border: `1px solid ${t.id === activeTabId ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
                  }}
                >
                  <div
                    onClick={() => onSwitchTab?.(t.id)}
                    style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <div style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {t.title || t.url || 'Tab'}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleMuteTab?.(t.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '2px 4px',
                    }}
                    title={t.isMuted ? 'Unmute Tab' : 'Mute Tab'}
                  >
                    {t.isMuted ? '🔇' : '🔊'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PanelShell>
  )
}
