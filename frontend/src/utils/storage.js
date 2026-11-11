// Storage key for LocalStorage persistence (clean user-created projects only)
export const STORAGE_KEY = 'kss_company_projects_real_v1';

/**
 * Load projects from localStorage, defaulting to empty array.
 * @param {Array} defaultProjects 
 * @returns {Array}
 */
export const getStoredProjects = (defaultProjects = []) => {
  try {
    // Purge any legacy demo storage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('kss_company_projects_data')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

/**
 * Save projects array to localStorage.
 * @param {Array} projects 
 */
export const saveStoredProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects || []));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};

/**
 * Reset localStorage projects to empty.
 */
export const resetStoredProjects = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    return [];
  }
};
