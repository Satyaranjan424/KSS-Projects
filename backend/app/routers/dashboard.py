from fastapi import APIRouter
from app.schemas.common import StandardResponse
from app.schemas.dashboard import DashboardStats
from app.services.project_service import ProjectService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=StandardResponse[DashboardStats])
def get_dashboard_stats():
    """
    Retrieve real-time database dashboard statistics:
    - Total projects
    - Live projects
    - Projects in development
    - Total categories
    """
    stats = ProjectService.get_dashboard_stats()
    return StandardResponse(
        success=True,
        message="Dashboard statistics retrieved successfully",
        data=stats
    )

