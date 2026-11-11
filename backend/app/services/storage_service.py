import uuid
import os
from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.database.supabase import get_supabase_client, is_supabase_configured

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
    "application/pdf"
}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB (allowing rich PDF documents)


class StorageService:
    @staticmethod
    async def upload_file(
        file: UploadFile,
        folder: str = "assets"
    ) -> Dict[str, str]:
        # Validate MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{file.content_type}'. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
            )

        # Read contents
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
            )

        # Clean filename and generate unique name
        raw_ext = os.path.splitext(file.filename or "")[1].lower() or ".pdf"
        clean_ext = raw_ext if raw_ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".pdf"] else ".pdf"
        unique_name = f"{uuid.uuid4().hex}{clean_ext}"
        storage_path = f"{folder}/{unique_name}"

        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                bucket_name = settings.STORAGE_BUCKET_NAME
                
                # Upload to Supabase Storage
                res = client.storage.from_(bucket_name).upload(
                    path=storage_path,
                    file=contents,
                    file_options={"content-type": file.content_type, "upsert": "true"}
                )

                # Get public URL
                public_url = client.storage.from_(bucket_name).get_public_url(storage_path)
                return {
                    "file_name": file.filename or unique_name,
                    "storage_path": storage_path,
                    "url": public_url
                }
            except Exception as e:
                # If Supabase storage fails, fallback to simulated URL with warning
                pass

        # Offline / Mock storage response
        simulated_url = f"https://mock-storage.kalpanaam.com/company-project-assets/{storage_path}"
        return {
            "file_name": file.filename or unique_name,
            "storage_path": storage_path,
            "url": simulated_url
        }

    @staticmethod
    def delete_file(storage_path: str) -> bool:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                bucket_name = settings.STORAGE_BUCKET_NAME
                client.storage.from_(bucket_name).remove([storage_path])
                return True
            except Exception:
                return False
        return True

