import math
from typing import Optional, List
from fastapi import APIRouter, Query, Depends, status, HTTPException
from app.schemas.common import StandardResponse, PaginationMeta
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import ProjectService
from app.core.security import require_admin

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=StandardResponse[List[ProjectResponse]])
def get_projects(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Status filter: Live or In Development"),
    category: Optional[str] = Query(None, description="Category filter"),
    technology: Optional[str] = Query(None, description="Technology filter"),
    search: Optional[str] = Query(None, description="Search across name, description, category, tech"),
    sort_by: str = Query("latest", description="Sort by: latest, oldest, az, za"),
):
    """
    Retrieve paginated company projects with search, filter, and sorting.
    """
    projects, total = ProjectService.get_projects(
        page=page,
        limit=limit,
        status_filter=status,
        category_filter=category,
        technology_filter=technology,
        search_query=search,
        sort_by=sort_by
    )

    total_pages = math.ceil(total / limit) if total > 0 else 0

    return StandardResponse(
        success=True,
        message="Projects retrieved successfully",
        data=projects,
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages
        )
    )


@router.get("/{project_id}", response_model=StandardResponse[ProjectResponse])
def get_project(project_id: str):
    """
    Retrieve single project by UUID or unique slug.
    """
    project = ProjectService.get_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id or slug '{project_id}' not found"
        )

    return StandardResponse(
        success=True,
        message="Project retrieved successfully",
        data=project
    )


@router.post("", response_model=StandardResponse[ProjectResponse], status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    admin=Depends(require_admin)
):
    """
    Create a new project (Admin authentication required).
    """
    created = ProjectService.create_project(data)
    return StandardResponse(
        success=True,
        message="Project created successfully",
        data=created
    )


@router.put("/{project_id}", response_model=StandardResponse[ProjectResponse])
def update_project(
    project_id: str,
    data: ProjectUpdate,
    admin=Depends(require_admin)
):
    """
    Update an existing project (Admin authentication required).
    """
    updated = ProjectService.update_project(project_id, data)
    return StandardResponse(
        success=True,
        message="Project updated successfully",
        data=updated
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    admin=Depends(require_admin)
):
    """
    Delete a project (Admin authentication required).
    """
    ProjectService.delete_project(project_id)
    return None

