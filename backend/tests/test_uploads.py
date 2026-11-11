import io
import pytest


def test_upload_valid_file(client):
    file_bytes = b"fake-png-content-stream"
    file_obj = ("screenshot.png", io.BytesIO(file_bytes), "image/png")
    response = client.post(
        "/api/v1/uploads?folder=screenshots",
        files={"file": file_obj}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "url" in data["data"]
    assert "storage_path" in data["data"]


def test_upload_invalid_mime_type(client):
    file_bytes = b"echo 'dangerous executable'"
    file_obj = ("script.exe", io.BytesIO(file_bytes), "application/x-msdownload")
    response = client.post(
        "/api/v1/uploads",
        files={"file": file_obj}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_cloudinary_upload_invalid_format(client):
    file_bytes = b"not an image file"
    file_obj = ("document.pdf", io.BytesIO(file_bytes), "application/pdf")
    response = client.post(
        "/api/v1/uploads/project-image",
        files={"file": file_obj}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_cloudinary_upload_file_too_large(client):
    # Exceed 5 MB limit
    large_bytes = b"0" * (5 * 1024 * 1024 + 1024)
    file_obj = ("huge.png", io.BytesIO(large_bytes), "image/png")
    response = client.post(
        "/api/v1/uploads/project-image",
        files={"file": file_obj}
    )
    assert response.status_code == 400
    assert "exceeds maximum allowed size" in response.json()["detail"]

