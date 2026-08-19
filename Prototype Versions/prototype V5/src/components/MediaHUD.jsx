import React, { useState, useEffect } from 'react'
import { Music, Pause, Play, Tv, Volume2, VolumeX, X } from 'lucide-react'

export default function MediaHUD({ activeTabId, onTriggerPiP, isAudioPlaying, onClose }) {
  const [mediaState, setMediaState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const pollMediaState = async () => {
    if (!activeTabId) return
    try {
      const res = await window.nexus?.media?.hudControl(activeTabId, 'get-state')
      if (res?.success && res.hasMedia) {
        setMediaState(res)
        if (typeof res.volume === 'number') setVolume(res.volume)
        if (typeof res.muted === 'boolean') setIsMuted(res.muted)
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
    const interval = setInterval(pollMediaState, 1500)
    return () => clearInterval(interval)
  }, [activeTabId])

  const handleAction = async (action, param) => {
    if (!activeTabId) return
    await window.nexus?.media?.hudControl(activeTabId, action, param)
    pollMediaState()
  }

  const handleVolumeChange = (newVol) => {
    setVolume(newVol)
    setIsMuted(newVol === 0)
    handleAction('set-volume', newVol)
  }

  const handleMuteToggle = () => {
    const nextMute = !isMuted
    setIsMuted(nextMute)
    handleAction('set-muted', nextMute)
  }

  const isPlaying = mediaState ? !mediaState.paused : isAudioPlaying
  const title = mediaState?.title || (isAudioPlaying ? 'Tab Audio Playing' : 'Media Controller')

  return (
    <div
      className="media-hud-panel"
      style={{
        width: 320,
        background: 'rgba(12, 16, 28, 0.85)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-dropdown)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 500,
        animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            background: 'rgba(0, 212, 255, 0.15)',
            border: '1px solid var(--border-bright)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--accent-primary)',
          }}>
            {isPlaying ? <Music size={12} /> : <Pause size={12} />}
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
          }}
          title="Close Media HUD"
        >
          <X size={14} />
        </button>
      </div>

      {/* Media Content or Fallback */}
      {!mediaState && !loading ? (
        <div style={{
          padding: '12px 8px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 11.5,
          background: 'var(--bg-base)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-subtle)',
        }}>
          No video or audio detected on this tab.
        </div>
      ) : (
        <>
          {/* Progress Slider (Only if duration > 0) */}
          {duration > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: 'var(--text-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={e => sendCommand('seek', parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                  height: 4,
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatTime(duration)}</span>
            </div>
          )}

          {/* Primary Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => sendCommand('skip-backward')}
                title="Rewind 10s"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  fontSize: 11,
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
                  padding: '5px 14px',
                  fontSize: 12,
                  boxShadow: '0 0 10px var(--accent-primary-dim)',
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              <button
                onClick={() => sendCommand('skip-forward')}
                title="Forward 10s"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                +10s ⏭
              </button>
            </div>

            {/* Float PiP Button */}
            <button
              onClick={() => {
                onTriggerPiP?.()
                onClose?.()
              }}
              title="Float in Picture-in-Picture (Ctrl+Shift+P)"
              style={{
                background: 'rgba(0, 212, 255, 0.12)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                padding: '5px 8px',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Tv size={12} />
              <span>Float</span>
            </button>
          </div>

          {/* Volume Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            paddingTop: 6,
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <button
                onClick={handleMuteToggle}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isMuted ? 'var(--red)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
                  maxWidth: 140,
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                  height: 4,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            <span style={{ fontSize: 10, color: isPlaying ? 'var(--green)' : 'var(--text-muted)' }}>
              {isPlaying ? '● Active' : 'Paused'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
