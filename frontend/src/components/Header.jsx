import React from 'react';

export const Header = () => {
  return (
    <header className="company-header">
      {/* Decorative Waving Ribbon Banner on Top-Right */}
      <div className="header-banner-wave" aria-hidden="true">
        <svg
          viewBox="0 0 800 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="banner-wave-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradOuter" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#0866E8" stopOpacity="0.0" />
              <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="waveGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#0866E8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Main graceful flowing 3D ribbon curves */}
          <path
            d="M0,180 C200,195 320,80 500,140 C650,190 720,80 800,20 L800,0 L520,0 C380,0 280,100 120,130 Z"
            fill="url(#waveGradOuter)"
          />
          <path
            d="M240,160 C380,210 520,130 660,110 C720,100 760,40 800,0 L800,80 C740,140 660,200 520,180 C380,160 280,200 240,160 Z"
            fill="url(#waveGradInner)"
          />
        </svg>
      </div>

      {/* Brand Logo Row */}
      <div className="header-top-row">
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

      {/* Main Heading & Subtitle */}
      <div className="header-headings">
        <h1 className="main-title">
          Company <span className="main-title-highlight">Projects</span>
        </h1>
        <p className="main-subtitle">
          Explore our digital products and solutions. View live applications, UI designs, and project documentation.
        </p>
      </div>
    </header>
  );
};
