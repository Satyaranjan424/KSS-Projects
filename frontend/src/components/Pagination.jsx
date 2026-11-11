import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  totalFiltered,
  pageStartIndex,
  pageEndIndex,
  onPageChange
}) => {
  if (totalFiltered <= 0) return null;

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-bar" aria-label="Pagination Navigation">
      {/* Dynamic Summary Text */}
      <div className="pagination-summary">
        Showing <strong>{pageStartIndex} – {pageEndIndex}</strong> of <strong>{totalFiltered}</strong> projects
      </div>

      {/* Control Buttons */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* Previous Page */}
          <button
            type="button"
            className="pagination-arrow-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page Number Buttons */}
          <div className="pagination-numbers">
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                className={`pagination-num-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Next Page */}
          <button
            type="button"
            className="pagination-arrow-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next Page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
