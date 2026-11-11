from typing import Optional, List, Union
from datetime import datetime
import re
from pydantic import BaseModel, Field, field_validator, ConfigDict


def generate_slug(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", slug)


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Project name")
    description: str = Field(..., min_length=5, description="Project description")
    category_name: Optional[str] = Field(None, description="Category name (e.g. Healthcare)")
    category_id: Optional[str] = Field(None, description="Category UUID")
    status: str = Field(default="Live", description="Status: Live or In Development")
    technologies: List[str] = Field(default_factory=list, description="Array of tech stack items")
    preview_image_url: Optional[str] = Field(None, description="Screenshot or preview image URL")
    image_url: Optional[str] = Field(None, description="Cloudinary project image URL")
    image_public_id: Optional[str] = Field(None, description="Cloudinary image public ID for deletion")
    preview_type: Optional[str] = Field("generic", description="Preview template identifier for UI rendering")
    icon: Optional[str] = Field("layers", description="Lucide icon identifier")
    logo_url: Optional[str] = Field(None, description="Logo URL")
    logo_public_id: Optional[str] = Field(None, description="Cloudinary logo public ID for deletion")
    live_url: Optional[str] = Field(None, description="Deployed application live URL")
    figma_url: Optional[str] = Field(None, description="Figma UI/UX design URL")
    documentation_url: Optional[str] = Field(None, description="Technical documentation URL")
    is_featured: bool = Field(default=False, description="Whether project is featured")
    display_order: int = Field(default=0, description="Display sort order")

    # Frontend camelCase compatibility aliases accepted upon creation
    category: Optional[str] = Field(None, description="Alias for category_name")
    previewImage: Optional[str] = Field(None, description="Alias for preview_image_url")
    imageUrl: Optional[str] = Field(None, description="Alias for image_url")
    imagePublicId: Optional[str] = Field(None, description="Alias for image_public_id")
    logoPublicId: Optional[str] = Field(None, description="Alias for logo_public_id")
    previewType: Optional[str] = Field(None, description="Alias for preview_type")
    liveUrl: Optional[str] = Field(None, description="Alias for live_url")
    figmaUrl: Optional[str] = Field(None, description="Alias for figma_url")
    docUrl: Optional[str] = Field(None, description="Alias for documentation_url")
    isFeatured: Optional[bool] = Field(None, description="Alias for is_featured")
    displayOrder: Optional[Union[int, str]] = Field(None, description="Alias for display_order")

    @field_validator("status")
    @classmethod
    def normalize_status(cls, v: str) -> str:
        if not v:
            return "Live"
        lower = v.strip().lower()
        if lower in ["live", "completed", "active"]:
            return "Live"
        if lower in ["in development", "in_development", "development", "dev"]:
            return "In Development"
        return v


class ProjectCreate(ProjectBase):
    slug: Optional[str] = Field(None, description="Slug; auto-generated from name if omitted")


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = None
    description: Optional[str] = None
    category_name: Optional[str] = None
    category_id: Optional[str] = None
    status: Optional[str] = None
    technologies: Optional[List[str]] = None
    preview_image_url: Optional[str] = None
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    preview_type: Optional[str] = None
    icon: Optional[str] = None
    logo_url: Optional[str] = None
    logo_public_id: Optional[str] = None
    live_url: Optional[str] = None
    figma_url: Optional[str] = None
    documentation_url: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None

    # camelCase aliases
    category: Optional[str] = None
    previewImage: Optional[str] = None
    imageUrl: Optional[str] = None
    imagePublicId: Optional[str] = None
    logoPublicId: Optional[str] = None
    previewType: Optional[str] = None
    liveUrl: Optional[str] = None
    figmaUrl: Optional[str] = None
    docUrl: Optional[str] = None
    isFeatured: Optional[bool] = None
    displayOrder: Optional[Union[int, str]] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    category: str = Field(..., description="Category name for frontend")
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    status: str
    technologies: List[str] = Field(default_factory=list)
    preview_image_url: Optional[str] = None
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    preview_type: Optional[str] = "generic"
    icon: Optional[str] = "layers"
    logo_url: Optional[str] = None
    logo_public_id: Optional[str] = None
    live_url: Optional[str] = None
    figma_url: Optional[str] = None
    documentation_url: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Frontend camelCase aliases
    previewImage: Optional[str] = None
    imageUrl: Optional[str] = None
    imagePublicId: Optional[str] = None
    logoPublicId: Optional[str] = None
    previewType: Optional[str] = None
    liveUrl: Optional[str] = None
    figmaUrl: Optional[str] = None
    docUrl: Optional[str] = None
    isFeatured: Optional[bool] = None
    displayOrder: Optional[int] = None
    createdAt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

