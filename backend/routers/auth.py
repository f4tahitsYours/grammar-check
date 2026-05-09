from fastapi import APIRouter, HTTPException, status
from backend.models.request import LoginRequest, RegisterRequest
from backend.models.response import LoginResponse, RegisterResponse
from backend.services.mcp_clients import SupabaseAuthMCP
from gotrue.errors import AuthApiError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
auth_mcp = SupabaseAuthMCP()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        result = await auth_mcp.sign_in(request.email, request.password)
        session = result["session"]
        user = result["user"]
        
        metadata = user.user_metadata or {}
        
        return LoginResponse(
            access_token=session.access_token,
            role=metadata.get("role", "student"),
            user_id=str(user.id),
            name=metadata.get("name", "Unknown")
        )
    except AuthApiError as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    try:
        if request.role not in ['student', 'teacher', 'admin']:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid role"
            )
            
        metadata = {
            "name": request.name,
            "role": request.role,
            "class_name": request.class_name
        }
        
        result = await auth_mcp.sign_up(request.email, request.password, metadata)
        user = result["user"]
        
        try:
            auth_mcp.admin_client.table("users").insert({
                "id": str(user.id),
                "email": request.email,
                "name": request.name,
                "role": request.role,
                "class_name": request.class_name
            }).execute()
        except Exception as db_e:
            logger.error(f"Failed to insert user into public.users: {str(db_e)}")
            # In MVP mode, log the issue and continue as Supabase Auth registration succeeded

        return RegisterResponse(
            user_id=str(user.id),
            email=request.email,
            role=request.role
        )
    except AuthApiError as e:
        if "already registered" in str(e).lower() or "already exists" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
