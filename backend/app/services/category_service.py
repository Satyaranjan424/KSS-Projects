import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from app.database.supabase import get_supabase_client, is_supabase_configured
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.project import generate_slug

# Initial fallback categories matching migration seed
INITIAL_CATEGORIES: List[Dict[str, Any]] = [
    {"id": "11111111-1111-1111-1111-111111111101", "name": "Healthcare", "slug": "healthcare", "description": "Clinical portals, telehealth, and healthcare administration solutions", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111102", "name": "Education", "slug": "education", "description": "Learning management, school operations, and student portals", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111103", "name": "Enterprise", "slug": "enterprise", "description": "Business management, CRM, ERP, and workforce automation systems", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111104", "name": "AI / ML", "slug": "ai-ml", "description": "Machine learning models, speech AI, and computer vision systems", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111105", "name": "Supply Chain", "slug": "supply-chain", "description": "Fleet telematics, routing algorithms, and shipment tracking", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111106", "name": "FinTech", "slug": "fintech", "description": "Core banking, transaction processing, and finance portals", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111107", "name": "Retail", "slug": "retail", "description": "Point-of-sale, inventory tracking, and multi-store commerce", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111108", "name": "Real Estate", "slug": "real-estate", "description": "Property listings, lead management, and digital agreements", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111109", "name": "Cybersecurity", "slug": "cybersecurity", "description": "SIEM monitoring, threat detection, and KYC authentication", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    {"id": "11111111-1111-1111-1111-111111111110", "name": "CleanTech", "slug": "cleantech", "description": "Smart grid forecasting, IoT telemetry, and carbon accounting", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
]

_mock_categories: List[Dict[str, Any]] = [dict(c) for c in INITIAL_CATEGORIES]


class CategoryService:
    @staticmethod
    def get_all() -> List[CategoryResponse]:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                res = client.table("categories").select("*").order("name").execute()
                return [CategoryResponse(**item) for item in res.data]
            except Exception as e:
                pass

        # Fallback to in-memory store
        return [CategoryResponse(**c) for c in sorted(_mock_categories, key=lambda x: x["name"])]

    @staticmethod
    def get_by_id(category_id: str) -> Optional[CategoryResponse]:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                is_valid_uuid = False
                try:
                    uuid_val = str(uuid.UUID(str(category_id).strip()))
                    is_valid_uuid = True
                except (ValueError, AttributeError):
                    pass

                if is_valid_uuid:
                    res = client.table("categories").select("*").eq("id", uuid_val).execute()
                else:
                    res = client.table("categories").select("*").eq("slug", category_id).execute()

                if res and res.data:
                    return CategoryResponse(**res.data[0])
                return None
            except Exception:
                pass

        for c in _mock_categories:
            if c["id"] == category_id or c.get("slug") == category_id:
                return CategoryResponse(**c)
        return None

    @staticmethod
    def create(data: CategoryCreate) -> CategoryResponse:
        slug = data.slug or generate_slug(data.name)

        client = get_supabase_client()
        if client and is_supabase_configured():
            # Check duplicate name/slug
            try:
                check = client.table("categories").select("id").or_(f"name.eq.{data.name},slug.eq.{slug}").execute()
                if check.data:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Category with name '{data.name}' or slug '{slug}' already exists."
                    )
                
                cat_id = getattr(data, "id", None) or str(uuid.uuid4())
                payload = {
                    "id": cat_id,
                    "name": data.name,
                    "slug": slug,
                    "description": data.description,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }

                insert_payload = dict(payload)
                max_retries = 5
                while max_retries > 0:
                    try:
                        res = client.table("categories").insert(insert_payload).execute()
                        if res.data:
                            return CategoryResponse(**res.data[0])
                        break
                    except Exception as insert_err:
                        err_str = str(insert_err)
                        match = re.search(r"Could not find the '([^']+)' column", err_str)
                        if match:
                            missing_col = match.group(1)
                            if missing_col in insert_payload:
                                del insert_payload[missing_col]
                                max_retries -= 1
                                continue
                        raise
            except HTTPException:
                raise
            except Exception as e:
                if "PGRST205" in str(e) or "relation" in str(e) or "Could not find the table" in str(e):
                    # Table not initialized in database yet, fall through to mock store
                    pass
                else:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to create category: {str(e)}"
                    )

        # Mock store check
        for c in _mock_categories:
            if c["name"].lower() == data.name.lower() or c["slug"] == slug:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with name '{data.name}' or slug '{slug}' already exists."
                )

        new_cat = {
            "id": str(uuid.uuid4()),
            "name": data.name,
            "slug": slug,
            "description": data.description,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        _mock_categories.append(new_cat)
        return CategoryResponse(**new_cat)

    @staticmethod
    def update(category_id: str, data: CategoryUpdate) -> CategoryResponse:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                existing = CategoryService.get_by_id(category_id)
                if not existing:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

                resolved_id = existing.id
                payload: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
                if data.name is not None:
                    payload["name"] = data.name
                    payload["slug"] = data.slug or generate_slug(data.name)
                if data.description is not None:
                    payload["description"] = data.description

                update_payload = dict(payload)
                max_retries = 5
                while max_retries > 0:
                    try:
                        res = client.table("categories").update(update_payload).eq("id", resolved_id).execute()
                        if res.data:
                            return CategoryResponse(**res.data[0])
                        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
                    except HTTPException:
                        raise
                    except Exception as update_err:
                        err_str = str(update_err)
                        match = re.search(r"Could not find the '([^']+)' column", err_str)
                        if match:
                            missing_col = match.group(1)
                            if missing_col in update_payload:
                                del update_payload[missing_col]
                                max_retries -= 1
                                continue
                        raise
            except HTTPException:
                raise
            except Exception as e:
                if "PGRST205" in str(e) or "relation" in str(e) or "Could not find the table" in str(e):
                    pass
                else:
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

        # Mock update
        for c in _mock_categories:
            if c["id"] == category_id or c.get("slug") == category_id:
                if data.name is not None:
                    c["name"] = data.name
                    c["slug"] = data.slug or generate_slug(data.name)
                if data.description is not None:
                    c["description"] = data.description
                c["updated_at"] = datetime.now(timezone.utc)
                return CategoryResponse(**c)

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    @staticmethod
    def delete(category_id: str) -> bool:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                res = client.table("categories").delete().eq("id", category_id).execute()
                return True
            except Exception as e:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

        global _mock_categories
        initial_len = len(_mock_categories)
        _mock_categories = [c for c in _mock_categories if c["id"] != category_id]
        if len(_mock_categories) == initial_len:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return True

