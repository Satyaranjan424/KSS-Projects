import React from 'react';

export const TopNavbar = () => {
  return (
    <header className="top-navbar">
      <div className="top-navbar-content">
        <div className="brand-wrapper">
          <img
            src="/logo-icon.png"
            alt="Kalpanaaa Logo"
            className="brand-emblem"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <img
            src="/logo-text.png"
            alt="KALPANAAA SOFTWARE SOLUTIONS PVT LTD"
            className="brand-text-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('brand-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div id="brand-fallback" className="brand-title-fallback" style={{ display: 'none' }}>
            <span className="brand-fallback-name">KALPANAAA</span>
            <span className="brand-fallback-sub">SOFTWARE SOLUTIONS PVT LTD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

