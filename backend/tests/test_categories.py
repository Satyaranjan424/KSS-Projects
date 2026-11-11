import uuid
import pytest


def test_get_categories(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 10
    names = [c["name"] for c in data["data"]]
    assert "Healthcare" in names
    assert "AI / ML" in names


def test_create_category(client):
    suffix = uuid.uuid4().hex[:6]
    new_cat = {
        "name": f"Robotics {suffix}",
        "description": "Industrial robotic suites and ROS controllers."
    }
    response = client.post("/api/v1/categories", json=new_cat)
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == new_cat["name"]
    assert "robotics" in data["data"]["slug"]


def test_create_category_duplicate_error(client):
    dup_cat = {
        "name": "Healthcare",
        "description": "Duplicate category test"
    }
    response = client.post("/api/v1/categories", json=dup_cat)
    assert response.status_code == 400


def test_update_category(client):
    # Retrieve healthcare
    cats = client.get("/api/v1/categories").json()["data"]
    health_cat = next(c for c in cats if c["name"] == "Healthcare")

    update_payload = {"description": "Updated medical and clinical portal systems."}
    response = client.put(f"/api/v1/categories/{health_cat['id']}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["data"]["description"] == update_payload["description"]

