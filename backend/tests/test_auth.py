import pytest


def test_auth_status(client):
    response = client.get("/api/v1/auth/status")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "supabase_configured" in data["data"]
    assert "storage_bucket" in data["data"]


def test_unauthenticated_me(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["success"] is False

