from typing import Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Query, Depends, status
from app.schemas.common import StandardResponse
from app.services.storage_service import StorageService
from app.services.cloudinary_service import CloudinaryService
from app.core.security import require_admin

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post("/project-image", response_model=StandardResponse[Dict[str, Any]], status_code=status.HTTP_201_CREATED)
async def upload_project_image(
    file: UploadFile = File(...),
    folder: Optional[str] = Query(None, description="Optional Cloudinary subfolder"),
    admin=Depends(require_admin)
):
    """
    Upload a project screenshot, preview, or logo to Cloudinary.
    Enforces format validation (JPG, JPEG, PNG, WebP) and size limits (5 MB).
    Returns the secure HTTPS URL and Cloudinary public_id.
    """
    file_bytes = await file.read()
    result = await CloudinaryService.upload_image(
        file_bytes=file_bytes,
        filename=file.filename or "image.jpg",
        content_type=file.content_type,
        folder=folder
    )
    return StandardResponse(
        success=True,
        message="Image uploaded successfully to Cloudinary",
        data=result
    )


@router.post("", response_model=StandardResponse[Dict[str, str]], status_code=status.HTTP_201_CREATED)
async def upload_asset(
    file: UploadFile = File(...),
    folder: str = Query("screenshots", description="Storage subfolder"),
    admin=Depends(require_admin)
):
    """
    Upload an asset (screenshot, logo, preview) to Supabase Storage bucket 'company-project-assets'.
    """
    result = await StorageService.upload_file(file=file, folder=folder)
    return StandardResponse(
        success=True,
        message="Asset uploaded successfully to Supabase Storage",
        data=result
    )

