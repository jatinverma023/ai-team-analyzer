from fastapi import APIRouter, Depends, HTTPException
from app.models import UserProfileUpdate
from app.database import users_collection
from app.dependencies import get_current_user, validate_object_id

router = APIRouter(tags=["Profile"])


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = validate_object_id(current_user["id"])

    user = await users_collection.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = str(user["_id"])
    user.pop("password")

    return user


@router.put("/profile")
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    user_id = validate_object_id(current_user["id"])

    await users_collection.update_one(
        {"_id": user_id},
        {"$set": profile_data.model_dump()},
    )

    return {"message": "Profile updated successfully"}
