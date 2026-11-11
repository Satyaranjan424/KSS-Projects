from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Category name")
    description: Optional[str] = Field(None, description="Category description")


class CategoryCreate(CategoryBase):
    slug: Optional[str] = Field(None, max_length=100, description="URL-friendly slug (auto-generated if omitted)")


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    slug: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: str
    slug: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

