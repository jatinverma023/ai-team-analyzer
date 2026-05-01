from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from bson import ObjectId
from bson.errors import InvalidId
from app.config import settings
from app.database import users_collection

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.ALGORITHM

security = HTTPBearer()


def validate_object_id(id_str: str) -> ObjectId:
    """Validate and convert a string to ObjectId. Raises 400 on invalid format."""
    try:
        return ObjectId(id_str)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {id_str}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Decode JWT and verify user still exists and is active in the database."""
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Verify user still exists and is active
    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Malformed token payload")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account has been disabled by admin")

    return payload


def require_teacher(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user


def require_student(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user