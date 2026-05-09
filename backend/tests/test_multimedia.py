"""
Test suite for multimedia API endpoints (poster and TTS generation).
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from backend.routers.student import router
from backend.models.response import UserPayload
from backend.dependencies import require_student
from fastapi.testclient import TestClient
from fastapi import FastAPI

# Create test app
app = FastAPI()
app.include_router(router)


@pytest.fixture
def mock_student_user():
    """Mock student user for authentication."""
    return UserPayload(
        user_id="student-123",
        email="student@test.com",
        role="student",
        name="Test Student"
    )


@pytest.fixture
def override_auth(mock_student_user):
    """Override authentication dependency."""
    async def mock_require_student():
        return mock_student_user
    
    app.dependency_overrides[require_student] = mock_require_student
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch('backend.routers.student.get_supabase_client') as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


def test_poster_generation_success(override_auth, mock_supabase):
    """Test 1: Poster generation success → returns valid URL"""
    submission_id = str(uuid4())
    
    # Mock submission lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "student_id": "student-123",
            "corrected_text": "This is a test submission about nature and wildlife."
        }]
    )
    
    # Mock poster generation
    with patch('backend.routers.student.generate_poster') as mock_generate:
        mock_generate.return_value = "https://supabase.co/storage/v1/object/public/posters/test.png"
        
        client = TestClient(app)
        response = client.post(
            "/api/v1/student/poster/generate",
            params={"submission_id": submission_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "poster_url" in data
        assert data["poster_url"].startswith("https://")
        assert "posters" in data["poster_url"]


def test_poster_generation_dalle_failure(override_auth, mock_supabase):
    """Test 2: DALL-E failure → returns placeholder URL, not HTTP 500"""
    submission_id = str(uuid4())
    
    # Mock submission lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "student_id": "student-123",
            "corrected_text": "This is a test submission."
        }]
    )
    
    # Mock poster generation failure
    with patch('backend.routers.student.generate_poster') as mock_generate:
        from backend.services.poster import PosterGenerationError
        mock_generate.side_effect = PosterGenerationError("DALL-E API error")
        
        client = TestClient(app)
        response = client.post(
            "/api/v1/student/poster/generate",
            params={"submission_id": submission_id}
        )
        
        # Should return 200, not 500
        assert response.status_code == 200
        data = response.json()
        assert "poster_url" in data
        # Should be placeholder URL
        assert "placeholder.png" in data["poster_url"]


def test_tts_generation_success(override_auth, mock_supabase):
    """Test 3: TTS generation success → returns valid audio URL"""
    submission_id = str(uuid4())
    
    # Mock submission lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "student_id": "student-123",
            "corrected_text": "This is a test submission for TTS generation."
        }]
    )
    
    # Mock TTS generation
    with patch('backend.routers.student.generate_tts') as mock_generate:
        mock_generate.return_value = "https://supabase.co/storage/v1/object/public/audio/test.mp3"
        
        client = TestClient(app)
        response = client.post(
            "/api/v1/student/tts/generate",
            params={"submission_id": submission_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "audio_url" in data
        assert data["audio_url"] is not None
        assert data["audio_url"].startswith("https://")
        assert "audio" in data["audio_url"]


def test_tts_generation_failure(override_auth, mock_supabase):
    """Test 4: TTS failure → returns null, not HTTP 500"""
    submission_id = str(uuid4())
    
    # Mock submission lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "student_id": "student-123",
            "corrected_text": "This is a test submission."
        }]
    )
    
    # Mock TTS generation failure
    with patch('backend.routers.student.generate_tts') as mock_generate:
        from backend.services.tts import TTSGenerationError
        mock_generate.side_effect = TTSGenerationError("OpenAI TTS API error")
        
        client = TestClient(app)
        response = client.post(
            "/api/v1/student/tts/generate",
            params={"submission_id": submission_id}
        )
        
        # Should return 200, not 500
        assert response.status_code == 200
        data = response.json()
        assert "audio_url" in data
        # Should be null (frontend uses Web Speech API)
        assert data["audio_url"] is None
