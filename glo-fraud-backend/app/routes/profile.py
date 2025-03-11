from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.database import get_db
from app.services.auth_service import profile_get

router = APIRouter()


@router.get("/profile")
async def profile_get_endpoint(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.get("user_id")
    profile = profile_get(user_id, db)
    return {"message": "User profile", "profile": profile}
