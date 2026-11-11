# KALPANAAM SOFTWARE SOLUTIONS PVT LTD
## Company Projects Dashboard – Backend API Service

A production-ready, high-performance REST API built with **Python 3.12+**, **FastAPI**, and **Supabase PostgreSQL & Storage**, designed to centrally store, organize, manage, and showcase company projects.

---

## 1. Architecture & Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry, CORS, health check
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic v2 application settings from .env
│   │   └── security.py          # Supabase JWT & role authentication
│   ├── database/
│   │   ├── __init__.py
│   │   └── supabase.py          # Official Supabase client factory & offline detector
│   ├── models/
│   │   ├── __init__.py
│   │   ├── category.py          # Category model representation
│   │   └── project.py           # Project model representation
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py            # PaginationMeta & StandardResponse envelopes
│   │   ├── category.py          # CategoryCreate, CategoryUpdate, CategoryResponse
│   │   ├── project.py           # ProjectCreate, ProjectUpdate, ProjectResponse
│   │   └── dashboard.py         # DashboardStats schema
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── projects.py          # Projects CRUD & filter endpoints (/api/v1/projects)
│   │   ├── categories.py        # Categories CRUD (/api/v1/categories)
│   │   ├── dashboard.py         # Statistics endpoint (/api/v1/dashboard/stats)
│   │   ├── uploads.py           # Storage upload endpoint (/api/v1/uploads)
│   │   └── auth.py              # Supabase Auth verification (/api/v1/auth)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── project_service.py   # Business logic, search, filters, pagination, sort
│   │   ├── category_service.py  # Category queries & duplicate protection
│   │   └── storage_service.py   # MIME validation, size limit (10MB), bucket upload
│   └── utils/
│       ├── __init__.py
│       └── pagination.py        # Pagination calculator and slice helpers
├── migrations/
│   ├── 01_initial_schema.sql    # Tables, indexes, triggers, RLS, storage bucket
│   └── 02_seed_data.sql         # 10 company categories & 20 company projects
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest fixtures and mock client initialization
│   ├── test_projects.py         # 11 project test cases (CRUD, search, sort, filter)
│   ├── test_categories.py       # 4 category test cases (list, create, duplicate, update)
│   ├── test_dashboard.py        # Dashboard stats verification
│   ├── test_uploads.py          # File upload & MIME validation tests
│   └── test_auth.py             # Auth status & token tests
├── .env.example                 # Environment configuration template
├── .gitignore                   # Git exclusion rules
├── pytest.ini                   # Pytest configuration
├── requirements.txt             # Python dependencies
└── README.md                    # Backend documentation
```

---

## 2. Prerequisites

- Python 3.12+ (or Python 3.14+)
- A Supabase project ([supabase.com](https://supabase.com))
- Pip / virtualenv

---

## 3. Setup Instructions

### Step 1: Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials from your Supabase dashboard:
- `SUPABASE_URL`: Found in **Project Settings > API > Project URL**
- `SUPABASE_ANON_KEY`: Found in **Project Settings > API > Project API Keys > `anon` `public`**
- `SUPABASE_SERVICE_ROLE_KEY`: Found in **Project Settings > API > Project API Keys > `service_role` `secret`**
- `SUPABASE_JWT_SECRET`: Found in **Project Settings > API > JWT Settings > JWT Secret**

*(Note: When credentials are not yet configured, the backend automatically operates in resilient fallback mode with seed data so you can test immediately.)*

---

## 4. Supabase Database & Storage Setup

1. Open your Supabase project dashboard.
2. Navigate to **SQL Editor**.
3. Create a **New query** and paste the contents of `backend/migrations/01_initial_schema.sql`. Run the query. This creates:
   - `categories` table with UUID primary key and uniqueness constraint.
   - `projects` table with UUID primary key, status constraints, and JSONB/array technologies.
   - Performance indexes on `status`, `category_id`, `created_at`, `display_order`, and `slug`.
   - Full-text search index across project name and description.
   - Row Level Security (RLS) policies allowing public reads and authenticated/admin modifications.
   - Auto-updating `updated_at` trigger.
   - Supabase Storage bucket `company-project-assets` configured with public read access.
4. Create another **New query** and paste the contents of `backend/migrations/02_seed_data.sql`. Run the query. This seeds:
   - 10 company industry categories (Healthcare, Education, Enterprise, AI / ML, etc.).
   - 20 complete company showcase projects matching the portfolio design.

---

## 5. Running the Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- Base API: `http://localhost:8000/api/v1`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

---

## 6. API Reference Summary

### Projects (`/api/v1/projects`)
- `GET /api/v1/projects`: List projects with filters, search, sorting, and pagination.
  - Query parameters:
    - `page` (int, default: 1)
    - `limit` (int, default: 10)
    - `status` (`Live`, `In Development`, or `All`)
    - `category` (string, category name or UUID)
    - `technology` (string, filter by tech)
    - `search` (string, multi-field search)
    - `sort_by` (`latest`, `oldest`, `az`, `za`)
- `GET /api/v1/projects/{project_id}`: Get single project by UUID or slug.
- `POST /api/v1/projects`: Create a new project.
- `PUT /api/v1/projects/{project_id}`: Update project details.
- `DELETE /api/v1/projects/{project_id}`: Delete a project.

### Categories (`/api/v1/categories`)
- `GET /api/v1/categories`: List all categories.
- `POST /api/v1/categories`: Create category (admin/authenticated).
- `PUT /api/v1/categories/{category_id}`: Update category.
- `DELETE /api/v1/categories/{category_id}`: Delete category.

### Dashboard (`/api/v1/dashboard`)
- `GET /api/v1/dashboard/stats`: Returns live counts, development counts, and total projects.

### File Uploads (`/api/v1/uploads`)
- `POST /api/v1/uploads`: Upload image asset (PNG, JPG, WebP, SVG, GIF up to 10MB) to Supabase Storage. Returns public asset URL.

### Authentication (`/api/v1/auth`)
- `GET /api/v1/auth/status`: Check Supabase Auth integration status.
- `GET /api/v1/auth/me`: Get current authenticated user details from Bearer token.

---

## 7. Running the Automated Test Suite

To run the comprehensive pytest suite:

**Windows (PowerShell):**
```powershell
cd backend
$env:PYTHONPATH="app;.env"; .\.venv\Scripts\pytest.exe -v
```

**macOS / Linux:**
```bash
cd backend
PYTHONPATH=app pytest -v
```

**Test Coverage Highlights:**
- `test_projects.py`: List, pagination, status filtering, multi-word search, A-Z and Z-A sorting, single project retrieval, 404 validation, project creation, validation errors, updates, and deletion.
- `test_categories.py`: Category listing, category creation, duplicate conflict detection, category updates.
- `test_dashboard.py`: Statistics calculation (live count, in-development count, total count).
- `test_uploads.py`: Valid multipart file upload and invalid MIME type rejection (400 Bad Request).
- `test_auth.py`: Status endpoint check and 401 unauthenticated token rejection.

