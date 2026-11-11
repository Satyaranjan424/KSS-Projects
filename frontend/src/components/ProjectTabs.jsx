import React from 'react';
import { Play, Code } from 'lucide-react';

export const ProjectTabs = ({ activeTab, onSelectTab, liveCount = 0, devCount = 0 }) => {
  const formatCount = (count) => {
    return count ?? 0;
  };

  return (
    <div className="tabs-group" role="tablist">
      {/* Live Projects Tab */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'Live' || activeTab === 'All'}
        className={`tab-btn ${activeTab === 'Live' ? 'active' : 'inactive'}`}
        onClick={() => onSelectTab('Live')}
        title={activeTab === 'Live' ? 'Click to show all projects' : 'Filter by Live Projects'}
      >
        <Play size={14} fill="currentColor" strokeWidth={0} />
        <span>Live Projects ({formatCount(liveCount)})</span>
      </button>

      {/* In Development Tab */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'In Development'}
        className={`tab-btn ${activeTab === 'In Development' ? 'active' : 'inactive'}`}
        onClick={() => onSelectTab('In Development')}
        title={activeTab === 'In Development' ? 'Click to show all projects' : 'Filter by In Development Projects'}
      >
        <Code size={15} strokeWidth={2.4} />
        <span>In Development ({formatCount(devCount)})</span>
      </button>
    </div>
  );
};
