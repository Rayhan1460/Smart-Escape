import React from 'react';
import {
  Navigation,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Zap,
  MapPin,
  DoorOpen
} from 'lucide-react';

export function RoutePanel({
  routeResult,
  startNode,
  destinationNode,
  buildingNodes = [],
  edges = [],
  onSelectNode,
  onUnblockNode,
  t
}) {
  const { status, path = [], totalCost = 0, corridorsCount = 0 } = routeResult || {};

  // Helper map for node labels
  const nodeMap = new Map(buildingNodes.map(n => [n.id, n]));

  // Calculate segment costs along the path
  const pathSegments = [];
  if (path && path.length > 1) {
    const edgeMap = new Map();
    for (const edge of edges) {
      edgeMap.set(`${edge.from}___${edge.to}`, edge.cost);
      edgeMap.set(`${edge.to}___${edge.from}`, edge.cost);
    }

    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const cost = edgeMap.get(`${u}___${v}`) || 0;
      pathSegments.push({ from: u, to: v, cost });
    }
  }

  // 1. If start location is blocked
  if (status === 'START_BLOCKED') {
    return (
      <div className="route-panel-card route-panel-error border-danger">
        <div className="route-status-header text-danger">
          <div className="status-badge-icon badge-icon-danger">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="route-status-title">{t.startBlockedTitle}</h3>
            <p className="route-status-subtitle">{t.startBlockedDesc}</p>
          </div>
        </div>

        <div className="error-action-box">
          <span className="error-node-tag">
            {startNode?.id} — {startNode?.label}
          </span>
          {onUnblockNode && startNode && (
            <button
              className="unblock-quick-btn"
              onClick={() => onUnblockNode(startNode.id)}
            >
              Unblock {startNode.id}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. If no route available
  if (status === 'NO_ROUTE') {
    return (
      <div className="route-panel-card route-panel-warning border-warning">
        <div className="route-status-header text-warning">
          <div className="status-badge-icon badge-icon-warning">
            <XCircle size={22} />
          </div>
          <div>
            <h3 className="route-status-title">{t.noRouteTitle}</h3>
            <p className="route-status-subtitle">{t.noRouteDesc}</p>
          </div>
        </div>

        {startNode && (
          <div className="no-route-meta-hint">
            <span className="meta-hint-label">{t.startLocation}:</span>
            <span className="meta-hint-val">
              {startNode.id} ({startNode.label})
            </span>
          </div>
        )}
      </div>
    );
  }

  // 3. If no starting location selected
  if (status === 'NO_START' || !startNode) {
    return (
      <div className="route-panel-card route-panel-neutral">
        <div className="route-status-header text-muted">
          <div className="status-badge-icon badge-icon-slate">
            <Navigation size={22} />
          </div>
          <div>
            <h3 className="route-status-title">{t.noStartSelectedTitle}</h3>
            <p className="route-status-subtitle">{t.noStartSelectedDesc}</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Safe Route Available (SUCCESS)
  return (
    <div className="route-panel-card route-panel-success">
      <div className="route-card-top">
        <div className="route-header-left">
          <div className="status-badge-icon badge-icon-success">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="safe-route-tag">{t.safeRoute}</span>
            <h3 className="safe-route-heading">
              {startNode.id} → {destinationNode?.id || path[path.length - 1]}
            </h3>
          </div>
        </div>

        {/* Prominent Total Cost */}
        <div className="prominent-cost-box">
          <span className="cost-box-label">{t.totalCost}</span>
          <div className="cost-box-value-wrap">
            <Zap size={22} className="cost-zap-icon" />
            <span className="cost-box-number">{totalCost}</span>
          </div>
          <span className="cost-box-unit">units</span>
        </div>
      </div>

      {/* Route Key Metrics */}
      <div className="route-metrics-row">
        <div className="route-metric-item">
          <MapPin size={15} className="metric-icon" />
          <div className="metric-text-group">
            <span className="metric-label">{t.startLocation}</span>
            <strong className="metric-value">
              {startNode.id} <span className="metric-sub">({startNode.label})</span>
            </strong>
          </div>
        </div>

        <div className="metric-divider"></div>

        <div className="route-metric-item">
          <DoorOpen size={15} className="metric-icon text-emerald" />
          <div className="metric-text-group">
            <span className="metric-label">{t.destinationExit}</span>
            <strong className="metric-value text-emerald">
              {destinationNode?.id || path[path.length - 1]}{' '}
              <span className="metric-sub">({destinationNode?.label})</span>
            </strong>
          </div>
        </div>

        <div className="metric-divider"></div>

        <div className="route-metric-item">
          <ArrowRight size={15} className="metric-icon text-cyan" />
          <div className="metric-text-group">
            <span className="metric-label">{t.corridorsTraversed}</span>
            <strong className="metric-value text-cyan">
              {corridorsCount}{' '}
              <span className="metric-sub">corridor{corridorsCount === 1 ? '' : 's'}</span>
            </strong>
          </div>
        </div>
      </div>

      {/* Evacuation Node Sequence: R1 → C1 → C2 → E1 */}
      <div className="route-sequence-container">
        <span className="sequence-label">{t.routePathTitle}:</span>
        <div className="route-nodes-ribbon">
          {path.map((nodeId, idx) => {
            const node = nodeMap.get(nodeId);
            const isFirst = idx === 0;
            const isLast = idx === path.length - 1;

            return (
              <React.Fragment key={nodeId}>
                <div
                  className={`ribbon-node-chip ${
                    isFirst
                      ? 'chip-start'
                      : isLast
                      ? 'chip-exit'
                      : 'chip-junction'
                  }`}
                  onClick={() => onSelectNode && onSelectNode(nodeId)}
                  title={`${nodeId}: ${node?.label || ''} (${node?.type || ''})`}
                >
                  <span className="chip-id">{nodeId}</span>
                  <span className="chip-label">{node?.label || ''}</span>
                </div>

                {!isLast && (
                  <div className="ribbon-arrow-wrap">
                    <ArrowRight size={14} className="ribbon-arrow" />
                    {pathSegments[idx] && (
                      <span className="ribbon-segment-cost">
                        +{pathSegments[idx].cost}
                      </span>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
