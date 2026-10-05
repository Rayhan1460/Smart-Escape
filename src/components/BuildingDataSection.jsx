import React, { useRef, useState } from 'react';
import { UploadCloud, Download, RefreshCw, FolderOpen } from 'lucide-react';

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
      // Reset input value so re-uploading the same file works
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
          <FolderOpen size={17} className="section-icon" />
          <h2 className="section-title">{t.buildingData}</h2>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
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
        <div className="drop-zone-content">
          <UploadCloud className="upload-icon" size={28} />
          <div className="drop-texts">
            <span className="drop-main-text">{t.dropText}</span>
            <button
              type="button"
              className="browse-link-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {t.browseFiles}
            </button>
          </div>
          <span className="drop-format-hint">.json format (2-60 nodes, 1-150 edges)</span>
        </div>
      </div>

      {/* Building Summary Metadata */}
      {buildingData && (
        <div className="building-meta-card">
          <div className="meta-row meta-building-name">
            <span className="meta-label">{t.buildingName}</span>
            <strong className="meta-value">{buildingData.building}</strong>
          </div>

          <div className="meta-grid">
            <div className="meta-stat-item">
              <span className="meta-stat-label">{t.totalNodes}</span>
              <span className="meta-stat-number">{buildingData.nodes.length}</span>
              <span className="meta-stat-sub">({roomsCount} R / {junctionsCount} J)</span>
            </div>

            <div className="meta-stat-item">
              <span className="meta-stat-label">{t.corridorsCount}</span>
              <span className="meta-stat-number">{buildingData.edges.length}</span>
              <span className="meta-stat-sub">undirected</span>
            </div>

            <div className="meta-stat-item">
              <span className="meta-stat-label">{t.openExitsCount}</span>
              <span className="meta-stat-number highlight-emerald">
                {openExitsCount} <span className="meta-stat-total">/ {totalExits}</span>
              </span>
              <span className="meta-stat-sub">accessible</span>
            </div>
          </div>

          <div className="building-actions-row">
            <button
              className="secondary-btn"
              onClick={onLoadSample}
              title="Reload sample building with 8 nodes and standard scenarios"
            >
              <RefreshCw size={14} />
              <span>{t.loadSample}</span>
            </button>

            <button
              className="secondary-btn"
              onClick={onExportJson}
              title="Download currently loaded building as JSON"
            >
              <Download size={14} />
              <span>{t.downloadJson}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
