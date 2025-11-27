from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    username: str


class LoginResponse(BaseModel):
    success: bool
    userId: str
    username: str
    message: Optional[str] = None