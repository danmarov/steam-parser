from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
from app.models import Worker, Token
from app.services.utils import verify_password

ACCESS_TOKEN_EXPIRE_SECONDS = 60
REFRESH_TOKEN_EXPIRE_DAYS = 30


def generate_tokens(payload: dict):
    now = datetime.now(timezone.utc)
    access_payload = payload.copy()
    access_payload["iat"] = now.timestamp()
    access_payload["exp"] = now + timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)

    refresh_payload = payload.copy()
    refresh_payload["iat"] = now.timestamp()
    refresh_payload["exp"] = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = jwt.encode(access_payload, JWT_ACCESS_SECRET, algorithm="HS256")
    refresh_token = jwt.encode(refresh_payload, JWT_REFRESH_SECRET, algorithm="HS256")
    return access_token, refresh_token


def login(username: str, password: str, user_agent: str, db: Session):
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Все поля обязательны для заполнения.")

    user = db.query(Worker).filter(Worker.username == username).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверные учетные данные.")

    payload = {
        "user_id": user.user_id,
        "username": user.username,
        "user_agent": user.tokens[0].user_agent if user.tokens else user_agent
    }
    access_token, refresh_token = generate_tokens(payload)

    token_obj = db.query(Token).filter_by(worker_username=user.username, user_agent=user_agent).first()
    token_expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    if token_obj:
        token_obj.token = refresh_token
        token_obj.expires = token_expires
    else:
        token_obj = Token(
            token=refresh_token,
            worker_username=str(user.username),
            user_agent=user_agent,
            expires=token_expires
        )
        db.add(token_obj)
    db.commit()

    response = {
        "id": user.user_id,
        "username": user.username,
        "access_token": access_token,
        "refresh_token": refresh_token,
    }
    return response


def logout(refresh_token: str, user_agent: str, db: Session):
    deleted = db.query(Token).filter_by(token=refresh_token, user_agent=user_agent).delete()
    db.commit()
    if not deleted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ошибка авторизации")
    return {"result": True}


def refresh(refresh_token: str, user_agent: str, db: Session):
    try:
        jwt.decode(refresh_token, JWT_REFRESH_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ошибка авторизации")

    token_obj = db.query(Token).filter_by(token=refresh_token, user_agent=user_agent).first()
    if not token_obj:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ошибка авторизации")

    user = db.query(Worker).filter_by(username=token_obj.worker_username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь не найден")

    new_payload = {
        "user_id": user.user_id,
        "username": user.username,
        "user_agent": user_agent
    }
    access_token, new_refresh_token = generate_tokens(new_payload)

    token_obj.token = new_refresh_token
    token_obj.expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()

    return {
        "username": user.username,
        "id": user.user_id,
        "access_token": access_token,
        "refresh_token": new_refresh_token,
    }


def profile_get(user_id: int, db: Session):
    user = db.query(Worker).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь не найден")

    return {
        "username": user.username,
        "id": user.user_id,
        "status": getattr(user, "status", None),
        "mentor_user_id": getattr(user, "mentor_user_id", None),
        "join_time": user.join_time.isoformat() if user.join_time else None
    }
