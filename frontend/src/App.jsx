import React, { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import { TopNavbar } from './components/TopNavbar';
import { BannerSection } from './components/BannerSection';
import { ProjectTabs } from './components/ProjectTabs';
import { SearchSort } from './components/SearchSort';
import { ProjectCard } from './components/ProjectCard';
import { Pagination } from './components/Pagination';
import { AddProjectModal } from './components/AddProjectModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FolderSearch, Plus } from 'lucide-react';
import './styles/global.css';
import './styles/dashboard.css';
import './styles/components.css';

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
    deleteProject
  } = useProjects();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  return (
    <div className="app-layout">
      {/* 1. Top Header Navbar (matching Image 1 & 2) */}
      <TopNavbar />

      {/* 2. Banner Section with Waving Ribbon & "+ Add Project" Button */}
      <BannerSection
        liveCount={liveCount}
        devCount={devCount}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* 3. Main Dashboard Body: Toolbar, Projects Grid, and Pagination */}
      <main className="dashboard-main-container">
        {/* Unified Controls Toolbar: Status Tabs on left, Search & Sort on right */}
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

        {/* Responsive Projects Grid (3-columns on desktop, 2 on tablet, 1 on mobile) */}
        {paginatedProjects.length > 0 ? (
          <div className="projects-grid">
            {paginatedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => setProjectToEdit(p)}
                onDelete={(p) => setProjectToDelete(p)}
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
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add your first project</span>
              </button>
            )}
          </div>
        )}

        {/* Dynamic Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalFiltered={totalFiltered}
          pageStartIndex={pageStartIndex}
          pageEndIndex={pageEndIndex}
          onPageChange={setCurrentPage}
        />
      </main>

      {/* 4. Add & Edit Project Modal Form (100% Identical UI) */}
      <AddProjectModal
        isOpen={isAddModalOpen || Boolean(projectToEdit)}
        project={projectToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setProjectToEdit(null);
        }}
        onSave={(arg1, arg2) => {
          if (projectToEdit) {
            const id = arg2 ? arg1 : projectToEdit.id;
            const data = arg2 ? arg2 : arg1;
            editProject(id, data);
          } else {
            addProject(arg1);
          }
        }}
      />

      {/* 5. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(projectToDelete)}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={deleteProject}
      />
    </div>
  );
}

export default App;
