from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.common import StandardResponse
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import CategoryService
from app.core.security import require_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=StandardResponse[List[CategoryResponse]])
def get_categories():
    """
    Retrieve all project categories.
    """
    categories = CategoryService.get_all()
    return StandardResponse(
        success=True,
        message="Categories retrieved successfully",
        data=categories
    )


@router.get("/{category_id}", response_model=StandardResponse[CategoryResponse])
def get_category(category_id: str):
    """
    Retrieve a single category by ID.
    """
    category = CategoryService.get_by_id(category_id)
    if not category:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category_id}' not found"
        )
    return StandardResponse(
        success=True,
        message="Category retrieved successfully",
        data=category
    )


@router.post("", response_model=StandardResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    admin=Depends(require_admin)
):
    """
    Create a new project category (Admin authentication required).
    """
    created = CategoryService.create(data)
    return StandardResponse(
        success=True,
        message="Category created successfully",
        data=created
    )


@router.put("/{category_id}", response_model=StandardResponse[CategoryResponse])
def update_category(
    category_id: str,
    data: CategoryUpdate,
    admin=Depends(require_admin)
):
    """
    Update a project category (Admin authentication required).
    """
    updated = CategoryService.update(category_id, data)
    return StandardResponse(
        success=True,
        message="Category updated successfully",
        data=updated
    )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    admin=Depends(require_admin)
):
    """
    Delete a project category (Admin authentication required).
    """
    CategoryService.delete(category_id)
    return None

