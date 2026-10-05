import React, { useState, useMemo, useCallback } from 'react';
import { validateBuildingJSON } from './utils/validator';
import { findShortestEvacuationRoute } from './utils/dijkstra';
import { translations } from './utils/i18n';
import defaultSampleBuilding from './data/sampleBuilding.json';

import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { BuildingDataSection } from './components/BuildingDataSection';
import { StartLocationSection } from './components/StartLocationSection';
import { HazardControlsSection } from './components/HazardControlsSection';
import { BuildingMap } from './components/BuildingMap';
import { RoutePanel } from './components/RoutePanel';
import { ValidationModal } from './components/ValidationModal';
import './App.css';

export function App() {
  // Localization State
  const [lang, setLang] = useState('en');
  const t = translations[lang] || translations.en;

  // Building Graph Data
  const [buildingData, setBuildingData] = useState(() => defaultSampleBuilding);

  // Simulation Hazard States
  const [blockedNodes, setBlockedNodes] = useState(() => new Set(defaultSampleBuilding.initial_state?.blocked_nodes || []));
  const [blockedEdges, setBlockedEdges] = useState(() => new Set(defaultSampleBuilding.initial_state?.blocked_edges || []));
  const [closedExits, setClosedExits] = useState(() => new Set(defaultSampleBuilding.initial_state?.closed_exits || []));

  // Selected Starting Location
  const [selectedStartId, setSelectedStartId] = useState('R1');

  // Active preset ID for indicator
  const [activePreset, setActivePreset] = useState('sample');

  // Validation Error Modal State
  const [validationError, setValidationError] = useState(null);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  // Compute Route Dynamically
  const routeResult = useMemo(() => {
    if (!buildingData || !buildingData.nodes) {
      return { status: 'NO_START', path: [], totalCost: 0, corridorsCount: 0, edgeIds: [] };
    }

    return findShortestEvacuationRoute({
      nodes: buildingData.nodes,
      edges: buildingData.edges,
      startNodeId: selectedStartId,
      blockedNodes,
      blockedEdges,
      closedExits
    });
  }, [buildingData, selectedStartId, blockedNodes, blockedEdges, closedExits]);

  // Derived counts
  const openExitsCount = useMemo(() => {
    if (!buildingData?.nodes) return 0;
    return buildingData.nodes.filter(
      (n) => n.type === 'exit' && !closedExits.has(n.id) && !blockedNodes.has(n.id)
    ).length;
  }, [buildingData, closedExits, blockedNodes]);

  const totalExitsCount = useMemo(() => {
    if (!buildingData?.nodes) return 0;
    return buildingData.nodes.filter((n) => n.type === 'exit').length;
  }, [buildingData]);

  // Node objects for display
  const startNode = useMemo(
    () => buildingData?.nodes?.find((n) => n.id === selectedStartId),
    [buildingData, selectedStartId]
  );

  const destinationExit = routeResult.destinationExit;
  const destinationNode = useMemo(
    () => buildingData?.nodes?.find((n) => n.id === destinationExit),
    [buildingData, destinationExit]
  );

  // File Import Handler
  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = JSON.parse(text);

        const validation = validateBuildingJSON(parsed);
        if (!validation.valid) {
          setValidationError(validation.error);
          return;
        }

        const validData = validation.sanitizedData;
        setBuildingData(validData);

        // Apply initial state exactly as defined in file
        const initBlockedNodes = new Set(validData.initial_state?.blocked_nodes || []);
        const initBlockedEdges = new Set(validData.initial_state?.blocked_edges || []);
        const initClosedExits = new Set(validData.initial_state?.closed_exits || []);

        setBlockedNodes(initBlockedNodes);
        setBlockedEdges(initBlockedEdges);
        setClosedExits(initClosedExits);

        // Pick suitable starting node: first unblocked room/junction
        const eligibleNodes = validData.nodes.filter(
          (n) => (n.type === 'room' || n.type === 'junction') && !initBlockedNodes.has(n.id)
        );
        const fallbackEligible = validData.nodes.filter((n) => n.type === 'room' || n.type === 'junction');

        if (eligibleNodes.length > 0) {
          setSelectedStartId(eligibleNodes[0].id);
        } else if (fallbackEligible.length > 0) {
          setSelectedStartId(fallbackEligible[0].id);
        } else {
          setSelectedStartId(null);
        }

        setActivePreset('custom');
        showToast(`${t.successLoaded} (${validData.building})`);
      } catch {
        setValidationError(t.fileParseError);
      }
    };

    reader.onerror = () => {
      setValidationError('Failed to read file from disk.');
    };

    reader.readAsText(file);
  };

  // Load Built-in Sample
  const handleLoadSample = useCallback(() => {
    setBuildingData(defaultSampleBuilding);
    setBlockedNodes(new Set(defaultSampleBuilding.initial_state?.blocked_nodes || []));
    setBlockedEdges(new Set(defaultSampleBuilding.initial_state?.blocked_edges || []));
    setClosedExits(new Set(defaultSampleBuilding.initial_state?.closed_exits || []));
    setSelectedStartId('R1');
    setActivePreset('sample');
    showToast(t.successLoaded);
  }, [showToast, t.successLoaded]);

  // Load specific test preset (for judges and demonstration)
  const handleLoadPreset = async (presetFile, presetId) => {
    try {
      const res = await fetch(presetFile);
      if (!res.ok) throw new Error('Failed to fetch preset');
      const data = await res.json();
      const validation = validateBuildingJSON(data);
      if (validation.valid) {
        setBuildingData(validation.sanitizedData);
        setBlockedNodes(new Set(validation.sanitizedData.initial_state?.blocked_nodes || []));
        setBlockedEdges(new Set(validation.sanitizedData.initial_state?.blocked_edges || []));
        setClosedExits(new Set(validation.sanitizedData.initial_state?.closed_exits || []));
        const firstRoom = validation.sanitizedData.nodes.find((n) => n.type === 'room' || n.type === 'junction');
        if (firstRoom) setSelectedStartId(firstRoom.id);
        setActivePreset(presetId);
        showToast(`Loaded preset: ${validation.sanitizedData.building}`);
      } else {
        setValidationError(validation.error);
      }
    } catch {
      // handle error gracefully
    }
  };

  // Export current building state as JSON
  const handleExportJson = () => {
    if (!buildingData) return;
    const exportObject = {
      building: buildingData.building,
      nodes: buildingData.nodes,
      edges: buildingData.edges,
      initial_state: {
        blocked_nodes: Array.from(blockedNodes),
        blocked_edges: Array.from(blockedEdges),
        closed_exits: Array.from(closedExits)
      }
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildingData.building.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle Handlers
  const handleToggleNodeBlock = (nodeId) => {
    setBlockedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleToggleEdgeBlock = (edgeId) => {
    setBlockedEdges((prev) => {
      const next = new Set(prev);
      if (next.has(edgeId)) {
        next.delete(edgeId);
      } else {
        next.add(edgeId);
      }
      return next;
    });
  };

  const handleToggleExitClose = (exitId) => {
    setClosedExits((prev) => {
      const next = new Set(prev);
      if (next.has(exitId)) {
        next.delete(exitId);
      } else {
        next.add(exitId);
      }
      return next;
    });
  };

  // Reset Simulation: restore exact initial_state from imported JSON
  const handleResetSimulation = () => {
    if (!buildingData) return;
    const initialBlockedNodes = new Set(buildingData.initial_state?.blocked_nodes || []);
    const initialBlockedEdges = new Set(buildingData.initial_state?.blocked_edges || []);
    const initialClosedExits = new Set(buildingData.initial_state?.closed_exits || []);

    setBlockedNodes(initialBlockedNodes);
    setBlockedEdges(initialBlockedEdges);
    setClosedExits(initialClosedExits);

    showToast('Simulation reset to initial state.');
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="app-toast-alert" role="status">
          <span className="toast-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Validation Error Modal */}
      <ValidationModal
        isOpen={Boolean(validationError)}
        errorMessage={validationError}
        onClose={() => setValidationError(null)}
        t={t}
      />

      {/* Global Header */}
      <Header
        lang={lang}
        setLang={setLang}
        t={t}
        routeStatus={routeResult.status}
        buildingName={buildingData?.building}
      />

      {/* Preset bar for quick competition judging */}
      <div className="presets-bar">
        <span className="presets-label">Quick Test Scenarios:</span>
        <button
          className={`preset-pill-btn ${activePreset === 'sample' ? 'active' : ''}`}
          onClick={handleLoadSample}
        >
          Sample Academic Complex (Default)
        </button>
        <button
          className={`preset-pill-btn ${activePreset === 'tie_break' ? 'active' : ''}`}
          onClick={() => handleLoadPreset('/samples/tie_break_test.json', 'tie_break')}
        >
          Tie-Breaker Test (EA vs EB)
        </button>
        <button
          className={`preset-pill-btn ${activePreset === 'disconnected' ? 'active' : ''}`}
          onClick={() => handleLoadPreset('/samples/disconnected_graph.json', 'disconnected')}
        >
          Disconnected Graph Test
        </button>
      </div>

      {/* Main Workspace Grid */}
      <main className="main-content-layout">
        {/* Left Sidebar */}
        <aside className="left-sidebar-panel">
          <BuildingDataSection
            buildingData={buildingData}
            onFileUpload={handleFileUpload}
            onLoadSample={handleLoadSample}
            onExportJson={handleExportJson}
            openExitsCount={openExitsCount}
            t={t}
          />

          <StartLocationSection
            nodes={buildingData?.nodes || []}
            selectedStartId={selectedStartId}
            onSelectStart={setSelectedStartId}
            blockedNodes={blockedNodes}
            t={t}
          />

          <HazardControlsSection
            nodes={buildingData?.nodes || []}
            edges={buildingData?.edges || []}
            blockedNodes={blockedNodes}
            blockedEdges={blockedEdges}
            closedExits={closedExits}
            onToggleNodeBlock={handleToggleNodeBlock}
            onToggleEdgeBlock={handleToggleEdgeBlock}
            onToggleExitClose={handleToggleExitClose}
            onResetSimulation={handleResetSimulation}
            t={t}
          />
        </aside>

        {/* Central Map & Route Information */}
        <section className="central-stage-panel">
          {/* Top Dashboard Stat Cards */}
          <DashboardStats
            openExitsCount={openExitsCount}
            totalExitsCount={totalExitsCount}
            blockedLocationsCount={blockedNodes.size}
            blockedCorridorsCount={blockedEdges.size}
            routeCost={routeResult.totalCost}
            routeStatus={routeResult.status}
            t={t}
          />

          {/* Interactive Map */}
          <BuildingMap
            nodes={buildingData?.nodes || []}
            edges={buildingData?.edges || []}
            startNodeId={selectedStartId}
            routeResult={routeResult}
            blockedNodes={blockedNodes}
            blockedEdges={blockedEdges}
            closedExits={closedExits}
            onSelectStart={setSelectedStartId}
            onToggleNodeBlock={handleToggleNodeBlock}
            onToggleEdgeBlock={handleToggleEdgeBlock}
            onToggleExitClose={handleToggleExitClose}
            t={t}
          />

          {/* Safe Route Panel */}
          <RoutePanel
            routeResult={routeResult}
            startNode={startNode}
            destinationNode={destinationNode}
            buildingNodes={buildingData?.nodes || []}
            edges={buildingData?.edges || []}
            onSelectNode={setSelectedStartId}
            onUnblockNode={handleToggleNodeBlock}
            t={t}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
