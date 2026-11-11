import React, { useEffect } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import '../styles/add-project-modal.css';

export const DeleteConfirmModal = ({ isOpen, project, onClose, onConfirm }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const statusColor = project.status === 'live'
    ? { bg: '#ECFDF5', color: '#059669', border: '#6EE7B7' }
    : { bg: '#FFF7ED', color: '#D97706', border: '#FDE68A' };

  return (
    <div
      className="apm-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="apm-modal"
        style={{ maxWidth: '460px', maxHeight: 'unset' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="apm-header">
          <div
            className="ic"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FEF2F2',
              color: '#EF4444',
              border: '1.5px solid #FCA5A5',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Trash2 size={20} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 id="delete-modal-title" style={{ color: '#171a2b', margin: 0 }}>
              Delete project
            </h1>
            <p style={{ margin: '2px 0 0', color: '#6a6f87', fontSize: 13 }}>
              This action is permanent and cannot be undone.
            </p>
          </div>
          <button
            className="apm-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ flexShrink: 0 }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 8px' }}>
          {/* Warning banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: '#FFF8F8',
              border: '1px solid #FEE2E2',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 20,
            }}
          >
            <AlertTriangle
              size={16}
              strokeWidth={2.3}
              style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }}
            />
            <p style={{ margin: 0, color: '#7F1D1D', fontSize: 13.5, lineHeight: 1.55 }}>
              You are about to permanently delete{' '}
              <strong style={{ color: '#DC2626' }}>{project.name}</strong>.
              All project details, links, and uploaded assets will be removed.
            </p>
          </div>

          {/* Project info chips */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            {/* Project name chip */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#334155',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Trash2 size={11} style={{ color: '#94A3B8' }} />
              {project.name}
            </span>

            {/* Status chip */}
            {project.status && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: statusColor.bg,
                  border: `1px solid ${statusColor.border}`,
                  color: statusColor.color,
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: statusColor.color,
                    display: 'inline-block',
                  }}
                />
                {project.status === 'live' ? 'Live' : 'In Development'}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="apm-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            className="apm-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="apm-btn"
            style={{
              background: '#EF4444',
              borderColor: '#DC2626',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#DC2626';
              e.currentTarget.style.borderColor = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#EF4444';
              e.currentTarget.style.borderColor = '#DC2626';
            }}
            onClick={() => {
              onConfirm(project.id);
              onClose();
            }}
          >
            <Trash2 size={15} strokeWidth={2.2} />
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
};
