"""
Comprehensive Supabase & API verification script for KALPANAAM SOFTWARE SOLUTIONS.
Tests:
1. Connectivity & Environment
2. Storage Bucket Status
3. Database Tables Status (categories, projects)
4. Full API CRUD cycle against live Supabase backend
"""

import os
import sys
import uuid
from dotenv import load_dotenv
from supabase import create_client
from fastapi.testclient import TestClient

# Load backend environment (works from root or backend directory)
if os.path.exists(".env"):
    load_dotenv(".env")
elif os.path.exists("backend/.env"):
    load_dotenv("backend/.env")

def mask(val: str) -> str:
    if not val:
        return "NOT_SET"
    if len(val) < 8:
        return f"{val[:2]}... (len {len(val)})"
    return f"{val[:6]}...{val[-4:]} (len {len(val)})"

def run_verification():
    print("=" * 70)
    print("KALPANAAM SOFTWARE SOLUTIONS - SUPABASE VERIFICATION RUNNER")
    print("=" * 70)

    url = os.getenv("SUPABASE_URL", "")
    anon = os.getenv("SUPABASE_ANON_KEY", "")
    service = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")

    # 1. Environment Verification
    print("\n[STEP 1: Environment Verification]")
    print(f"  • SUPABASE_URL:             {url}")
    print(f"  • SUPABASE_ANON_KEY:        {mask(anon)}")
    print(f"  • SUPABASE_SERVICE_ROLE_KEY:{mask(service)}")
    print(f"  • SUPABASE_JWT_SECRET:      {mask(jwt_secret)}")

    if not url or "your-project" in url:
        print("  [ERROR] Real SUPABASE_URL is not set.")
        return False
    if not service or "your-supabase" in service:
        print("  [ERROR] Real SUPABASE_SERVICE_ROLE_KEY is not set.")
        return False

    print("  ✓ All required environment variables loaded and formatted correctly.")

    # 2. Supabase Connectivity
    print("\n[STEP 2: Supabase Connectivity]")
    try:
        client = create_client(url, service)
        print("  ✓ Supabase client initialized.")
    except Exception as e:
        print(f"  ✗ Failed to initialize client: {e}")
        return False

    # 3. Storage Configuration
    print("\n[STEP 3: Storage Configuration]")
    try:
        buckets = client.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        print(f"  • Found buckets: {bucket_names}")
        if "company-project-assets" in bucket_names:
            print("  ✓ 'company-project-assets' bucket exists and is ready.")
        else:
            print("  • Creating 'company-project-assets' bucket...")
            client.storage.create_bucket("company-project-assets", options={"public": True})
            print("  ✓ 'company-project-assets' bucket created.")
    except Exception as e:
        print(f"  ✗ Storage check error: {e}")

    # 4. Database Schema Check
    print("\n[STEP 4: Database Schema Check]")
    schema_ready = True
    try:
        cat_res = client.table("categories").select("*").limit(5).execute()
        print(f"  ✓ 'categories' table verified. Records found: {len(cat_res.data)}")
    except Exception as e:
        print(f"  ✗ 'categories' table not ready: {e}")
        schema_ready = False

    try:
        proj_res = client.table("projects").select("*").limit(5).execute()
        print(f"  ✓ 'projects' table verified. Records found: {len(proj_res.data)}")
    except Exception as e:
        print(f"  ✗ 'projects' table not ready: {e}")
        schema_ready = False

    if not schema_ready:
        print("\n  [ACTION REQUIRED]:")
        print("  Please execute 'backend/migrations/01_initial_schema.sql' and")
        print("  'backend/migrations/02_seed_data.sql' in your Supabase SQL Editor.")
        return False

    # 5. Live Backend API Verification
    print("\n[STEP 5: Backend API Verification]")
    from app.main import app
    test_client = TestClient(app)

    # A. GET /api/v1/projects
    r = test_client.get("/api/v1/projects")
    assert r.status_code == 200, f"GET /projects failed: {r.text}"
    print(f"  ✓ GET /api/v1/projects: 200 OK (returned {len(r.json()['data'])} projects)")

    # B. GET /api/v1/categories
    r = test_client.get("/api/v1/categories")
    assert r.status_code == 200, f"GET /categories failed: {r.text}"
    print(f"  ✓ GET /api/v1/categories: 200 OK (returned {len(r.json()['data'])} categories)")

    # C. GET /api/v1/dashboard/stats
    r = test_client.get("/api/v1/dashboard/stats")
    assert r.status_code == 200, f"GET /dashboard/stats failed: {r.text}"
    stats = r.json()["data"]
    dev_count = stats.get("dev_projects", stats.get("in_development", 0))
    print(f"  ✓ GET /api/v1/dashboard/stats: 200 OK (Live: {stats.get('live_projects')}, Dev: {dev_count}, Total: {stats.get('total_projects')})")

    # D. POST /api/v1/projects (Create)
    test_name = f"Verif Test Project {uuid.uuid4().hex[:6]}"
    new_proj = {
        "name": test_name,
        "description": "Verification project for Supabase integration testing.",
        "category": "Enterprise",
        "status": "In Development",
        "technologies": ["Python", "FastAPI", "Supabase"],
        "figmaUrl": "https://figma.com/test",
        "docUrl": "https://docs.kalpanaam.com/test"
    }
    r = test_client.post("/api/v1/projects", json=new_proj)
    assert r.status_code == 201, f"POST /projects failed: {r.text}"
    created_id = r.json()["data"]["id"]
    print(f"  ✓ POST /api/v1/projects: 201 Created (ID: {created_id})")

    # E. GET /api/v1/projects/{id}
    r = test_client.get(f"/api/v1/projects/{created_id}")
    assert r.status_code == 200, f"GET /projects/{created_id} failed: {r.text}"
    print(f"  ✓ GET /api/v1/projects/{{id}}: 200 OK")

    # F. PUT /api/v1/projects/{id}
    update_data = {"description": "Updated description for verification test."}
    r = test_client.put(f"/api/v1/projects/{created_id}", json=update_data)
    assert r.status_code == 200, f"PUT /projects/{created_id} failed: {r.text}"
    print(f"  ✓ PUT /api/v1/projects/{{id}}: 200 OK")

    # G. DELETE /api/v1/projects/{id}
    r = test_client.delete(f"/api/v1/projects/{created_id}")
    assert r.status_code in (200, 204), f"DELETE /projects/{created_id} failed: {r.status_code} {r.text}"
    print(f"  ✓ DELETE /api/v1/projects/{{id}}: {r.status_code} OK")

    print("\n" + "=" * 70)
    print("ALL API ENDPOINTS SUCCESSFULLY VERIFIED AGAINST LIVE SUPABASE DATABASE!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
