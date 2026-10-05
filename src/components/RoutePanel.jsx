import React from 'react';
import {
  Navigation,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Zap,
  MapPin,
  DoorOpen,
  Route,
  CheckCircle2
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
        <div className="route-status-header">
          <div className="status-badge-icon badge-icon-danger">
            <AlertTriangle size={24} />
          </div>
          <div className="status-header-text">
            <span className="route-alert-tag-danger">CRITICAL HAZARD</span>
            <h3 className="route-status-title text-danger">{t.startBlockedTitle}</h3>
            <p className="route-status-subtitle">{t.startBlockedDesc}</p>
          </div>
        </div>

        <div className="error-action-box">
          <div className="error-node-info">
            <span className="error-node-label">Compromised Origin:</span>
            <span className="error-node-tag">
              {startNode?.id} — {startNode?.label}
            </span>
          </div>
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
        <div className="route-status-header">
          <div className="status-badge-icon badge-icon-warning">
            <XCircle size={24} />
          </div>
          <div className="status-header-text">
            <span className="route-alert-tag-warning">EVACUATION IMPOSSIBLE</span>
            <h3 className="route-status-title text-warning">{t.noRouteTitle}</h3>
            <p className="route-status-subtitle">{t.noRouteDesc}</p>
          </div>
        </div>

        {startNode && (
          <div className="no-route-meta-hint">
            <span className="meta-hint-label">{t.startLocation}:</span>
            <span className="meta-hint-val">
              {startNode.id} ({startNode.label})
            </span>
            <span className="meta-hint-sub">· All corridors to open exits are severed or exits are closed</span>
          </div>
        )}
      </div>
    );
  }

  // 3. If no starting location selected
  if (status === 'NO_START' || !startNode) {
    return (
      <div className="route-panel-card route-panel-neutral">
        <div className="route-status-header">
          <div className="status-badge-icon badge-icon-slate">
            <Navigation size={22} />
          </div>
          <div className="status-header-text">
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
            <ShieldCheck size={26} />
          </div>
          <div className="route-heading-group">
            <div className="route-tag-row">
              <span className="safe-route-tag">{t.safeRoute}</span>
              <span className="live-verified-pill">
                <CheckCircle2 size={11} /> VERIFIED SHORTEST PATH
              </span>
            </div>
            <h3 className="safe-route-heading">
              <span className="route-head-node origin-node">{startNode.id}</span>
              <span className="route-head-arrow">→</span>
              <span className="route-head-node exit-node">{destinationNode?.id || path[path.length - 1]}</span>
            </h3>
          </div>
        </div>

        {/* Prominent Total Cost Card */}
        <div className="prominent-cost-box">
          <span className="cost-box-label">{t.totalCost}</span>
          <div className="cost-box-value-wrap">
            <Zap size={20} className="cost-zap-icon" />
            <span className="cost-box-number">{totalCost}</span>
            <span className="cost-box-unit">units</span>
          </div>
          <span className="cost-box-sub">lowest possible cost</span>
        </div>
      </div>

      {/* Route Key Metrics Row */}
      <div className="route-metrics-row">
        <div className="route-metric-item">
          <div className="metric-icon-wrap icon-wrap-blue">
            <MapPin size={15} />
          </div>
          <div className="metric-text-group">
            <span className="metric-label">{t.startLocation}</span>
            <strong className="metric-value">
              {startNode.id} <span className="metric-sub">({startNode.label})</span>
            </strong>
          </div>
        </div>

        <div className="metric-divider"></div>

        <div className="route-metric-item">
          <div className="metric-icon-wrap icon-wrap-emerald">
            <DoorOpen size={15} />
          </div>
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
          <div className="metric-icon-wrap icon-wrap-cyan">
            <Route size={15} />
          </div>
          <div className="metric-text-group">
            <span className="metric-label">{t.corridorsTraversed}</span>
            <strong className="metric-value text-cyan">
              {corridorsCount}{' '}
              <span className="metric-sub">corridor{corridorsCount === 1 ? '' : 's'}</span>
            </strong>
          </div>
        </div>
      </div>

      {/* Evacuation Timeline Route Sequence */}
      <div className="route-sequence-container">
        <div className="sequence-header-row">
          <span className="sequence-label">{t.routePathTitle}</span>
          <span className="sequence-count-tag">{path.length} Waypoints</span>
        </div>

        <div className="timeline-track-wrap">
          <div className="timeline-connector-line"></div>
          <div className="route-nodes-ribbon">
            {path.map((nodeId, idx) => {
              const node = nodeMap.get(nodeId);
              const isFirst = idx === 0;
              const isLast = idx === path.length - 1;

              return (
                <React.Fragment key={nodeId}>
                  <div
                    className={`timeline-node-card ${
                      isFirst
                        ? 'card-origin'
                        : isLast
                        ? 'card-destination'
                        : 'card-waypoint'
                    }`}
                    onClick={() => onSelectNode && onSelectNode(nodeId)}
                    title={`${nodeId}: ${node?.label || ''} (${node?.type || ''}) — Click to focus`}
                  >
                    <div className="timeline-step-indicator">
                      {isFirst ? 'START' : isLast ? 'SAFE EXIT' : `HOP ${idx}`}
                    </div>
                    <div className="timeline-chip-content">
                      <span className="timeline-node-id">{nodeId}</span>
                      <span className="timeline-node-label">{node?.label || ''}</span>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="timeline-segment-connector">
                      <div className="segment-line"></div>
                      <div className="segment-cost-badge">
                        <ArrowRight size={11} className="segment-arrow-icon" />
                        <span>+{pathSegments[idx]?.cost || 0}</span>
                      </div>
                      <div className="segment-line"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
