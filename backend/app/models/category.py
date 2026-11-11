from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
import uuid

@dataclass
class Category:
    name: str
    slug: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

