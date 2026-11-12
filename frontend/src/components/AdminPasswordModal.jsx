/**
 * AdminPasswordModal
 *
 * A reusable modal that prompts for the admin password before any
 * protected CRUD operation (Add / Edit / Delete project).
 *
 * Props:
 *   isOpen        {boolean}  — controls visibility
 *   actionLabel   {string}   — e.g. "Add Project", "Edit Project", "Delete Project"
 *   onVerified    {fn}       — called with no args after successful verification
 *   onCancel      {fn}       — called when user clicks Cancel or presses Escape
 *   verifyPassword {fn}      — async (password) => { success, error } from useAdminAuth
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, Eye, EyeOff, X, Loader2, Lock } from 'lucide-react';
import '../styles/admin-password-modal.css';

export const AdminPasswordModal = ({
  isOpen,
  actionLabel = 'Continue',
  onVerified,
  onCancel,
  verifyPassword,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsLoading(false);
      // Focus input after paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isLoading, onCancel]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (!password.trim() || isLoading) return;

    setError('');
    setIsLoading(true);

    const result = await verifyPassword(password.trim());

    setIsLoading(false);

    if (result.success) {
      setPassword('');
      onVerified();
    } else {
      setError(result.error || 'Incorrect password. Please try again.');
      // Shake the input
      inputRef.current?.classList.add('apm-input-shake');
      setTimeout(() => inputRef.current?.classList.remove('apm-input-shake'), 500);
    }
  }, [password, isLoading, verifyPassword, onVerified]);

  if (!isOpen) return null;

  return (
    <div
      className="apm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div className="apm-modal admin-pw-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="apm-header">
          <div className="ic" style={{
            background: '#EFF6FF',
            color: '#0866E8',
            border: '1.5px solid #BFDBFE',
          }}>
            <Lock size={20} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 id="admin-modal-title" style={{ color: '#171a2b', margin: 0, fontSize: 17 }}>
              Admin Access Required
            </h1>
            <p style={{ margin: '3px 0 0', color: '#6a6f87', fontSize: 13 }}>
              Enter the admin password to <strong>{actionLabel}</strong>.
            </p>
          </div>
          <button
            className="apm-close-btn"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancel"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ padding: '24px' }}>

            {/* Shield icon section */}
            <div className="admin-pw-shield-row">
              <div className="admin-pw-shield-icon">
                <ShieldCheck size={28} strokeWidth={1.8} />
              </div>
              <p className="admin-pw-desc">
                This action is restricted to administrators only. Verify your identity to continue.
              </p>
            </div>

            {/* Password input */}
            <div className="admin-pw-field">
              <label htmlFor="admin-password-input" className="admin-pw-label">
                Admin Password
              </label>
              <div className="admin-pw-input-wrapper">
                <input
                  ref={inputRef}
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className={`admin-pw-input${error ? ' admin-pw-input--error' : ''}`}
                  placeholder="Enter admin password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  aria-describedby={error ? 'admin-pw-error' : undefined}
                />
                <button
                  type="button"
                  className="admin-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword
                    ? <EyeOff size={16} strokeWidth={2} />
                    : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <p id="admin-pw-error" className="admin-pw-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="apm-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="apm-btn"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apm-btn admin-pw-submit-btn"
              disabled={!password.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} strokeWidth={2.3} className="admin-pw-spinner" />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck size={15} strokeWidth={2.3} />
                  Verify &amp; Continue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
