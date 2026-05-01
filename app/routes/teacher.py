from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from bson.errors import InvalidId

from app.models import (
    CompatibilityRequest,
    TeamGenerationRequest,
    TeamGenerationResponse,
    TeamFeedbackRequest,
)
from app.database import users_collection, teams_collection, feedback_collection
from app.dependencies import get_current_user, require_teacher, validate_object_id
from app.compatibility import calculate_compatibility
from app.ml_service import predict_team_score, retrain_model
from app.services.team_service import generate_teams_logic

router = APIRouter(prefix="/teacher", tags=["Teacher"])


@router.get("/students")
async def get_all_students(current_user: dict = Depends(require_teacher)):
    students = []
    async for user in users_collection.find({"role": "student"}):
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        students.append(user)
    return students


@router.get("/students/{student_id}")
async def get_student_by_id(
    student_id: str,
    current_user: dict = Depends(require_teacher),
):
    student_oid = validate_object_id(student_id)
    student = await users_collection.find_one(
        {"_id": student_oid, "role": "student"}
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student["_id"] = str(student["_id"])
    student.pop("password", None)

    return student


@router.post("/compatibility")
async def check_compatibility(
    request: CompatibilityRequest,
    current_user: dict = Depends(require_teacher),
):
    students = []

    for student_id in request.student_ids:
        student_oid = validate_object_id(student_id)
        student = await users_collection.find_one(
            {"_id": student_oid, "role": "student"}
        )
        if student:
            students.append(student)

    if len(students) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 valid students")

    result = calculate_compatibility(students)
    return result


@router.post("/generate-teams", response_model=TeamGenerationResponse)
async def generate_teams(
    request: TeamGenerationRequest,
    current_user: dict = Depends(require_teacher),
):
    students = await users_collection.find({"role": "student"}).to_list(100)

    if not students:
        raise HTTPException(status_code=404, detail="No students found")

    team_size = request.team_size

    if team_size <= 0:
        raise HTTPException(status_code=400, detail="Invalid team size")

    if len(students) < team_size:
        raise HTTPException(status_code=400, detail="Not enough students")

    analyzed_teams, num_teams = generate_teams_logic(students, team_size)

    result = await teams_collection.insert_one(
        {
            "generated_by": current_user["email"],
            "generated_by_id": current_user["id"],
            "team_size": team_size,
            "total_students": len(students),
            "total_teams": num_teams,
            "teams": analyzed_teams,
            "created_at": datetime.now(timezone.utc),
        }
    )

    return {
        "team_document_id": str(result.inserted_id),
        "total_students": len(students),
        "team_size": team_size,
        "total_teams": num_teams,
        "teams": analyzed_teams,
    }


@router.post("/team-feedback")
async def submit_team_feedback(
    feedback: TeamFeedbackRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_teacher),
):
    # Validate team_id format
    validate_object_id(feedback.team_id)

    await feedback_collection.insert_one(
        {
            "team_id": feedback.team_id,
            "team_number": feedback.team_number,
            "performance_score": feedback.performance_score,
            "technical_score": feedback.technical_score,
            "communication_score": feedback.communication_score,
            "collaboration_score": feedback.collaboration_score,
            "comments": feedback.comments,
            "submitted_by": current_user["email"],
            "submitted_by_id": current_user["id"],
            "created_at": datetime.now(timezone.utc),
        }
    )

    total_feedback = await feedback_collection.count_documents({})
    retrain_status = "No retraining triggered"

    if total_feedback % 10 == 0:
        # Run retraining in background — don't block the HTTP response
        background_tasks.add_task(retrain_model, feedback_collection, teams_collection)
        retrain_status = "Retraining queued in background"

    return {
        "message": "Team feedback submitted successfully",
        "total_feedback_count": total_feedback,
        "retrain_status": retrain_status,
    }


@router.get("/team-analytics/{team_id}")
async def get_team_analytics(
    team_id: str,
    current_user: dict = Depends(require_teacher),
):
    validate_object_id(team_id)
    feedbacks = await feedback_collection.find({"team_id": team_id}).to_list(100)

    if not feedbacks:
        raise HTTPException(status_code=404, detail="No feedback found")

    total = len(feedbacks)

    avg_performance = sum(f["performance_score"] for f in feedbacks) / total
    avg_technical = sum(f["technical_score"] for f in feedbacks) / total
    avg_communication = sum(f["communication_score"] for f in feedbacks) / total
    avg_collaboration = sum(f["collaboration_score"] for f in feedbacks) / total

    return {
        "team_id": team_id,
        "feedback_count": total,
        "avg_performance_score": round(avg_performance, 2),
        "avg_technical_score": round(avg_technical, 2),
        "avg_communication_score": round(avg_communication, 2),
        "avg_collaboration_score": round(avg_collaboration, 2),
    }


