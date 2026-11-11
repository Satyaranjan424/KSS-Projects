import { useState, useEffect, useMemo, useCallback } from 'react';
import { initialProjects } from '../data/initialProjects';
import { getStoredProjects, saveStoredProjects } from '../utils/storage';
import { fetchProjects, createProject, updateProject, deleteProject as apiDeleteProject, fetchDashboardStats } from '../services/api';

export const useProjects = () => {
  // Master projects list initialized from storage, defaulting to empty array (no static demo data)
  const [projects, setProjects] = useState(() => getStoredProjects([]));

  // Active tab: 'Live' (default) or 'In Development', or 'All'
  const [activeTab, setActiveTab] = useState('Live');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting: 'latest', 'oldest', 'az', 'za'
  const [sortBy, setSortBy] = useState('latest');

  // Pagination: 6 projects per page (3 columns x 2 rows on desktop)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Track if backend is connected
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with Backend API on mount
  useEffect(() => {
    let isMounted = true;

    async function loadFromBackend() {
      setIsLoading(true);
      try {
        const remoteProjects = await fetchProjects({ limit: 100 });
        if (isMounted && remoteProjects && Array.isArray(remoteProjects)) {
          const normalized = remoteProjects.map((p) => {
            const img = p.previewImage || p.preview_image_url || p.imageUrl || p.image_url || '';
            return {
              ...p,
              previewImage: img,
              preview_image_url: img,
              imageUrl: img,
              image_url: img
            };
          });
          setProjects(normalized);
          saveStoredProjects(normalized);
          setIsBackendConnected(true);
        }
      } catch (err) {
        console.warn('Backend unavailable, using cached / initial projects', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist projects to localStorage whenever projects state changes
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Reset to page 1 whenever tab, search query, or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

  // Dynamic counts
  const liveCount = useMemo(() => {
    return projects.filter((p) => p.status === 'Live').length;
  }, [projects]);

  const devCount = useMemo(() => {
    return projects.filter((p) => p.status === 'In Development').length;
  }, [projects]);

  const totalCount = projects.length;

  // Filtered & Sorted list for the current tab & search
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Tab filter (if 'All', show all; otherwise match project.status)
        if (activeTab !== 'All' && project.status !== activeTab) {
          return false;
        }

        // Search query filter (Project name, Description, Technologies, Category)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = project.name?.toLowerCase().includes(q);
          const matchDesc = project.description?.toLowerCase().includes(q);
          const matchCategory = project.category?.toLowerCase().includes(q);
          const matchTech = Array.isArray(project.technologies)
            ? project.technologies.some((t) => t.toLowerCase().includes(q))
            : false;

          return matchName || matchDesc || matchCategory || matchTech;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        if (sortBy === 'latest' || sortBy === 'newest') {
          return timeB - timeA;
        }
        if (sortBy === 'oldest') {
          return timeA - timeB;
        }
        if (sortBy === 'az') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'za') {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
  }, [projects, activeTab, searchQuery, sortBy]);

  // Paginated subset
  const totalFiltered = filteredProjects.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Pagination display indices
  const pageStartIndex = totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const pageEndIndex = Math.min(currentPage * itemsPerPage, totalFiltered);

  // Select tab (clicking already active tab toggles 'All')
  const handleSelectTab = useCallback((tabName) => {
    setActiveTab((prev) => (prev === tabName ? 'All' : tabName));
  }, []);

  // Add new project (optimistic update + backend sync)
  const addProject = useCallback(async (newProjectData) => {
    const tempId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const optimisticProj = {
      ...newProjectData,
      id: tempId
    };

    // Optimistically add to UI immediately
    setProjects((prev) => [optimisticProj, ...prev]);
    if (optimisticProj.status) {
      setActiveTab(optimisticProj.status);
    }

    // Try posting to backend API
    try {
      const serverProj = await createProject(newProjectData);
      if (serverProj && serverProj.id) {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === tempId) {
              const img = serverProj.previewImage || serverProj.preview_image_url || serverProj.image_url || p.previewImage || p.preview_image_url || '';
              return {
                ...p,
                ...serverProj,
                id: serverProj.id,
                previewImage: img,
                preview_image_url: img,
                image_url: img
              };
            }
            return p;
          })
        );
        return serverProj;
      }
    } catch (err) {
      console.warn('Backend create project failed, retained in local storage:', err);
    }

    return optimisticProj;
  }, []);

  // Update an existing project (optimistic update + backend sync)
  const editProject = useCallback(async (projectId, updatedData) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const img = updatedData.previewImage || updatedData.preview_image_url || updatedData.image_url || p.previewImage || '';
          return {
            ...p,
            ...updatedData,
            previewImage: img,
            preview_image_url: img,
            image_url: img
          };
        }
        return p;
      })
    );

    try {
      const serverProj = await updateProject(projectId, updatedData);
      if (serverProj) {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === projectId) {
              const img = serverProj.previewImage || serverProj.preview_image_url || serverProj.image_url || p.previewImage || '';
              return {
                ...p,
                ...serverProj,
                previewImage: img,
                preview_image_url: img,
                image_url: img
              };
            }
            return p;
          })
        );
        return serverProj;
      }
    } catch (err) {
      console.warn('Backend update project failed, retained in local state:', err);
    }
  }, []);

  // Delete a project (optimistic remove + backend sync)
  const deleteProject = useCallback(async (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    try {
      await apiDeleteProject(projectId);
    } catch (err) {
      console.warn('Backend delete project failed:', err);
    }
  }, []);

  return {
    projects,
    activeTab,
    setActiveTab,
    handleSelectTab,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalFiltered,
    pageStartIndex,
    pageEndIndex,
    liveCount,
    devCount,
    totalCount,
    paginatedProjects,
    addProject,
    editProject,
    deleteProject,
    isBackendConnected,
    isLoading
  };
};
