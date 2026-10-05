import React, { useState } from 'react';
import {
  Flame,
  Search,
  Ban,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';

export function HazardControlsSection({
  nodes = [],
  edges = [],
  blockedNodes,
  blockedEdges,
  closedExits,
  onToggleNodeBlock,
  onToggleEdgeBlock,
  onToggleExitClose,
  onResetSimulation,
  t
}) {
  const [activeTab, setActiveTab] = useState('nodes'); // 'nodes' | 'corridors' | 'exits'
  const [searchQuery, setSearchQuery] = useState('');

  // Partition nodes
  const roomsAndJunctions = nodes.filter(n => n.type === 'room' || n.type === 'junction');
  const exits = nodes.filter(n => n.type === 'exit');

  const query = searchQuery.toLowerCase().trim();

  // Filtered lists
  const filteredNodes = roomsAndJunctions.filter(
    n => n.id.toLowerCase().includes(query) || n.label.toLowerCase().includes(query)
  );

  const filteredEdges = edges.filter(
    e =>
      e.id.toLowerCase().includes(query) ||
      e.from.toLowerCase().includes(query) ||
      e.to.toLowerCase().includes(query)
  );

  const filteredExits = exits.filter(
    e => e.id.toLowerCase().includes(query) || e.label.toLowerCase().includes(query)
  );

  return (
    <div className="sidebar-section hazard-controls-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <Flame size={17} className="section-icon" />
          <h2 className="section-title">{t.hazardControls}</h2>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="hazard-tabs" role="tablist">
        <button
          className={`hazard-tab-btn ${activeTab === 'nodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('nodes')}
          role="tab"
          aria-selected={activeTab === 'nodes'}
        >
          <span>{t.tabNodes}</span>
          {blockedNodes.size > 0 && (
            <span className="tab-counter-badge">{blockedNodes.size}</span>
          )}
        </button>

        <button
          className={`hazard-tab-btn ${activeTab === 'corridors' ? 'active' : ''}`}
          onClick={() => setActiveTab('corridors')}
          role="tab"
          aria-selected={activeTab === 'corridors'}
        >
          <span>{t.tabCorridors}</span>
          {blockedEdges.size > 0 && (
            <span className="tab-counter-badge">{blockedEdges.size}</span>
          )}
        </button>

        <button
          className={`hazard-tab-btn ${activeTab === 'exits' ? 'active' : ''}`}
          onClick={() => setActiveTab('exits')}
          role="tab"
          aria-selected={activeTab === 'exits'}
        >
          <span>{t.tabExits}</span>
          {closedExits.size > 0 && (
            <span className="tab-counter-badge">{closedExits.size}</span>
          )}
        </button>
      </div>

      {/* Quick Search */}
      <div className="hazard-search-wrap">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          className="hazard-search-input"
          placeholder={t.searchFilter}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="hazard-items-list-container">
        {/* 1. NODES TAB */}
        {activeTab === 'nodes' && (
          <div className="hazard-items-list">
            {filteredNodes.length === 0 ? (
              <p className="empty-list-notice">{t.allClear}</p>
            ) : (
              filteredNodes.map((node) => {
                const isBlocked = blockedNodes.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={`hazard-item-row ${isBlocked ? 'item-blocked' : ''}`}
                  >
                    <div className="hazard-item-info">
                      <div className="hazard-item-header">
                        <span className="item-id">{node.id}</span>
                        <span className={`type-tag type-${node.type}`}>
                          {node.type === 'room' ? t.room : t.junction}
                        </span>
                        <span
                          className={`status-pill ${
                            isBlocked ? 'status-pill-blocked' : 'status-pill-active'
                          }`}
                        >
                          {isBlocked ? t.statusBlocked : t.statusActive}
                        </span>
                      </div>
                      <span className="item-label">{node.label}</span>
                    </div>

                    <button
                      className={`hazard-action-btn ${isBlocked ? 'action-unblock' : 'action-block'}`}
                      onClick={() => onToggleNodeBlock(node.id)}
                      title={isBlocked ? `Unblock ${node.id}` : `Block ${node.id}`}
                    >
                      {isBlocked ? (
                        <>
                          <Unlock size={14} />
                          <span>{t.unblock}</span>
                        </>
                      ) : (
                        <>
                          <Ban size={14} />
                          <span>{t.block}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. CORRIDORS TAB */}
        {activeTab === 'corridors' && (
          <div className="hazard-items-list">
            {filteredEdges.length === 0 ? (
              <p className="empty-list-notice">{t.allClear}</p>
            ) : (
              filteredEdges.map((edge) => {
                const isBlocked = blockedEdges.has(edge.id);
                const fromBlocked = blockedNodes.has(edge.from);
                const toBlocked = blockedNodes.has(edge.to);
                const isSeveredByNode = fromBlocked || toBlocked;

                return (
                  <div
                    key={edge.id}
                    className={`hazard-item-row ${
                      isBlocked || isSeveredByNode ? 'item-blocked' : ''
                    }`}
                  >
                    <div className="hazard-item-info">
                      <div className="hazard-item-header">
                        <span className="item-id">{edge.id}</span>
                        <span className="corridor-route-text">
                          {edge.from} ↔ {edge.to}
                        </span>
                        <span className="cost-tag">
                          {t.costBadge}: {edge.cost}
                        </span>
                        <span
                          className={`status-pill ${
                            isBlocked ? 'status-pill-blocked' : isSeveredByNode ? 'status-pill-severed' : 'status-pill-active'
                          }`}
                        >
                          {isBlocked
                            ? t.statusBlocked
                            : isSeveredByNode
                            ? 'Severed (Node)'
                            : t.statusActive}
                        </span>
                      </div>
                    </div>

                    <button
                      className={`hazard-action-btn ${isBlocked ? 'action-unblock' : 'action-block'}`}
                      onClick={() => onToggleEdgeBlock(edge.id)}
                      title={isBlocked ? `Unblock corridor ${edge.id}` : `Block corridor ${edge.id}`}
                    >
                      {isBlocked ? (
                        <>
                          <Unlock size={14} />
                          <span>{t.unblock}</span>
                        </>
                      ) : (
                        <>
                          <Ban size={14} />
                          <span>{t.block}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. EXITS TAB */}
        {activeTab === 'exits' && (
          <div className="hazard-items-list">
            {filteredExits.length === 0 ? (
              <p className="empty-list-notice">{t.allClear}</p>
            ) : (
              filteredExits.map((exit) => {
                const isClosed = closedExits.has(exit.id);
                return (
                  <div
                    key={exit.id}
                    className={`hazard-item-row ${isClosed ? 'item-blocked' : ''}`}
                  >
                    <div className="hazard-item-info">
                      <div className="hazard-item-header">
                        <span className="item-id">{exit.id}</span>
                        <span className="type-tag type-exit">{t.exit}</span>
                        <span
                          className={`status-pill ${
                            isClosed ? 'status-pill-closed' : 'status-pill-open'
                          }`}
                        >
                          {isClosed ? t.statusClosed : t.statusOpen}
                        </span>
                      </div>
                      <span className="item-label">{exit.label}</span>
                    </div>

                    <button
                      className={`hazard-action-btn ${isClosed ? 'action-reopen' : 'action-close'}`}
                      onClick={() => onToggleExitClose(exit.id)}
                      title={isClosed ? `Reopen ${exit.id}` : `Close ${exit.id}`}
                    >
                      {isClosed ? (
                        <>
                          <Unlock size={14} />
                          <span>{t.reopen}</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          <span>{t.close}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Section 4: RESET SIMULATION */}
      <div className="reset-simulation-section">
        <button
          className="reset-simulation-btn"
          onClick={onResetSimulation}
          title={t.resetHelp}
        >
          <RotateCcw size={17} />
          <span>{t.resetSimulation}</span>
        </button>
        <span className="reset-subtext">{t.resetHelp}</span>
      </div>
    </div>
  );
}
