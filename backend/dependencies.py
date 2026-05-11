from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import create_client, Client
import logging

from backend.config import settings
from backend.models.response import UserPayload

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def _get_supabase_client() -> Client:
    """Get Supabase client for token verification."""
    return create_client(settings.supabase_url, settings.supabase_key)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserPayload:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Verify token via Supabase (handles ES256 algorithm correctly)
        client = _get_supabase_client()
        user_response = client.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise credentials_exception
        
        user = user_response.user
        user_metadata = user.user_metadata or {}
        
        # Extract role from user_metadata (new Supabase format)
        role = user_metadata.get("role")
        name = user_metadata.get("name", "Unknown")
        
        if not role:
            logger.warning(f"User {user.id} has no role in user_metadata")
            raise credentials_exception
        
        return UserPayload(
            user_id=str(user.id),
            email=user.email,
            role=role,
            name=name
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
        raise credentials_exception

async def require_student(user: UserPayload = Depends(get_current_user)) -> UserPayload:
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Student access required"
        )
    return user

async def require_teacher(user: UserPayload = Depends(get_current_user)) -> UserPayload:
    if user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Teacher access required"
        )
    return user

async def require_admin(user: UserPayload = Depends(get_current_user)) -> UserPayload:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin access required"
        )
    return user
