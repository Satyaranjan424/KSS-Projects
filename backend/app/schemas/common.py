from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int = Field(default=1, ge=1, description="Current page number")
    limit: int = Field(default=10, ge=1, le=100, description="Items per page")
    total: int = Field(default=0, ge=0, description="Total matching items count")
    total_pages: int = Field(default=0, ge=0, description="Total pages available")


class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    pagination: Optional[PaginationMeta] = None

