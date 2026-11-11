import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from app.database.supabase import get_supabase_client, is_supabase_configured
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, generate_slug
from app.schemas.dashboard import DashboardStats
from app.services.category_service import CategoryService
from app.services.cloudinary_service import CloudinaryService

# Clean empty initial projects
INITIAL_PROJECTS: List[Dict[str, Any]] = []

_mock_projects: List[Dict[str, Any]] = []


def _format_project_response(item: Dict[str, Any]) -> ProjectResponse:
    # Ensure category name is set
    cat_name = item.get("category_name") or item.get("category") or "General"
    created_at = item.get("created_at")
    created_at_dt = None
    created_at_str = None
    if isinstance(created_at, datetime):
        created_at_dt = created_at
        created_at_str = created_at.strftime("%Y-%m-%d")
    elif isinstance(created_at, str):
        try:
            created_at_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            created_at_str = created_at_dt.strftime("%Y-%m-%d")
        except Exception:
            created_at_str = created_at

    img_url = item.get("image_url") or item.get("imageUrl") or item.get("preview_image_url") or item.get("previewImage") or ""
    img_pub_id = item.get("image_public_id") or item.get("imagePublicId")
    logo_pub_id = item.get("logo_public_id") or item.get("logoPublicId")

    raw_preview_type = item.get("preview_type") or item.get("previewType") or "generic"
    clean_preview_type = raw_preview_type

    # Resilient extraction: if dedicated image columns are missing from the Supabase table,
    # recover the Cloudinary URL and public_id from the preview_type fallback storage
    if not img_url and raw_preview_type:
        if raw_preview_type.startswith("cloudinary::"):
            parts = raw_preview_type.split("::")
            if len(parts) >= 2 and parts[1]:
                img_url = parts[1]
            if len(parts) >= 3 and parts[2] and not img_pub_id:
                img_pub_id = parts[2]
            clean_preview_type = "generic"
        elif raw_preview_type.startswith("http://") or raw_preview_type.startswith("https://"):
            img_url = raw_preview_type
            clean_preview_type = "generic"

    return ProjectResponse(
        id=str(item.get("id")),
        name=item.get("name", ""),
        slug=item.get("slug", ""),
        description=item.get("description", ""),
        category=cat_name,
        category_id=item.get("category_id"),
        category_name=cat_name,
        status=item.get("status", "Live"),
        technologies=item.get("technologies") or [],
        preview_image_url=img_url,
        image_url=img_url,
        image_public_id=img_pub_id,
        preview_type=clean_preview_type,
        icon=item.get("icon") or "layers",
        logo_url=item.get("logo_url"),
        logo_public_id=logo_pub_id,
        live_url=item.get("live_url") or item.get("liveUrl") or "",
        figma_url=item.get("figma_url") or item.get("figmaUrl") or "",
        documentation_url=item.get("documentation_url") or item.get("docUrl") or "",
        is_featured=bool(item.get("is_featured", False)),
        display_order=int(item.get("display_order", 0) or 0),
        created_at=created_at_dt,
        updated_at=item.get("updated_at"),
        previewImage=img_url,
        imageUrl=img_url,
        imagePublicId=img_pub_id,
        logoPublicId=logo_pub_id,
        previewType=clean_preview_type,
        liveUrl=item.get("live_url") or item.get("liveUrl") or "",
        figmaUrl=item.get("figma_url") or item.get("figmaUrl") or "",
        docUrl=item.get("documentation_url") or item.get("docUrl") or "",
        isFeatured=bool(item.get("is_featured", False)),
        displayOrder=int(item.get("display_order", 0) or 0),
        createdAt=created_at_str,
    )


