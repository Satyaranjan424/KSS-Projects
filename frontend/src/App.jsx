import React, { useState, useCallback, useRef } from 'react';
import { useProjects } from './hooks/useProjects';
import { useAdminAuth } from './hooks/useAdminAuth';
import { TopNavbar } from './components/TopNavbar';
import { BannerSection } from './components/BannerSection';
import { ProjectTabs } from './components/ProjectTabs';
import { SearchSort } from './components/SearchSort';
import { ProjectCard } from './components/ProjectCard';
import { Pagination } from './components/Pagination';
import { AddProjectModal } from './components/AddProjectModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { FolderSearch, Plus } from 'lucide-react';
import './styles/global.css';
import './styles/dashboard.css';
import './styles/components.css';
import './styles/admin-password-modal.css';
import './styles/responsive.css';

export function App() {
  const {
    activeTab,
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
    paginatedProjects,
    addProject,
    editProject,
    deleteProject,
  } = useProjects();

  // Admin auth hook — in-memory session, never stored in browser storage
  const { isAuthorized, verifyPassword, getAuthHeader } = useAdminAuth();

  // ─── Modal states ────────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // ─── Admin password modal state ──────────────────────────────────────────
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminModalLabel, setAdminModalLabel] = useState('');
  // We store the action to execute AFTER successful verification as a ref
  const pendingActionRef = useRef(null);

  // ─── Generic "guard" — shows password modal if not yet authorized ────────
  /**
   * @param {string} label        — shown in the modal ("Add Project" / "Edit Project" / "Delete Project")
   * @param {() => void} action   — called once admin is verified
   */
  const requireAdmin = useCallback((label, action) => {
    if (isAuthorized()) {
      // Already have a valid session — run action immediately
      action();
    } else {
      pendingActionRef.current = action;
      setAdminModalLabel(label);
      setAdminModalOpen(true);
    }
  }, [isAuthorized]);

  const handleAdminVerified = useCallback(() => {
    setAdminModalOpen(false);
    // Run the pending action now that we are authorized
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  }, []);

  const handleAdminCancel = useCallback(() => {
    setAdminModalOpen(false);
    pendingActionRef.current = null;
  }, []);

  // ─── Protected action handlers ───────────────────────────────────────────
  const handleOpenAdd = useCallback(() => {
    requireAdmin('Add Project', () => setIsAddModalOpen(true));
  }, [requireAdmin]);

  const handleOpenEdit = useCallback((project) => {
    requireAdmin('Edit Project', () => setProjectToEdit(project));
  }, [requireAdmin]);

  const handleOpenDelete = useCallback((project) => {
    requireAdmin('Delete Project', () => setProjectToDelete(project));
  }, [requireAdmin]);

  // ─── Save/submit handlers that pass auth headers to the API ──────────────
  const handleSave = useCallback((arg1, arg2) => {
    const authHeaders = getAuthHeader();
    if (projectToEdit) {
      const id = arg2 ? arg1 : projectToEdit.id;
      const data = arg2 ? arg2 : arg1;
      editProject(id, data, authHeaders);
    } else {
      addProject(arg1, authHeaders);
    }
  }, [projectToEdit, editProject, addProject, getAuthHeader]);

  const handleConfirmDelete = useCallback((projectId) => {
    const authHeaders = getAuthHeader();
    deleteProject(projectId, authHeaders);
  }, [deleteProject, getAuthHeader]);

  return (
    <div className="app-layout">
      {/* 1. Top Header Navbar */}
      <TopNavbar />

      {/* 2. Banner Section */}
      <BannerSection
        liveCount={liveCount}
        devCount={devCount}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAddModal={handleOpenAdd}
      />

      {/* 3. Main Dashboard Body */}
      <main className="dashboard-main-container">
        <div className="toolbar-container">
          <ProjectTabs
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            liveCount={liveCount}
            devCount={devCount}
          />
          <SearchSort
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {paginatedProjects.length > 0 ? (
          <div className="projects-grid">
            {paginatedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FolderSearch size={32} />
            </div>
            <h3 className="empty-state-title">No projects yet</h3>
            <p className="empty-state-text">
              {searchQuery
                ? `No projects match "${searchQuery}". Try another keyword or clear the search.`
                : `Your showcase is clean and ready. Add your real company projects one by one.`}
            </p>
            {!searchQuery && (
              <button
                type="button"
                className="btn-add-project"
                style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={handleOpenAdd}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add your first project</span>
              </button>
            )}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalFiltered={totalFiltered}
          pageStartIndex={pageStartIndex}
          pageEndIndex={pageEndIndex}
          onPageChange={setCurrentPage}
        />
      </main>

      {/* 4. Admin Password Modal — shown before any protected action */}
      <AdminPasswordModal
        isOpen={adminModalOpen}
        actionLabel={adminModalLabel}
        verifyPassword={verifyPassword}
        onVerified={handleAdminVerified}
        onCancel={handleAdminCancel}
      />

      {/* 5. Add & Edit Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen || Boolean(projectToEdit)}
        project={projectToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setProjectToEdit(null);
        }}
        onSave={handleSave}
      />

      {/* 6. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(projectToDelete)}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default App;
