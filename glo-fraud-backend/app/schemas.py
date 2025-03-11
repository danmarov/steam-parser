from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    id: Optional[int]
    username: str
    access_token: str
    refresh_token: str


class ProfileResponse(BaseModel):
    id: Optional[int]
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    status: Optional[str] = None
    mentor_user_id: Optional[int] = None
    join_time: Optional[datetime] = None
