import uuid
import pytest


def test_get_projects_list(client):
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert isinstance(data["data"], list)
    assert "pagination" in data


def test_get_projects_pagination(client):
    response = client.get("/api/v1/projects?page=1&limit=6")
    assert response.status_code == 200
    data = response.json()
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["limit"] == 6


def test_create_and_filter_project(client):
    suffix = uuid.uuid4().hex[:6]
    new_proj = {
        "name": f"Live Test {suffix}",
        "description": "Smart telemetry hub with soil sensors and automated valves.",
        "category": "CleanTech",
        "status": "Live",
        "technologies": ["Python", "FastAPI", "MQTT"],
        "liveUrl": "https://example.com"
    }
    res_post = client.post("/api/v1/projects", json=new_proj)
    assert res_post.status_code == 201
    created = res_post.json()["data"]

    # Status filter
    res_live = client.get("/api/v1/projects?status=Live")
    assert res_live.status_code == 200
    assert any(p["id"] == created["id"] for p in res_live.json()["data"])

    # Search filter
    res_search = client.get(f"/api/v1/projects?search={suffix}")
    assert res_search.status_code == 200
    assert any(p["id"] == created["id"] for p in res_search.json()["data"])

    # Single project lookup
    res_single = client.get(f"/api/v1/projects/{created['id']}")
    assert res_single.status_code == 200
    assert res_single.json()["data"]["name"] == new_proj["name"]

    # Update project
    update_data = {
        "description": "Updated description with new telemetry details."
    }
    res_put = client.put(f"/api/v1/projects/{created['id']}", json=update_data)
    assert res_put.status_code == 200
    assert res_put.json()["data"]["description"] == update_data["description"]

    # Delete project
    del_res = client.delete(f"/api/v1/projects/{created['id']}")
    assert del_res.status_code == 204


def test_get_single_project_not_found(client):
    response = client.get("/api/v1/projects/non-existent-project-id-9999")
    assert response.status_code == 404


def test_create_project_validation_error(client):
    invalid_proj = {
        "status": "Live"
    }
    response = client.post("/api/v1/projects", json=invalid_proj)
    assert response.status_code == 422


def test_delete_project(client):
    temp_proj = {
        "name": "Temporary Test Project",
        "description": "Testing deletion endpoint.",
        "category": "Enterprise",
        "status": "In Development"
    }
    create_res = client.post("/api/v1/projects", json=temp_proj)
    assert create_res.status_code == 201
    proj_id = create_res.json()["data"]["id"]

    # Delete
    del_res = client.delete(f"/api/v1/projects/{proj_id}")
    assert del_res.status_code == 204

    # Verify not found
    get_res = client.get(f"/api/v1/projects/{proj_id}")
    assert get_res.status_code == 404
