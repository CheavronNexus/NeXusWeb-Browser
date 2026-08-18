import React from 'react'

const DEFAULT_FAVICON = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"/>
    <circle cx="7" cy="7" r="2" fill="var(--text-muted)"/>
  </svg>
)

export default function TabBar({ tabs, activeTabId, onNewTab, onCloseTab, onSwitchTab }) {
  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div
          key={tab.id}
          id={`tab-${tab.id}`}
          className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => onSwitchTab(tab.id)}
          title={tab.title || tab.url}
        >
          {/* Icon */}
          <span className="tab-favicon">
            {tab.loading ? (
              <span className="tab-spinner" />
            ) : tab.favicon ? (
              <img src={tab.favicon} width={14} height={14} alt="" className="tab-favicon" />
            ) : (
              DEFAULT_FAVICON
            )}
          </span>

          {/* Title */}
          <span className="tab-title">
            {tab.title || tab.url || 'New Tab'}
          </span>

          {/* Close */}
          <button
            className="tab-close"
            id={`tab-close-${tab.id}`}
            onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
            title="Close tab"
          >
            ✕
          </button>
        </div>
      ))}

      {/* New tab button */}
      <button
        className="tab-new-btn"
        id="new-tab-btn"
        onClick={() => onNewTab()}
        title="New tab"
      >
        +
      </button>
    </div>
  )
}
