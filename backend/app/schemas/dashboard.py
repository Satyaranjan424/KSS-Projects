from pydantic import BaseModel, Field


class DashboardStats(BaseModel):
    total_projects: int = Field(default=0, description="Total number of projects registered")
    live_projects: int = Field(default=0, description="Total number of live projects")
    dev_projects: int = Field(default=0, description="Total number of projects currently under development")
    total_categories: int = Field(default=0, description="Total number of project categories")

