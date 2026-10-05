import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

export function BuildingMap({
  nodes = [],
  edges = [],
  startNodeId,
  routeResult,
  blockedNodes,
  blockedEdges,
  closedExits,
  onSelectStart,
  onToggleNodeBlock,
  onToggleEdgeBlock,
  onToggleExitClose,
  t
}) {
  const svgRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState(null);

  const activePathNodes = useMemo(() => new Set(routeResult?.path || []), [routeResult?.path]);
  const activePathEdges = useMemo(() => new Set(routeResult?.edgeIds || []), [routeResult?.edgeIds]);

  // Calculate bounding box for SVG viewBox
  const viewBox = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return '0 0 800 600';
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }

    const padding = 80;
    const w = Math.max(maxX - minX + padding * 2, 400);
    const h = Math.max(maxY - minY + padding * 2, 300);

    const x = minX - padding;
    const y = minY - padding;

    return `${x} ${y} ${w} ${h}`;
  }, [nodes]);

  // Node Map for fast coordinate lookup
  const nodeMap = useMemo(() => {
    const map = new Map();
    for (const n of nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [nodes]);

  // Pan Handlers
  const handleMouseDown = (e) => {
    // Only pan on background drag
    if (e.target.tagName === 'svg' || e.target.classList.contains('map-bg-grid')) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, 0.5), 3);
    });
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Node Click Behavior
  const handleNodeClick = (node, e) => {
    e.stopPropagation();
    if (node.type === 'exit') {
      onToggleExitClose(node.id);
    } else {
      // Room or Junction
      if (blockedNodes.has(node.id)) {
        onToggleNodeBlock(node.id);
      } else {
        onSelectStart(node.id);
      }
    }
  };

  return (
    <div className="map-dashboard-card">
      <div className="map-card-header">
        <div className="map-title-row">
          <div className="map-status-dot"></div>
          <h2 className="map-card-title">Evacuation Floorplan Map</h2>
          <span className="map-scale-tag">UNDIRECTED GRAPH</span>
        </div>

        {/* Zoom & View Controls */}
        <div className="map-view-controls">
          <button
            className="map-control-btn"
            onClick={() => handleZoom(0.2)}
            title={t.zoomIn}
            aria-label={t.zoomIn}
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="map-control-btn"
            onClick={() => handleZoom(-0.2)}
            title={t.zoomOut}
            aria-label={t.zoomOut}
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="map-control-btn"
            onClick={handleResetView}
            title={t.resetView}
            aria-label={t.resetView}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        className="map-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          className="building-svg"
          viewBox={viewBox}
          style={{
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern
              id="bg-grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1" fill="#1e293b" opacity="0.6" />
            </pattern>

            {/* Glowing cyan filter for active route */}
            <filter id="route-cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Emerald glow filter for exit */}
            <filter id="exit-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Map Content Group subjected to pan and zoom */}
          <g
            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
            style={{ transformOrigin: 'center' }}
          >
            {/* Background Grid */}
            <rect
              className="map-bg-grid"
              x="-5000"
              y="-5000"
              width="10000"
              height="10000"
              fill="url(#bg-grid-pattern)"
            />

            {/* 1. EDGES / CORRIDORS */}
            <g className="edges-layer">
              {edges.map((edge) => {
                const source = nodeMap.get(edge.from);
                const target = nodeMap.get(edge.to);
                if (!source || !target) return null;

                const isEdgeBlocked = blockedEdges.has(edge.id);
                const isFromBlocked = blockedNodes.has(edge.from);
                const isToBlocked = blockedNodes.has(edge.to);
                const isSeveredByNode = isFromBlocked || isToBlocked;
                const isActiveRoute = activePathEdges.has(edge.id);

                // Midpoint for cost badge
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g
                    key={edge.id}
                    className={`edge-group ${isActiveRoute ? 'edge-active' : ''} ${
                      isEdgeBlocked ? 'edge-blocked' : isSeveredByNode ? 'edge-severed' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleEdgeBlock(edge.id);
                    }}
                    onMouseEnter={() =>
                      setHoveredItem({
                        type: 'edge',
                        id: edge.id,
                        from: edge.from,
                        to: edge.to,
                        cost: edge.cost,
                        blocked: isEdgeBlocked,
                        severed: isSeveredByNode
                      })
                    }
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Invisible fat line for easier clicking */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="transparent"
                      strokeWidth={16}
                    />

                    {/* Visual corridor line */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      className={`corridor-line ${
                        isActiveRoute
                          ? 'corridor-route'
                          : isEdgeBlocked
                          ? 'corridor-blocked'
                          : isSeveredByNode
                          ? 'corridor-severed'
                          : 'corridor-normal'
                      }`}
                      filter={isActiveRoute ? 'url(#route-cyan-glow)' : undefined}
                    />

                    {/* Edge Cost Badge */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-14"
                        y="-10"
                        width="28"
                        height="20"
                        rx="5"
                        className={`cost-badge-bg ${
                          isActiveRoute
                            ? 'cost-badge-route'
                            : isEdgeBlocked || isSeveredByNode
                            ? 'cost-badge-blocked'
                            : 'cost-badge-normal'
                        }`}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        className="cost-badge-text"
                      >
                        {edge.cost}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* 2. NODES LAYER */}
            <g className="nodes-layer">
              {nodes.map((node) => {
                const isSelectedStart = node.id === startNodeId;
                const isBlocked = blockedNodes.has(node.id);
                const isClosedExit = node.type === 'exit' && closedExits.has(node.id);
                const isOnActiveRoute = activePathNodes.has(node.id);
                const isDestination = routeResult?.destinationExit === node.id;

                // Color palette selection
                let nodeFill = '#3b82f6'; // Room default
                let nodeStroke = '#60a5fa';
                let radius = 22;

                if (node.type === 'junction') {
                  nodeFill = '#7c3aed';
                  nodeStroke = '#a78bfa';
                  radius = 19;
                } else if (node.type === 'exit') {
                  if (isClosedExit) {
                    nodeFill = '#991b1b'; // Muted dark red
                    nodeStroke = '#ef4444';
                  } else {
                    nodeFill = '#059669'; // Emerald
                    nodeStroke = '#34d399';
                  }
                  radius = 24;
                }

                if (isBlocked) {
                  nodeFill = '#dc2626'; // Bright Red
                  nodeStroke = '#f87171';
                }

                return (
                  <g
                    key={node.id}
                    className={`node-group node-${node.type} ${
                      isSelectedStart ? 'node-selected-start' : ''
                    } ${isBlocked ? 'node-blocked' : ''} ${
                      isClosedExit ? 'node-closed-exit' : ''
                    } ${isOnActiveRoute ? 'node-on-route' : ''}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => handleNodeClick(node, e)}
                    onMouseEnter={() =>
                      setHoveredItem({
                        type: 'node',
                        id: node.id,
                        label: node.label,
                        nodeType: node.type,
                        x: node.x,
                        y: node.y,
                        blocked: isBlocked,
                        closed: isClosedExit
                      })
                    }
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selected Starting location subtle pulsing outer ring */}
                    {isSelectedStart && (
                      <circle
                        r={radius + 10}
                        className={`selected-pulse-ring ${
                          isBlocked ? 'pulse-ring-danger' : 'pulse-ring-active'
                        }`}
                      />
                    )}

                    {/* Destination Exit Glow Ring */}
                    {isDestination && (
                      <circle
                        r={radius + 8}
                        className="destination-halo-ring"
                        filter="url(#exit-glow)"
                      />
                    )}

                    {/* Active Route Glow */}
                    {isOnActiveRoute && !isSelectedStart && !isDestination && (
                      <circle
                        r={radius + 6}
                        className="route-halo-ring"
                        filter="url(#route-cyan-glow)"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={radius}
                      fill={nodeFill}
                      stroke={nodeStroke}
                      strokeWidth={isSelectedStart ? 3.5 : 2}
                      className="node-main-circle"
                    />

                    {/* Icon or indicator inside node */}
                    {isBlocked ? (
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        ✕
                      </text>
                    ) : isClosedExit ? (
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#fecaca"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        🔒
                      </text>
                    ) : node.type === 'exit' ? (
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        🚪
                      </text>
                    ) : (
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {node.id}
                      </text>
                    )}

                    {/* Node ID & Label Pill below */}
                    <g transform="translate(0, 32)">
                      <rect
                        x="-48"
                        y="-9"
                        width="96"
                        height="18"
                        rx="4"
                        className="node-label-pill-bg"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        className="node-label-pill-text"
                      >
                        {node.label.length > 13 ? `${node.label.slice(0, 11)}..` : node.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Hover Info Tooltip */}
        {hoveredItem && (
          <div className="map-floating-tooltip">
            {hoveredItem.type === 'node' ? (
              <div>
                <div className="tooltip-header">
                  <strong>{hoveredItem.id}</strong> — {hoveredItem.label}
                </div>
                <div className="tooltip-sub">
                  Type: <span className="text-cyan">{hoveredItem.nodeType}</span>
                  {hoveredItem.blocked && <span className="text-danger"> (Blocked)</span>}
                  {hoveredItem.closed && <span className="text-danger"> (Closed)</span>}
                </div>
                <div className="tooltip-action-hint">
                  {hoveredItem.nodeType === 'exit'
                    ? 'Click to toggle open/closed'
                    : hoveredItem.blocked
                    ? 'Click to unblock'
                    : 'Click to select as start location'}
                </div>
              </div>
            ) : (
              <div>
                <div className="tooltip-header">
                  Corridor <strong>{hoveredItem.id}</strong> ({hoveredItem.from} ↔ {hoveredItem.to})
                </div>
                <div className="tooltip-sub">
                  Cost: <span className="text-cyan">{hoveredItem.cost} units</span>
                  {hoveredItem.blocked && <span className="text-danger"> (Blocked)</span>}
                  {hoveredItem.severed && <span className="text-amber"> (Severed by node)</span>}
                </div>
                <div className="tooltip-action-hint">Click corridor to toggle hazard</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Visual Legend */}
      <div className="map-legend-bar">
        <span className="legend-title">{t.legendTitle}:</span>
        <div className="legend-items-list">
          <div className="legend-item">
            <span className="legend-swatch swatch-room"></span>
            <span>{t.legendRoom}</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch swatch-junction"></span>
            <span>{t.legendJunction}</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch swatch-open-exit"></span>
            <span>{t.legendOpenExit}</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch swatch-blocked-node"></span>
            <span>{t.legendBlockedNode}</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch swatch-closed-exit"></span>
            <span>{t.legendClosedExit}</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch swatch-normal-corridor"></span>
            <span>{t.legendNormalCorridor}</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch swatch-active-route"></span>
            <span>{t.legendActiveRoute}</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch swatch-blocked-corridor"></span>
            <span>{t.legendBlockedCorridor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
