import pytest


def test_get_dashboard_stats(client):
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    stats = data["data"]
    assert stats["total_projects"] >= 0
    assert stats["live_projects"] >= 0
    assert stats["dev_projects"] >= 0
    assert stats["total_projects"] == stats["live_projects"] + stats["dev_projects"]
