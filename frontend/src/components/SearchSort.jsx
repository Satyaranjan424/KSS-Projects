import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

export const SearchSort = ({ searchQuery, onSearchChange, sortBy, onSortChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { id: 'latest', label: 'Latest' },
    { id: 'oldest', label: 'Oldest' },
    { id: 'az', label: 'A – Z' },
    { id: 'za', label: 'Z – A' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentOption = sortOptions.find((opt) => opt.id === sortBy) || sortOptions[0];

  return (
    <div className="search-sort-group">
      {/* Search Input Field */}
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search projects by name, description, tech stack, or category"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Sort Dropdown: "Sort by: Latest ⌵" */}
      <div className="sort-wrapper" ref={dropdownRef}>
        <button
          type="button"
          className="sort-btn"
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-expanded={dropdownOpen}
          aria-label="Sort projects"
        >
          <span className="sort-label-text">
            Sort by: <strong className="sort-current-val">{currentOption.label}</strong>
          </span>
          <ChevronDown size={14} className="sort-chevron" />
        </button>

        {dropdownOpen && (
          <div className="sort-dropdown">
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`sort-option-btn ${sortBy === opt.id ? 'selected' : ''}`}
                onClick={() => {
                  onSortChange(opt.id);
                  setDropdownOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