class ProjectService:
    @staticmethod
    def get_projects(
        page: int = 1,
        limit: int = 10,
        status_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        technology_filter: Optional[str] = None,
        search_query: Optional[str] = None,
        sort_by: str = "latest",
    ) -> Tuple[List[ProjectResponse], int]:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                query = client.table("projects").select("*", count="exact")

                # Status filter
                if status_filter and status_filter.lower() not in ["all", ""]:
                    normalized_status = "Live" if status_filter.lower() in ["live", "active"] else "In Development"
                    query = query.eq("status", normalized_status)

                # Category filter
                if category_filter and category_filter.lower() not in ["all", ""]:
                    query = query.ilike("category_name", f"%{category_filter}%")

                # Technology filter
                if technology_filter:
                    query = query.contains("technologies", [technology_filter])

                # Search filter
                if search_query and search_query.strip():
                    q = search_query.strip()
                    query = query.or_(f"name.ilike.%{q}%,description.ilike.%{q}%,category_name.ilike.%{q}%")

                # Sorting
                if sort_by in ["latest", "newest"]:
                    query = query.order("created_at", desc=True)
                elif sort_by == "oldest":
                    query = query.order("created_at", desc=False)
                elif sort_by == "az":
                    query = query.order("name", desc=False)
                elif sort_by == "za":
                    query = query.order("name", desc=True)
                else:
                    query = query.order("display_order", desc=False)

                # Pagination
                start = (page - 1) * limit
                end = start + limit - 1
                res = query.range(start, end).execute()

                total = res.count if res.count is not None else len(res.data)
                return [_format_project_response(item) for item in res.data], total
            except Exception as e:
                pass

        # In-Memory Fallback
        results = list(_mock_projects)

        # Status filter
        if status_filter and status_filter.lower() not in ["all", ""]:
            normalized_status = "Live" if status_filter.lower() in ["live", "active"] else "In Development"
            results = [p for p in results if p.get("status", "").lower() == normalized_status.lower()]

        # Category filter
        if category_filter and category_filter.lower() not in ["all", ""]:
            results = [p for p in results if p.get("category_name", "").lower() == category_filter.lower() or p.get("category", "").lower() == category_filter.lower()]

        # Technology filter
        if technology_filter:
            tf = technology_filter.lower()
            results = [p for p in results if any(tf in t.lower() for t in p.get("technologies", []))]

        # Search filter
        if search_query and search_query.strip():
            sq = search_query.strip().lower()
            filtered = []
            for p in results:
                m_name = sq in p.get("name", "").lower()
                m_desc = sq in p.get("description", "").lower()
                m_cat = sq in p.get("category_name", "").lower() or sq in p.get("category", "").lower()
                m_tech = any(sq in t.lower() for t in p.get("technologies", []))
                if m_name or m_desc or m_cat or m_tech:
                    filtered.append(p)
            results = filtered

        # Sorting
        if sort_by in ["latest", "newest"]:
            results.sort(key=lambda p: p.get("created_at") or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
        elif sort_by == "oldest":
            results.sort(key=lambda p: p.get("created_at") or datetime.min.replace(tzinfo=timezone.utc), reverse=False)
        elif sort_by == "az":
            results.sort(key=lambda p: p.get("name", "").lower())
        elif sort_by == "za":
            results.sort(key=lambda p: p.get("name", "").lower(), reverse=True)

        total = len(results)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated = results[start_idx:end_idx]

        return [_format_project_response(p) for p in paginated], total

    @staticmethod
    def get_by_id(project_id: str) -> Optional[ProjectResponse]:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                # Disambiguate UUID lookup from slug lookup to avoid invalid syntax errors in PostgreSQL
                is_valid_uuid = False
                try:
                    uuid_val = str(uuid.UUID(str(project_id).strip()))
                    is_valid_uuid = True
                except (ValueError, AttributeError):
                    pass

                if is_valid_uuid:
                    res = client.table("projects").select("*").eq("id", uuid_val).execute()
                else:
                    res = client.table("projects").select("*").eq("slug", project_id).execute()

                if res and res.data:
                    return _format_project_response(res.data[0])
            except Exception:
                pass

        for p in _mock_projects:
            if p["id"] == project_id or p.get("slug") == project_id:
                return _format_project_response(p)
        return None

    @staticmethod
    def create_project(data: ProjectCreate) -> ProjectResponse:
        slug = data.slug or generate_slug(data.name)
        cat_name = data.category or data.category_name or "General"
        
        # Determine icon
        icon = data.icon or "layers"
        if not data.icon:
            cl = cat_name.lower()
            if "health" in cl:
                icon = "heart"
            elif "educat" in cl:
                icon = "graduation-cap"
            elif "ai" in cl or "ml" in cl:
                icon = "brain"
            elif "supply" in cl or "logist" in cl:
                icon = "truck"

        now = datetime.now(timezone.utc)
        proj_id = getattr(data, "id", None) or str(uuid.uuid4())
        img_url = data.image_url or data.imageUrl or data.preview_image_url or data.previewImage or ""
        img_pub_id = data.image_public_id or data.imagePublicId or None
        logo_pub_id = data.logo_public_id or data.logoPublicId or None

        # Ensure image URL and public ID are permanently preserved in the PostgreSQL table,
        # even if dedicated image columns have not yet been added to the Supabase schema.
        stored_preview_type = data.preview_type or data.previewType or "generic"
        if img_url:
            stored_preview_type = f"cloudinary::{img_url}::{img_pub_id or ''}"

        payload: Dict[str, Any] = {
            "id": proj_id,
            "name": data.name,
            "slug": slug,
            "description": data.description,
            "category_name": cat_name,
            "category_id": data.category_id,
            "status": data.status,
            "technologies": data.technologies,
            "preview_image_url": img_url,
            "image_url": img_url,
            "image_public_id": img_pub_id,
            "preview_type": stored_preview_type,
            "icon": icon,
            "logo_url": data.logo_url,
            "logo_public_id": logo_pub_id,
            "live_url": data.live_url or data.liveUrl or "",
            "figma_url": data.figma_url or data.figmaUrl or "",
            "documentation_url": data.documentation_url or data.docUrl or "",
            "is_featured": bool(data.is_featured or data.isFeatured or False),
            "display_order": int(data.display_order or data.displayOrder or 0),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                # Check slug uniqueness
                chk = client.table("projects").select("id").eq("slug", slug).execute()
                if chk.data:
                    payload["slug"] = f"{slug}-{uuid.uuid4().hex[:4]}"

                # Insert with column resilience in case table was created with fewer columns
                insert_payload = {k: v for k, v in payload.items() if v is not None}
                max_retries = 15
                while max_retries > 0:
                    try:
                        res = client.table("projects").insert(insert_payload).execute()
                        if res.data:
                            return _format_project_response(res.data[0])
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
            except Exception as e:
                if "PGRST205" in str(e) or "relation" in str(e) or "Could not find the table" in str(e):
                    pass
                else:
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

        # Mock Store Insert
        new_id = str(uuid.uuid4())
        mock_item = {
            **payload,
            "id": new_id,
            "category": cat_name,
            "created_at": now,
            "updated_at": now
        }
        # Prepend so newly created appears on top
        _mock_projects.insert(0, mock_item)
        return _format_project_response(mock_item)

    @staticmethod
    def update_project(project_id: str, data: ProjectUpdate) -> ProjectResponse:
        client = get_supabase_client()
        now = datetime.now(timezone.utc)

        update_dict: Dict[str, Any] = {"updated_at": now.isoformat()}
        if data.name is not None:
            update_dict["name"] = data.name
        if data.slug is not None:
            update_dict["slug"] = data.slug
        if data.description is not None:
            update_dict["description"] = data.description
        if data.category is not None or data.category_name is not None:
            c_val = data.category or data.category_name
            update_dict["category_name"] = c_val
        if data.category_id is not None:
            update_dict["category_id"] = data.category_id
        if data.status is not None:
            update_dict["status"] = data.status
        if data.technologies is not None:
            update_dict["technologies"] = data.technologies
        
        new_img = data.image_url or data.imageUrl or data.preview_image_url or data.previewImage
        if new_img is not None:
            update_dict["preview_image_url"] = new_img
            update_dict["image_url"] = new_img
            new_pub = data.image_public_id or data.imagePublicId or ""
            if new_img:
                update_dict["preview_type"] = f"cloudinary::{new_img}::{new_pub}"
            elif data.preview_type or data.previewType:
                update_dict["preview_type"] = data.preview_type or data.previewType
        if data.image_public_id is not None or data.imagePublicId is not None:
            update_dict["image_public_id"] = data.image_public_id or data.imagePublicId
        if data.logo_public_id is not None or data.logoPublicId is not None:
            update_dict["logo_public_id"] = data.logo_public_id or data.logoPublicId

        if (data.preview_type is not None or data.previewType is not None) and "preview_type" not in update_dict:
            update_dict["preview_type"] = data.preview_type or data.previewType
        if data.icon is not None:
            update_dict["icon"] = data.icon
        if data.logo_url is not None:
            update_dict["logo_url"] = data.logo_url
        if data.live_url is not None or data.liveUrl is not None:
            update_dict["live_url"] = data.live_url if data.live_url is not None else data.liveUrl
        if data.figma_url is not None or data.figmaUrl is not None:
            update_dict["figma_url"] = data.figma_url if data.figma_url is not None else data.figmaUrl
        if data.documentation_url is not None or data.docUrl is not None:
            update_dict["documentation_url"] = data.documentation_url if data.documentation_url is not None else data.docUrl
        if data.is_featured is not None or data.isFeatured is not None:
            update_dict["is_featured"] = bool(data.is_featured if data.is_featured is not None else data.isFeatured)
        if data.display_order is not None or data.displayOrder is not None:
            update_dict["display_order"] = int(data.display_order if data.display_order is not None else data.displayOrder)

        # Resolve project_id to UUID if given as slug
        is_valid_uuid = False
        try:
            uuid_val = str(uuid.UUID(str(project_id).strip()))
            is_valid_uuid = True
            resolved_id = uuid_val
        except (ValueError, AttributeError):
            resolved_id = None

        existing = ProjectService.get_by_id(project_id)
        if not is_valid_uuid:
            if existing:
                resolved_id = existing.id
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        old_image_pid = existing.image_public_id if existing else None
        old_logo_pid = existing.logo_public_id if existing else None

        if client and is_supabase_configured():
            try:
                update_payload = {k: v for k, v in update_dict.items() if v is not None}
                max_retries = 15
                while max_retries > 0:
                    try:
                        res = client.table("projects").update(update_payload).eq("id", resolved_id).execute()
                        if res.data:
                            # Clean up old Cloudinary asset if replaced
                            new_img_pid = update_dict.get("image_public_id")
                            if new_img_pid and old_image_pid and new_img_pid != old_image_pid:
                                CloudinaryService.delete_image(old_image_pid)
                            new_lg_pid = update_dict.get("logo_public_id")
                            if new_lg_pid and old_logo_pid and new_lg_pid != old_logo_pid:
                                CloudinaryService.delete_image(old_logo_pid)

                            return _format_project_response(res.data[0])
                        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
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

        # Mock Store Update
        for p in _mock_projects:
            if p["id"] == project_id or p.get("slug") == project_id:
                for k, v in update_dict.items():
                    p[k] = v
                if "category_name" in update_dict:
                    p["category"] = update_dict["category_name"]
                p["updated_at"] = now
                # Clean up old Cloudinary asset if replaced
                new_img_pid = update_dict.get("image_public_id")
                if new_img_pid and old_image_pid and new_img_pid != old_image_pid:
                    CloudinaryService.delete_image(old_image_pid)
                return _format_project_response(p)

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    @staticmethod
    def delete_project(project_id: str) -> bool:
        client = get_supabase_client()
        # Resolve project_id to UUID if given as slug
        is_valid_uuid = False
        try:
            uuid_val = str(uuid.UUID(str(project_id).strip()))
            is_valid_uuid = True
            resolved_id = uuid_val
        except (ValueError, AttributeError):
            resolved_id = None

        existing = ProjectService.get_by_id(project_id)
        if not is_valid_uuid:
            resolved_id = existing.id if existing else project_id

        old_image_pid = existing.image_public_id if existing else None
        old_logo_pid = existing.logo_public_id if existing else None

        if client and is_supabase_configured():
            try:
                res = client.table("projects").delete().eq("id", resolved_id).execute()
                # Clean up Cloudinary assets upon successful delete
                if old_image_pid:
                    CloudinaryService.delete_image(old_image_pid)
                if old_logo_pid:
                    CloudinaryService.delete_image(old_logo_pid)
                return True
            except Exception as e:
                if "PGRST205" in str(e) or "relation" in str(e) or "Could not find the table" in str(e):
                    pass
                else:
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

        global _mock_projects
        initial_len = len(_mock_projects)
        _mock_projects = [p for p in _mock_projects if p["id"] != project_id and p.get("slug") != project_id]
        if len(_mock_projects) == initial_len:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        # Clean up Cloudinary assets upon successful mock delete
        if old_image_pid:
            CloudinaryService.delete_image(old_image_pid)
        if old_logo_pid:
            CloudinaryService.delete_image(old_logo_pid)
        return True
        initial_len = len(_mock_projects)
        _mock_projects = [p for p in _mock_projects if p["id"] != project_id and p.get("slug") != project_id]
        if len(_mock_projects) == initial_len:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return True

    @staticmethod
    def get_dashboard_stats() -> DashboardStats:
        client = get_supabase_client()
        if client and is_supabase_configured():
            try:
                total_res = client.table("projects").select("id", count="exact").execute()
                live_res = client.table("projects").select("id", count="exact").eq("status", "Live").execute()
                dev_res = client.table("projects").select("id", count="exact").eq("status", "In Development").execute()
                cat_res = client.table("categories").select("id", count="exact").execute()

                return DashboardStats(
                    total_projects=total_res.count or 0,
                    live_projects=live_res.count or 0,
                    dev_projects=dev_res.count or 0,
                    total_categories=cat_res.count or 0
                )
            except Exception:
                pass

        total_proj = len(_mock_projects)
        live_proj = sum(1 for p in _mock_projects if p.get("status") == "Live")
        dev_proj = sum(1 for p in _mock_projects if p.get("status") == "In Development")
        categories = CategoryService.get_all()

        return DashboardStats(
            total_projects=total_proj,
            live_projects=live_proj,
            dev_projects=dev_proj,
            total_categories=len(categories)
        )

