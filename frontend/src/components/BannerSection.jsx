import React from 'react';
import { Plus } from 'lucide-react';
import { ProjectStats } from './ProjectStats';

export const BannerSection = ({
  liveCount,
  devCount,
  activeTab,
  onSelectTab,
  onOpenAddModal
}) => {
  return (
    <section className="banner-section">
      {/* Decorative Waving Ribbon Banner on Top-Right */}
      <div className="banner-ribbon-wave" aria-hidden="true">
        <svg
          viewBox="0 0 820 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="banner-wave-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bannerGradOuter" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#0866E8" stopOpacity="0.0" />
              <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="bannerGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#0866E8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M0,190 C200,205 320,85 500,145 C650,195 720,85 820,25 L820,0 L520,0 C380,0 280,105 120,135 Z"
            fill="url(#bannerGradOuter)"
          />
          <path
            d="M240,170 C380,220 520,135 660,115 C720,105 760,45 820,5 L820,85 C740,145 660,205 520,185 C380,165 280,205 240,170 Z"
            fill="url(#bannerGradInner)"
          />
        </svg>
      </div>

      <div className="banner-inner-container">
        {/* Banner Left Info Column */}
        <div className="banner-left-content">
          <h1 className="banner-main-title">
            Company <span className="banner-title-highlight">Projects</span>
          </h1>
          <p className="banner-subtitle">
            Explore our digital products and solutions. View live applications, UI designs, and project documentation.
          </p>

          {/* Dynamic Statistics Cards */}
          <div className="banner-stats-row">
            <ProjectStats
              liveCount={liveCount}
              devCount={devCount}
              activeTab={activeTab}
              onSelectTab={onSelectTab}
            />
          </div>
        </div>

        {/* Banner Right Column: "+ Add Project" Button (matching Image 2) */}
        <div className="banner-right-content">
          <button
            type="button"
            className="btn-banner-add-project"
            onClick={onOpenAddModal}
            aria-label="Add new project"
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>Add Project</span>
          </button>
        </div>
      </div>
    </section>
  );
};

