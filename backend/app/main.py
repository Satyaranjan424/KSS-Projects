from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
from app.core.config import settings
from app.routers import projects, categories, dashboard, uploads, auth

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Centralized RESTful API to store, manage, and showcase company projects for KALPANAAM SOFTWARE SOLUTIONS PVT LTD.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global validation exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        errors.append(f"{field}: {err.get('msg')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error: " + "; ".join(errors),
            "data": None,
            "errors": exc.errors()
        }
    )

# HTTP exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    headers = getattr(exc, "headers", None) or {}
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail if isinstance(exc.detail, str) else "Request error",
            "detail": exc.detail,
            "data": None
        },
        headers=headers
    )

# Global internal server error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return await http_exception_handler(request, exc)
    logging.getLogger("app").error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred while processing the request.",
            "detail": str(exc),
            "data": None
        }
    )

# Include Routers under API_V1_STR
api_prefix = settings.API_V1_STR
app.include_router(projects.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(uploads.router, prefix=api_prefix)
app.include_router(auth.router, prefix=api_prefix)


@app.get("/", tags=["Health"])
def root():
    return {
        "success": True,
        "message": "Welcome to KALPANAAM SOFTWARE SOLUTIONS Projects API",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

