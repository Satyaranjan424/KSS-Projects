import io
import os
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import cloudinary
import cloudinary.uploader
from app.core.config import settings

logger = logging.getLogger("app.services.cloudinary")

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 Megabytes


def is_cloudinary_configured() -> bool:
    """Check if all required Cloudinary credentials are provided and non-placeholder."""
    cloud = (settings.CLOUDINARY_CLOUD_NAME or "").strip()
    key = (settings.CLOUDINARY_API_KEY or "").strip()
    secret = (settings.CLOUDINARY_API_SECRET or "").strip()

    if not cloud or "your-cloud" in cloud:
        return False
    if not key or "your-api" in key:
        return False
    if not secret or "your-api" in secret:
        return False
    return True


def init_cloudinary():
    """Initialize Cloudinary SDK with current settings."""
    if is_cloudinary_configured():
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )


class CloudinaryService:
    @staticmethod
    def validate_image_file(filename: str, content_type: Optional[str], file_size: int):
        """Validate extension, MIME type, and file size limits."""
        # 1. File size
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 5 MB ({file_size / (1024 * 1024):.2f} MB uploaded)."
            )

        # 2. Extension
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, WebP."
            )

        # 3. MIME type (if provided)
        if content_type and content_type.lower() not in ALLOWED_IMAGE_MIMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported content type '{content_type}'. Must be image/jpeg, image/png, or image/webp."
            )

    @staticmethod
    async def upload_image(
        file_bytes: bytes,
        filename: str,
        content_type: Optional[str] = None,
        folder: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload an image binary to Cloudinary.
        Returns a dict containing secure_url, public_id, and dimensions.
        """
        # Validate
        CloudinaryService.validate_image_file(filename, content_type, len(file_bytes))

        if not is_cloudinary_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cloudinary is not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env"
            )

        init_cloudinary()

        target_folder = folder or settings.CLOUDINARY_FOLDER or "kalpanaam/projects"

        try:
            # Upload using official Python Cloudinary SDK
            upload_result = cloudinary.uploader.upload(
                io.BytesIO(file_bytes),
                folder=target_folder,
                resource_type="image",
                use_filename=True,
                unique_filename=True,
                overwrite=False
            )

            secure_url = upload_result.get("secure_url") or upload_result.get("url")
            public_id = upload_result.get("public_id")

            logger.info(f"Successfully uploaded image to Cloudinary: public_id={public_id}")

            return {
                "url": secure_url,
                "secure_url": secure_url,
                "public_id": public_id,
                "format": upload_result.get("format"),
                "width": upload_result.get("width"),
                "height": upload_result.get("height"),
                "bytes": upload_result.get("bytes")
            }
        except Exception as e:
            err_msg = str(e)
            logger.error(f"Cloudinary upload failed: {err_msg}")
            if "missing permissions" in err_msg and "create" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cloudinary API Key has restricted permissions (missing 'create'/upload permission). In Cloudinary Console -> Settings -> Access Keys, please grant Write/Create permission to this API key or generate a Master API key."
                )
            if "Invalid credentials" in err_msg or "Must supply api_key" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid Cloudinary credentials: {err_msg}"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image to Cloudinary: {err_msg}"
            )

    @staticmethod
    def delete_image(public_id: Optional[str]) -> bool:
        """
        Delete an image asset from Cloudinary by its public_id.
        Fails safely and logs any error without corrupting database state.
        """
        if not public_id or not public_id.strip():
            return True

        if not is_cloudinary_configured():
            logger.warning(f"Cannot delete asset '{public_id}' because Cloudinary is not configured.")
            return False

        init_cloudinary()

        try:
            res = cloudinary.uploader.destroy(public_id.strip(), invalidate=True)
            result_status = res.get("result")
            if result_status == "ok":
                logger.info(f"Successfully deleted Cloudinary asset: {public_id}")
                return True
            elif result_status == "not found":
                logger.info(f"Cloudinary asset not found (already deleted): {public_id}")
                return True
            else:
                logger.warning(f"Cloudinary delete status: {res}")
                return False
        except Exception as e:
            logger.error(f"Error deleting asset '{public_id}' from Cloudinary: {str(e)}")
            return False

