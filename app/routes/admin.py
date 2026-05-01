from fastapi import APIRouter, Depends, HTTPException

from app.database import users_collection, teams_collection, feedback_collection
from app.dependencies import require_admin, validate_object_id
from app.ml_service import retrain_model

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
async def admin_overview(current_user: dict = Depends(require_admin)):
    total_users = await users_collection.count_documents({})
    total_students = await users_collection.count_documents({"role": "student"})
    total_teachers = await users_collection.count_documents({"role": "teacher"})
    total_teams = await teams_collection.count_documents({})
    total_feedback = await feedback_collection.count_documents({})

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_team_documents": total_teams,
        "total_feedback_entries": total_feedback,
    }


@router.get("/all-users")
async def admin_get_all_users(current_user: dict = Depends(require_admin)):
    """Admin endpoint to fetch ALL users (students + teachers)."""
    users = []
    async for user in users_collection.find({}):
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        users.append(user)
    return users


@router.get("/model-monitoring")
async def admin_model_monitoring(
    current_user: dict = Depends(require_admin),
):
    feedbacks = await feedback_collection.find().to_list(1000)

    if not feedbacks:
        return {"message": "No feedback data available"}

    total = 0
    total_error = 0
    underestimated = 0
    overestimated = 0

    for fb in feedbacks:
        try:
            fb_team_oid = validate_object_id(fb["team_id"])
            team_doc = await teams_collection.find_one({"_id": fb_team_oid})
        except Exception:
            continue

        if not team_doc:
            continue

        team = next(
            (
                t
                for t in team_doc.get("teams", [])
                if t["team_number"] == fb["team_number"]
            ),
            None,
        )

        if not team:
            continue

        ml_score = team.get("ml_compatibility_score", 0)
        actual_score = fb["performance_score"] / 10

        error = abs(ml_score - actual_score)

        total += 1
        total_error += error

        if ml_score < actual_score:
            underestimated += 1
        elif ml_score > actual_score:
            overestimated += 1

    if total == 0:
        return {"message": "No matched evaluation data"}

    avg_error = total_error / total
    accuracy = max(0, 1 - avg_error) * 100

    return {
        "total_evaluations": total,
        "average_prediction_error": round(avg_error, 3),
        "model_accuracy_percent": round(accuracy, 2),
        "underestimated_cases": underestimated,
        "overestimated_cases": overestimated,
    }


@router.post("/retrain-model")
async def admin_force_retrain(
    current_user: dict = Depends(require_admin),
):
    result = await retrain_model(feedback_collection, teams_collection)

    return {"message": "Retrain process executed", "status": result}


@router.delete("/delete-team/{team_document_id}")
async def delete_team_document(
    team_document_id: str,
    current_user: dict = Depends(require_admin),
):
    doc_oid = validate_object_id(team_document_id)
    result = await teams_collection.delete_one({"_id": doc_oid})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404, detail="Team document not found"
        )

    return {
        "message": "Team document deleted successfully",
        "deleted_team_document_id": team_document_id,
    }


@router.put("/ban-user/{user_id}")
async def ban_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
):
    user_oid = validate_object_id(user_id)

    # Prevent admin from banning themselves
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")

    result = await users_collection.update_one(
        {"_id": user_oid}, {"$set": {"is_active": False}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or already banned")

    return {
        "message": "User has been disabled successfully",
        "banned_user_id": user_id,
    }


@router.put("/unban-user/{user_id}")
async def unban_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
):
    """Re-enable a previously banned user."""
    user_oid = validate_object_id(user_id)

    result = await users_collection.update_one(
        {"_id": user_oid}, {"$set": {"is_active": True}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or already active")

    return {
        "message": "User has been re-enabled successfully",
        "unbanned_user_id": user_id,
    }
