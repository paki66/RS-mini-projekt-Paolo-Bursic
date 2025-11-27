from fastapi import APIRouter, HTTPException
import uuid
from ..model.user import LoginRequest, LoginResponse
from ..storage import users_db

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate a user with just a username.
    Returns userId and username on success.
    """
    if not request.username or len(request.username.strip()) == 0:
        raise HTTPException(status_code=400, detail="Username is required")

    if len(request.username) > 50:
        raise HTTPException(status_code=400, detail="Username too long (max 50 characters)")

    # Generate userId or retrieve existing one
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    users_db[user_id] = request.username

    return LoginResponse(
        success=True,
        userId=user_id,
        username=request.username,
        message="Login successful"
    )