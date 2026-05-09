from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from backend.config import settings
from backend.models.response import UserPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserPayload:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Supabase JWT tokens are signed with the project JWT secret
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM], 
            audience="authenticated"
        )
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        user_metadata = payload.get("user_metadata", {})
        role = user_metadata.get("role")
        name = user_metadata.get("name")
        
        if user_id is None or email is None or role is None:
            raise credentials_exception
            
        return UserPayload(user_id=user_id, email=email, role=role, name=name)
    except JWTError:
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
