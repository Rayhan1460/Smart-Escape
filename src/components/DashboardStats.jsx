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
        sub: 'optimal units',
        colorClass: 'stat-accent-cyan'
      };
    }
    if (routeStatus === 'START_BLOCKED') {
      return {
        value: 'BLOCKED',
        sub: 'start compromised',
        colorClass: 'stat-accent-danger'
      };
    }
    if (routeStatus === 'NO_ROUTE') {
      return {
        value: 'SEVERED',
        sub: 'no open exit reachable',
        colorClass: 'stat-accent-warning'
      };
    }
    return {
      value: '—',
      sub: 'select start point',
      colorClass: 'stat-accent-neutral'
    };
  };

  const costData = getCostDisplay();

  return (
    <div className="dashboard-stats-grid">
      {/* 1. Open Exits */}
      <div className="stat-card">
        <div className="stat-card-icon-wrap stat-icon-emerald">
          <DoorOpen size={20} />
        </div>
        <div className="stat-card-body">
          <span className="stat-card-label">{t.statOpenExits}</span>
          <div className="stat-card-number-row">
            <span className="stat-card-value text-emerald">{openExitsCount}</span>
            <span className="stat-card-subvalue">/ {totalExitsCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Blocked Locations */}
      <div className="stat-card">
        <div className={`stat-card-icon-wrap ${blockedLocationsCount > 0 ? 'stat-icon-danger' : 'stat-icon-slate'}`}>
          <AlertOctagon size={20} />
        </div>
        <div className="stat-card-body">
          <span className="stat-card-label">{t.statBlockedLocations}</span>
          <div className="stat-card-number-row">
            <span className={`stat-card-value ${blockedLocationsCount > 0 ? 'text-danger' : 'text-muted'}`}>
              {blockedLocationsCount}
            </span>
            <span className="stat-card-subvalue">hazard zones</span>
          </div>
        </div>
      </div>

      {/* 3. Blocked Corridors */}
      <div className="stat-card">
        <div className={`stat-card-icon-wrap ${blockedCorridorsCount > 0 ? 'stat-icon-amber' : 'stat-icon-slate'}`}>
          <GitCommit size={20} />
        </div>
        <div className="stat-card-body">
          <span className="stat-card-label">{t.statBlockedCorridors}</span>
          <div className="stat-card-number-row">
            <span className={`stat-card-value ${blockedCorridorsCount > 0 ? 'text-amber' : 'text-muted'}`}>
              {blockedCorridorsCount}
            </span>
            <span className="stat-card-subvalue">corridors closed</span>
          </div>
        </div>
      </div>

      {/* 4. Route Cost */}
      <div className={`stat-card stat-cost-card ${costData.colorClass}`}>
        <div className="stat-card-icon-wrap stat-icon-cyan">
          <Zap size={20} />
        </div>
        <div className="stat-card-body">
          <span className="stat-card-label">{t.statRouteCost}</span>
          <div className="stat-card-number-row">
            <span className="stat-card-value stat-cost-value">
              {costData.value}
            </span>
          </div>
          <span className="stat-card-subvalue">{costData.sub}</span>
        </div>
      </div>
    </div>
  );
}
