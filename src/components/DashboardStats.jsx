import React from 'react';
import { DoorOpen, AlertOctagon, GitCommit, Zap } from 'lucide-react';

export function DashboardStats({
  openExitsCount,
  totalExitsCount,
  blockedLocationsCount,
  blockedCorridorsCount,
  routeCost,
  routeStatus,
  t
}) {
  const getCostDisplay = () => {
    if (routeStatus === 'SUCCESS') {
      return {
        value: routeCost,
        sub: 'optimal route',
        colorClass: 'stat-accent-cyan',
        badge: 'OPTIMAL',
        badgeClass: 'badge-cyan'
      };
    }
    if (routeStatus === 'START_BLOCKED') {
      return {
        value: 'BLOCKED',
        sub: 'origin compromised',
        colorClass: 'stat-accent-danger',
        badge: 'HAZARD',
        badgeClass: 'badge-danger'
      };
    }
    if (routeStatus === 'NO_ROUTE') {
      return {
        value: 'SEVERED',
        sub: 'no exit reachable',
        colorClass: 'stat-accent-warning',
        badge: 'CRITICAL',
        badgeClass: 'badge-warning'
      };
    }
    return {
      value: '—',
      sub: 'awaiting origin',
      colorClass: 'stat-accent-neutral',
      badge: 'STANDBY',
      badgeClass: 'badge-neutral'
    };
  };

  const costData = getCostDisplay();

  return (
    <div className="dashboard-stats-grid">
      {/* 1. Open Exits */}
      <div className="stat-card stat-card-exits">
        <div className="stat-card-top-bar bar-emerald"></div>
        <div className="stat-card-inner">
          <div className="stat-card-icon-wrap stat-icon-emerald">
            <DoorOpen size={18} />
          </div>
          <div className="stat-card-body">
            <span className="stat-card-label">{t.statOpenExits}</span>
            <div className="stat-card-number-row">
              <span className="stat-card-value text-emerald">{openExitsCount}</span>
              <span className="stat-card-subvalue">/ {totalExitsCount} total</span>
            </div>
            <span className="stat-card-footnote text-emerald-muted">
              {openExitsCount === totalExitsCount ? 'All exits accessible' : `${totalExitsCount - openExitsCount} closed/blocked`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Blocked Locations */}
      <div className="stat-card stat-card-hazards">
        <div className={`stat-card-top-bar ${blockedLocationsCount > 0 ? 'bar-danger' : 'bar-slate'}`}></div>
        <div className="stat-card-inner">
          <div className={`stat-card-icon-wrap ${blockedLocationsCount > 0 ? 'stat-icon-danger' : 'stat-icon-slate'}`}>
            <AlertOctagon size={18} />
          </div>
          <div className="stat-card-body">
            <span className="stat-card-label">{t.statBlockedLocations}</span>
            <div className="stat-card-number-row">
              <span className={`stat-card-value ${blockedLocationsCount > 0 ? 'text-danger' : 'text-slate-light'}`}>
                {blockedLocationsCount}
              </span>
              <span className="stat-card-subvalue">nodes</span>
            </div>
            <span className="stat-card-footnote">
              {blockedLocationsCount === 0 ? 'Zero active hazards' : 'Incident rooms/junctions'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Blocked Corridors */}
      <div className="stat-card stat-card-corridors">
        <div className={`stat-card-top-bar ${blockedCorridorsCount > 0 ? 'bar-amber' : 'bar-slate'}`}></div>
        <div className="stat-card-inner">
          <div className={`stat-card-icon-wrap ${blockedCorridorsCount > 0 ? 'stat-icon-amber' : 'stat-icon-slate'}`}>
            <GitCommit size={18} />
          </div>
          <div className="stat-card-body">
            <span className="stat-card-label">{t.statBlockedCorridors}</span>
            <div className="stat-card-number-row">
              <span className={`stat-card-value ${blockedCorridorsCount > 0 ? 'text-amber' : 'text-slate-light'}`}>
                {blockedCorridorsCount}
              </span>
              <span className="stat-card-subvalue">edges</span>
            </div>
            <span className="stat-card-footnote">
              {blockedCorridorsCount === 0 ? 'All passages clear' : 'Passages severed'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Route Cost */}
      <div className={`stat-card stat-cost-card ${costData.colorClass}`}>
        <div className="stat-card-top-bar bar-cyan"></div>
        <div className="stat-card-inner">
          <div className="stat-card-icon-wrap stat-icon-cyan">
            <Zap size={18} />
          </div>
          <div className="stat-card-body">
            <div className="stat-label-row">
              <span className="stat-card-label">{t.statRouteCost}</span>
              <span className={`stat-micro-badge ${costData.badgeClass}`}>{costData.badge}</span>
            </div>
            <div className="stat-card-number-row">
              <span className="stat-card-value stat-cost-value">
                {costData.value}
              </span>
              {routeStatus === 'SUCCESS' && (
                <span className="stat-card-subvalue">units</span>
              )}
            </div>
            <span className="stat-card-footnote">{costData.sub}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
