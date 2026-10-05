import React from 'react';
import { Compass, Globe2 } from 'lucide-react';

export function Header({ lang, setLang, t, routeStatus, buildingName }) {
  const getStatusBadge = () => {
    switch (routeStatus) {
      case 'SUCCESS':
        return {
          label: t.routeFound,
          colorClass: 'status-success',
          dotClass: 'dot-success'
        };
      case 'START_BLOCKED':
        return {
          label: t.startBlockedWarning,
          colorClass: 'status-danger',
          dotClass: 'dot-danger'
        };
      case 'NO_ROUTE':
        return {
          label: t.noRouteWarning,
          colorClass: 'status-warning',
          dotClass: 'dot-warning'
        };
      default:
        return {
          label: t.systemActive,
          colorClass: 'status-neutral',
          dotClass: 'dot-neutral'
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-logo">
          <div className="logo-icon-wrap">
            <Compass className="logo-icon" size={24} />
            <span className="logo-pulse"></span>
          </div>
          <div>
            <div className="logo-title-row">
              <h1 className="logo-title">{t.appTitle}</h1>
              <span className="app-tag">OPS SIMULATOR</span>
            </div>
            <p className="logo-subtitle">{t.appSubtitle}</p>
          </div>
        </div>

        {buildingName && (
          <div className="header-building-badge" title={buildingName}>
            <span className="badge-dot"></span>
            <span className="badge-text">{buildingName}</span>
          </div>
        )}
      </div>

      <div className="header-right">
        {/* System Status Indicator */}
        <div className={`system-status-indicator ${status.colorClass}`}>
          <span className={`status-dot ${status.dotClass}`}></span>
          <span className="status-label">{status.label}</span>
        </div>

        {/* English / Bangla Language Toggle */}
        <button
          className="lang-toggle-btn"
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          title={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
          aria-label="Toggle Language"
        >
          <Globe2 size={16} />
          <span className="lang-text">{lang === 'en' ? 'বাংলা' : 'English'}</span>
        </button>
      </div>
    </header>
  );
}
