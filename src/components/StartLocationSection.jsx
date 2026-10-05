import React from 'react';
import { MapPin, AlertTriangle, Navigation } from 'lucide-react';

export function StartLocationSection({
  nodes = [],
  selectedStartId,
  onSelectStart,
  blockedNodes,
  t
}) {
  // Only rooms and junctions can be start locations
  const eligibleNodes = nodes.filter(n => n.type === 'room' || n.type === 'junction');

  // Sort by rooms first, then junctions, then by id
  const sortedNodes = [...eligibleNodes].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'room' ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });

  const isStartBlocked = selectedStartId && blockedNodes.has(selectedStartId);

  return (
    <div className="sidebar-section start-location-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <Navigation size={17} className="section-icon" />
          <h2 className="section-title">{t.startLocation}</h2>
        </div>
        {selectedStartId && (
          <span className={`start-pill-badge ${isStartBlocked ? 'pill-danger' : 'pill-active'}`}>
            {selectedStartId}
          </span>
        )}
      </div>

      <div className="select-container">
        <label htmlFor="start-node-select" className="input-label">
          {t.selectStartNode}
        </label>
        <div className="custom-select-wrap">
          <select
            id="start-node-select"
            className={`custom-select ${isStartBlocked ? 'select-warning' : ''}`}
            value={selectedStartId || ''}
            onChange={(e) => onSelectStart(e.target.value)}
          >
            <option value="" disabled>
              {t.selectPlaceholder}
            </option>
            {sortedNodes.map((node) => {
              const blocked = blockedNodes.has(node.id);
              const typeLabel = node.type === 'room' ? t.room : t.junction;
              return (
                <option key={node.id} value={node.id}>
                  {node.id} — {node.label} [{typeLabel}]{blocked ? ` ⚠️ (${t.statusBlocked})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Warning banner if selected starting location is blocked */}
      {isStartBlocked && (
        <div className="alert-card alert-card-danger start-blocked-alert">
          <AlertTriangle size={18} className="alert-icon" />
          <div className="alert-content">
            <strong className="alert-title">{t.startBlockedTitle}</strong>
            <p className="alert-desc">{t.startBlockedDesc}</p>
          </div>
        </div>
      )}

      {/* Tip for clicking map */}
      <p className="helper-hint">
        <MapPin size={13} className="inline-hint-icon" />
        <span>{t.mapClickHint}</span>
      </p>
    </div>
  );
}
