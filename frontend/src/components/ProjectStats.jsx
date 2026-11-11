import React from 'react';
import { Play, Code } from 'lucide-react';

export const ProjectStats = ({ liveCount = 0, devCount = 0, activeTab, onSelectTab }) => {
  const formatCount = (count) => {
    return count ?? 0;
  };

  return (
    <div className="stats-container">
      {/* Live Projects Stat Card */}
      <div
        className={`stat-card live-theme ${activeTab === 'Live' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('Live')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelectTab && onSelectTab('Live');
          }
        }}
      >
        <div className="stat-icon-wrapper">
          <Play size={20} fill="currentColor" strokeWidth={0} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{formatCount(liveCount)}</span>
          <span className="stat-label">Live Projects</span>
        </div>
      </div>

      {/* In Development Stat Card */}
      <div
        className={`stat-card dev-theme ${activeTab === 'In Development' ? 'active' : ''}`}
        onClick={() => onSelectTab && onSelectTab('In Development')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelectTab && onSelectTab('In Development');
          }
        }}
      >
        <div className="stat-icon-wrapper">
          <Code size={20} strokeWidth={2.4} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{formatCount(devCount)}</span>
          <span className="stat-label">In Development</span>
        </div>
      </div>
    </div>
  );
};

