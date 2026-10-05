import React, { useRef, useState } from 'react';
import { UploadCloud, Download, RefreshCw, FolderOpen, FileCheck, Layers, Share2, DoorOpen } from 'lucide-react';

export function BuildingDataSection({
  buildingData,
  onFileUpload,
  onLoadSample,
  onExportJson,
  openExitsCount,
  t
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
      e.target.value = '';
    }
  };

  const roomsCount = buildingData?.nodes?.filter(n => n.type === 'room').length || 0;
  const junctionsCount = buildingData?.nodes?.filter(n => n.type === 'junction').length || 0;
  const totalExits = buildingData?.nodes?.filter(n => n.type === 'exit').length || 0;

  return (
    <div className="sidebar-section building-data-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <FolderOpen size={16} className="section-icon text-cyan" />
          <h2 className="section-title">{t.buildingData}</h2>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload building.json"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          style={{ display: 'none' }}
        />
        <div className="drop-corner-bracket top-left"></div>
        <div className="drop-corner-bracket top-right"></div>
        <div className="drop-corner-bracket bottom-left"></div>
        <div className="drop-corner-bracket bottom-right"></div>

        <div className="drop-zone-content">
          <div className="upload-icon-container">
            <UploadCloud className="upload-icon" size={24} />
          </div>
          <div className="drop-texts">
            <span className="drop-main-text">{t.dropText}</span>
            <button
              type="button"
              className="browse-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileCheck size={13} />
              <span>{t.browseFiles}</span>
            </button>
          </div>
          <div className="drop-format-tags">
            <span className="format-tag">.json format</span>
            <span className="format-tag">2–60 nodes</span>
            <span className="format-tag">1–150 edges</span>
          </div>
        </div>
      </div>

      {/* Building Summary Metadata Card */}
      {buildingData && (
        <div className="building-meta-card">
          <div className="meta-building-header">
            <span className="meta-label">{t.buildingName}</span>
            <h3 className="meta-value">{buildingData.building}</h3>
          </div>

          <div className="meta-grid">
            <div className="meta-stat-item">
              <span className="meta-stat-label">
                <Layers size={11} className="meta-inline-icon" />
                {t.totalNodes}
              </span>
              <span className="meta-stat-number">{buildingData.nodes.length}</span>
              <span className="meta-stat-sub">{roomsCount} R · {junctionsCount} J</span>
            </div>

            <div className="meta-stat-item">
              <span className="meta-stat-label">
                <Share2 size={11} className="meta-inline-icon" />
                {t.corridorsCount}
              </span>
              <span className="meta-stat-number">{buildingData.edges.length}</span>
              <span className="meta-stat-sub">undirected</span>
            </div>

            <div className="meta-stat-item">
              <span className="meta-stat-label">
                <DoorOpen size={11} className="meta-inline-icon" />
                {t.openExitsCount}
              </span>
              <span className="meta-stat-number highlight-emerald">
                {openExitsCount} <span className="meta-stat-total">/ {totalExits}</span>
              </span>
              <span className="meta-stat-sub">open</span>
            </div>
          </div>

          <div className="building-actions-row">
            <button
              className="tactical-btn-secondary"
              onClick={onLoadSample}
              title="Reset to default sample building complex"
            >
              <RefreshCw size={13} />
              <span>{t.loadSample}</span>
            </button>

            <button
              className="tactical-btn-secondary"
              onClick={onExportJson}
              title="Export current building and hazards as JSON"
            >
              <Download size={13} />
              <span>{t.downloadJson}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
