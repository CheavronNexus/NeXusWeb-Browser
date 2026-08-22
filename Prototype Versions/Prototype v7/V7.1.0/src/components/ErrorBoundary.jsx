import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[NeXusWeb UI ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 350,
            height: '100%',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 400,
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red)',
            }}
          >
            <AlertTriangle size={22} />
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Panel Encountered an Error
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 260, lineHeight: 1.4 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </div>

          <button
            onClick={this.handleReset}
            className="glass-btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: 11.5,
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={12} />
            <span>Retry Panel</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