@router.get("/dashboard-overview")
async def teacher_dashboard_overview(
    current_user: dict = Depends(require_teacher),
):
    total_students = await users_collection.count_documents({"role": "student"})

    total_team_docs = await teams_collection.count_documents(
        {"teams": {"$exists": True}}
    )

    total_feedback_entries = await feedback_collection.count_documents({})

    team_docs = await teams_collection.find(
        {"teams": {"$exists": True}}
    ).to_list(100)

    ml_scores = []
    for doc in team_docs:
        for team in doc.get("teams", []):
            if "ml_compatibility_score" in team:
                ml_scores.append(team["ml_compatibility_score"])

    avg_ml_score = round(sum(ml_scores) / len(ml_scores), 2) if ml_scores else 0

    feedbacks = await feedback_collection.find().to_list(100)

    performance_scores = [
        f["performance_score"]
        for f in feedbacks
        if "performance_score" in f
    ]

    avg_actual_performance = (
        round(sum(performance_scores) / len(performance_scores), 2)
        if performance_scores
        else 0
    )

    return {
        "total_students": total_students,
        "total_team_generations": total_team_docs,
        "total_feedback_entries": total_feedback_entries,
        "avg_ml_score": avg_ml_score,
        "avg_actual_performance": avg_actual_performance,
    }


@router.get("/teams")
async def get_generated_teams(
    current_user: dict = Depends(require_teacher),
):
    team_docs = (
        await teams_collection.find({"teams": {"$exists": True}})
        .sort("created_at", -1)
        .to_list(100)
    )

    response = []
    for doc in team_docs:
        ml_scores = [
            team.get("ml_compatibility_score", 0) for team in doc.get("teams", [])
        ]
        avg_ml = round(sum(ml_scores) / len(ml_scores), 2) if ml_scores else 0

        response.append(
            {
                "team_document_id": str(doc["_id"]),
                "generated_at": doc.get("created_at"),
                "team_size": doc.get("team_size"),
                "total_teams": doc.get("total_teams"),
                "avg_ml_score": avg_ml,
            }
        )

    return response


@router.get("/teams/{team_document_id}")
async def get_team_document_detail(
    team_document_id: str,
    current_user: dict = Depends(require_teacher),
):
    doc_oid = validate_object_id(team_document_id)
    doc = await teams_collection.find_one(
        {"_id": doc_oid, "teams": {"$exists": True}}
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Team document not found")

    doc["_id"] = str(doc["_id"])

    return {
        "team_document_id": doc["_id"],
        "generated_at": doc.get("created_at"),
        "team_size": doc.get("team_size"),
        "total_teams": doc.get("total_teams"),
        "teams": doc.get("teams", []),
    }


@router.get("/team-performance-analysis/{team_document_id}")
async def team_performance_analysis(
    team_document_id: str,
    current_user: dict = Depends(require_teacher),
):
    doc_oid = validate_object_id(team_document_id)
    doc = await teams_collection.find_one(
        {"_id": doc_oid, "teams": {"$exists": True}}
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Team document not found")

    teams = doc.get("teams", [])
    results = []

    for team in teams:
        team_number = team["team_number"]
        ml_score = team.get("ml_compatibility_score", 0)

        feedbacks = await feedback_collection.find(
            {"team_id": team_document_id}
        ).to_list(100)

        if not feedbacks:
            continue

        avg_actual = sum(f["performance_score"] for f in feedbacks) / len(feedbacks)
        predicted_scaled = ml_score * 10
        difference = round(avg_actual - predicted_scaled, 2)
        accuracy = round(100 - abs(difference) * 10, 2)

        status = "Accurate"
        if difference > 1:
            status = "Underestimated by ML"
        elif difference < -1:
            status = "Overestimated by ML"

        results.append(
            {
                "team_number": team_number,
                "ml_predicted_score": round(predicted_scaled, 2),
                "actual_avg_score": round(avg_actual, 2),
                "difference": difference,
                "accuracy_percent": max(0, accuracy),
                "status": status,
            }
        )

    return {"team_document_id": team_document_id, "analysis": results}


@router.get("/model-accuracy")
async def model_accuracy_dashboard(
    current_user: dict = Depends(require_teacher),
):
    feedbacks = await feedback_collection.find().to_list(1000)

    if not feedbacks:
        raise HTTPException(status_code=404, detail="No feedback available")

    total_entries = 0
    total_error = 0
    overestimated = 0
    underestimated = 0

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

        predicted = team.get("ml_compatibility_score", 0) * 10
        actual = fb.get("performance_score", 0)

        error = abs(actual - predicted)
        total_error += error
        total_entries += 1

        if actual > predicted:
            underestimated += 1
        elif actual < predicted:
            overestimated += 1

    if total_entries == 0:
        raise HTTPException(
            status_code=404, detail="No matching team evaluations found"
        )

    avg_error = round(total_error / total_entries, 2)
    accuracy = round(max(0, 100 - (avg_error * 10)), 2)

    return {
        "total_evaluations": total_entries,
        "average_prediction_error": avg_error,
        "model_accuracy_percent": accuracy,
        "underestimated_cases": underestimated,
        "overestimated_cases": overestimated,
    }
