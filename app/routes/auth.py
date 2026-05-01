import re
from fastapi import APIRouter, HTTPException
from app.models import UserRegister, UserLogin
from app.database import users_collection
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(tags=["Authentication"])

MIN_PASSWORD_LENGTH = 6
PASSWORD_PATTERN = re.compile(r'^(?=.*[A-Za-z])(?=.*\d).+$')  # At least 1 letter + 1 digit


@router.post("/register")
async def register(user: UserRegister):
    # Role is validated by Pydantic UserRole enum (only student/teacher allowed)

    # Validate password strength
    if len(user.password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Password must be at least {MIN_PASSWORD_LENGTH} characters"
        )

    if not PASSWORD_PATTERN.match(user.password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one letter and one number"
        )

    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": user.role.value,
        "coding_skill": 0,
        "design_skill": 0,
        "leadership": 0,
        "communication": 0,
        "reliability": 0.0,
        "is_active": True,
    }

    await users_collection.insert_one(new_user)

    return {"message": "User registered successfully"}


@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not db_user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account has been disabled by admin"
        )

    token = create_access_token({
        "id": str(db_user["_id"]),
        "email": db_user["email"],
        "role": db_user["role"],
    })

    return {
        "access_token": token,
        "role": db_user["role"],
        "token_type": "bearer",
    }
