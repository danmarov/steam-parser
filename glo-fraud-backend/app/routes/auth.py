from typing import Optional

from fastapi import APIRouter, Depends, Request, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import LoginRequest, TokenResponse
from app.services.auth_service import login, logout, refresh

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login_endpoint(
        login_request: LoginRequest,
        request: Request,
        db: Session = Depends(get_db)
):
    username = login_request.username
    password = login_request.password
    user_agent = request.headers.get("user-agent", "")
    data = login(username, password, user_agent, db)
    response = JSONResponse(content=data)
    secure_cookie = request.url.scheme == "https"
    response.set_cookie(
        key="refresh_token",
        value=data["refresh_token"],
        max_age=30 * 24 * 60 * 60,
        httponly=True,
        secure=secure_cookie
    )
    return response


@router.post("/logout")
async def logout_endpoint(
        request: Request,
        db: Session = Depends(get_db),
        refresh_token: Optional[str] = Cookie(None)
):
    user_agent = request.headers.get("user-agent", "")
    data = logout(refresh_token, user_agent, db)
    response = JSONResponse(content=data)
    response.delete_cookie("refresh_token")
    return response


@router.get("/refresh", response_model=TokenResponse)
async def refresh_endpoint(
        request: Request,
        db: Session = Depends(get_db),
        refresh_token: Optional[str] = Cookie(None)
):
    user_agent = request.headers.get("user-agent", "")
    data = refresh(refresh_token, user_agent, db)
    response = JSONResponse(content=data)
    secure_cookie = request.url.scheme == "https"
    response.set_cookie(
        key="refresh_token",
        value=data["refresh_token"],
        max_age=30 * 24 * 60 * 60,
        httponly=True,
        secure=secure_cookie
    )
    return response
