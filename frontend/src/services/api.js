/**
 * API Service for Company Projects Dashboard
 * Communicates with FastAPI backend with fallback resilience.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Thrown when a protected endpoint returns 401 / 403.
 * Callers can catch this and re-trigger the admin password modal.
 */
export class AdminAuthError extends Error {
  constructor(message = 'Admin authorization required') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

/**
 * Helper to execute fetch with timeout
 */
async function fetchWithTimeout(resource, options = {}, timeout = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/** Raise AdminAuthError when backend returns 401 or 403 */
function checkAuth(res) {
  if (res.status === 401 || res.status === 403) {
    throw new AdminAuthError('Admin session expired or invalid. Please verify your password again.');
  }
}

/**
 * Fetch projects list with filters, search, and pagination
 */
export async function fetchProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.category) query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.sortBy) query.append('sort_by', params.sortBy);

  const queryString = query.toString();
  const url = `${API_BASE_URL}/projects${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API] Could not fetch projects from backend:', err.message);
    return null;
  }
}

/**
 * Fetch single project by ID
 */
export async function fetchProjectById(id) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/projects/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch project ${id}: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`[API] Could not fetch project ${id}:`, err.message);
    return null;
  }
}

/**
 * Create a new project — requires admin Authorization header
 * @param {object} projectData
 * @param {object} authHeaders  — { Authorization: 'Bearer <token>' }
 */
export async function createProject(projectData, authHeaders = {}) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(projectData)
  });
  checkAuth(res);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || errBody.detail || `Failed to create project: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

/**
 * Update an existing project — requires admin Authorization header
 */
export async function updateProject(id, projectData, authHeaders = {}) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(projectData)
  });
  checkAuth(res);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || errBody.detail || `Failed to update project: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

/**
 * Delete a project — requires admin Authorization header
 */
export async function deleteProject(id, authHeaders = {}) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });
  checkAuth(res);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || errBody.detail || `Failed to delete project: ${res.statusText}`);
  }
  if (res.status === 204) return true;
  const json = await res.json().catch(() => ({}));
  return json.data !== undefined ? json.data : true;
}

/**
 * Fetch dashboard stats
 */
export async function fetchDashboardStats() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API] Could not fetch stats from backend:', err.message);
    return null;
  }
}

/**
 * Fetch categories list
 */
export async function fetchCategories() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/categories`);
    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API] Could not fetch categories from backend:', err.message);
    return null;
  }
}

/**
 * Upload a project image or logo to Cloudinary through FastAPI backend
 * @param {File} file - Image file (JPG, PNG, WebP)
 * @returns {Promise<{url: string, secure_url: string, public_id: string}|null>}
 */
export async function uploadProjectImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithTimeout(`${API_BASE_URL}/uploads/project-image`, {
    method: 'POST',
    body: formData
  }, 30000); // 30s timeout for network image upload

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || errBody.message || `Upload failed with status ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Upload an image or file asset to backend / Supabase storage
 */
export async function uploadAsset(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetchWithTimeout(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Upload failed: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data?.url || null;
  } catch (err) {
    console.warn('[API] Upload asset error:', err.message);
    return null;
  }
}

