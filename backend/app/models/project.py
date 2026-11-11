from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
import uuid

@dataclass
class Project:
    name: str
    slug: str
    description: str
    category_name: str
    status: str = "Live"
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    category_id: Optional[str] = None
    technologies: List[str] = field(default_factory=list)
    preview_image_url: Optional[str] = None
    preview_type: str = "generic"
    icon: str = "layers"
    logo_url: Optional[str] = None
    live_url: Optional[str] = None
    figma_url: Optional[str] = None
    documentation_url: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

