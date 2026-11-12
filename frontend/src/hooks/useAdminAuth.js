/**
 * useAdminAuth — Centralized admin session management hook.
 *
 * Stores a short-lived JWT (from POST /api/v1/admin/verify-password) in
 * memory only (never localStorage / sessionStorage / cookies from JS).
 * The token auto-expires after ADMIN_SESSION_DURATION seconds (default 15 min).
 *
 * Usage:
 *   const { isAuthorized, verifyPassword, getAuthHeader, clearAuth } = useAdminAuth();
 *
 *   // Before a protected action:
 *   if (!isAuthorized()) {
 *     // show AdminPasswordModal → on success call verifyPassword(password)
 *   }
 *
 *   // When calling a protected API:
 *   fetch(url, { headers: { ...getAuthHeader() } })
 */

import { useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export function useAdminAuth() {
  // In-memory only — never written to any browser storage
  const tokenRef = useRef(null);        // { value: string, expiresAt: number (ms) }

  /** True when a valid, non-expired token is held in memory */
  const isAuthorized = useCallback(() => {
    if (!tokenRef.current) return false;
    return Date.now() < tokenRef.current.expiresAt;
  }, []);

  /**
   * Call the backend verify-password endpoint.
   * @param {string} password  - raw password entered by the admin
   * @returns {Promise<{ success: boolean; error?: string }>}
   */
  const verifyPassword = useCallback(async (password) => {
    try {
      const res = await fetch(`${API_BASE}/admin/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: json.detail || 'Incorrect password.' };
      }

      const { token, expires_in } = json;
      tokenRef.current = {
        value: token,
        expiresAt: Date.now() + expires_in * 1000,
      };

      return { success: true };
    } catch (err) {
      console.error('[AdminAuth] verifyPassword error:', err);
      return { success: false, error: 'Could not reach the server. Please check your connection.' };
    }
  }, []);

  /**
   * Returns the Authorization header object for use in fetch() calls.
   * Returns empty object if no valid token.
   */
  const getAuthHeader = useCallback(() => {
    if (!isAuthorized()) return {};
    return { Authorization: `Bearer ${tokenRef.current.value}` };
  }, [isAuthorized]);

  /** Manually clear the admin session (e.g., on logout / revocation) */
  const clearAuth = useCallback(() => {
    tokenRef.current = null;
  }, []);

  /**
   * Seconds remaining in the current session, or 0 if expired / none.
   */
  const secondsRemaining = useCallback(() => {
    if (!tokenRef.current) return 0;
    return Math.max(0, Math.floor((tokenRef.current.expiresAt - Date.now()) / 1000));
  }, []);

  return { isAuthorized, verifyPassword, getAuthHeader, clearAuth, secondsRemaining };
}
