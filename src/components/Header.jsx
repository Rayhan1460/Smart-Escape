import React from 'react';
import { Compass, Globe2, Building2, Radio } from 'lucide-react';

export function Header({ lang, setLang, t, routeStatus, buildingName }) {
  const getStatusBadge = () => {
    switch (routeStatus) {
      case 'SUCCESS':
        return {
          label: t.routeFound,
          colorClass: 'status-success',
          dotClass: 'dot-success',
          isLive: true
        };
      case 'START_BLOCKED':
        return {
          label: t.startBlockedWarning,
          colorClass: 'status-danger',
          dotClass: 'dot-danger',
          isLive: false
        };
      case 'NO_ROUTE':
        return {
          label: t.noRouteWarning,
          colorClass: 'status-warning',
          dotClass: 'dot-warning',
          isLive: false
        };
      default:
        return {
          label: t.systemActive,
          colorClass: 'status-neutral',
          dotClass: 'dot-neutral',
          isLive: true
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-logo">
          <div className="logo-icon-wrap" aria-hidden="true">
            <Compass className="logo-icon" size={22} />
            <span className="logo-pulse-ring"></span>
          </div>
          <div className="logo-text-block">
            <div className="logo-title-row">
              <h1 className="logo-title">SMART ESCAPE</h1>
              <span className="app-tag">OPS SIMULATOR</span>
            </div>
            <p className="logo-subtitle">Interactive Evacuation Route Simulator</p>
          </div>
        </div>

        {buildingName && (
          <div className="header-building-badge" title={`Loaded Building: ${buildingName}`}>
            <Building2 size={14} className="building-badge-icon" />
            <span className="badge-dot"></span>
            <span className="badge-text">{buildingName}</span>
          </div>
        )}
      </div>

      <div className="header-right">
        {/* Live System Status Indicator */}
        <div className={`system-status-indicator ${status.colorClass}`}>
          <div className="status-dot-container">
            <span className={`status-dot ${status.dotClass}`}></span>
            {status.isLive && <span className={`status-dot-pulse ${status.dotClass}`}></span>}
          </div>
          <Radio size={13} className="status-radio-icon" />
          <span className="status-label">{status.label}</span>
        </div>

        {/* English / Bangla Language Toggle */}
        <button
          className="lang-toggle-btn"
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          title={lang === 'en' ? 'Switch interface to বাংলা' : 'Switch interface to English'}
          aria-label="Toggle Language"
        >
          <Globe2 size={15} />
          <span className={`lang-pill ${lang === 'en' ? 'lang-active' : ''}`}>EN</span>
          <span className="lang-divider">/</span>
          <span className={`lang-pill ${lang === 'bn' ? 'lang-active' : ''}`}>বাং</span>
        </button>
      </div>
    </header>
  );
}
