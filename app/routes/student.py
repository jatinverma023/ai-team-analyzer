import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import users_collection, teams_collection, feedback_collection
from app.dependencies import require_student, validate_object_id
from app.ml_service import predict_team_score

router = APIRouter(prefix="/student", tags=["Student"])


# ----------------------------
# Shared helper: find the student's current team
# ----------------------------
async def _find_student_team(student_id: str):
    """
    Find the latest team document containing this student.
    Returns (team_doc, student_team) or raises HTTPException.
    """
    team_doc = await teams_collection.find_one(
        {"teams.members.id": student_id}, sort=[("created_at", -1)]
    )

    if not team_doc:
        raise HTTPException(status_code=404, detail="You are not assigned to any team yet")

    for team in team_doc.get("teams", []):
        for member in team.get("members", []):
            if member["id"] == student_id:
                return team_doc, team

    raise HTTPException(status_code=404, detail="Team membership not found")


# ----------------------------
# Shared helper: calculate team metrics from a list of students
# ----------------------------
def _calculate_team_metrics(students: list) -> dict:
    """Calculate averaged team metrics from a list of student dicts."""
    n = len(students)
    if n == 0:
        return {
            "avg_team_strength": 0, "coding_avg": 0, "design_avg": 0,
            "communication_avg": 0, "leadership_avg": 0, "reliability_avg": 0,
        }

    coding_avg = sum(s.get("coding_skill", 0) for s in students) / n
    design_avg = sum(s.get("design_skill", 0) for s in students) / n
    communication_avg = sum(s.get("communication", 0) for s in students) / n
    leadership_avg = sum(s.get("leadership", 0) for s in students) / n
    reliability_avg = sum(s.get("reliability", 0) for s in students) / n
    avg_team_strength = coding_avg + design_avg + communication_avg + leadership_avg + (reliability_avg * 10)

    return {
        "avg_team_strength": round(avg_team_strength, 2),
        "coding_avg": round(coding_avg, 2),
        "design_avg": round(design_avg, 2),
        "communication_avg": round(communication_avg, 2),
        "leadership_avg": round(leadership_avg, 2),
        "reliability_avg": round(reliability_avg, 2),
    }


def _get_specialty(user: dict) -> str:
    """Return the student's strongest skill name."""
    skills = [
        ("Coding", user.get("coding_skill", 0)),
        ("Design", user.get("design_skill", 0)),
        ("Leadership", user.get("leadership", 0)),
        ("Communication", user.get("communication", 0)),
    ]
    return max(skills, key=lambda x: x[1])[0]


def _generate_ai_analysis(ml_score: float) -> str:
    """Generate a consistent AI analysis string based on ML score."""
    if ml_score > 0.8:
        return "Highly compatible team predicted by ML model. Strong potential for project success."
    elif ml_score > 0.6:
        return "Moderately strong team composition. Good collaboration expected."
    elif ml_score > 0.4:
        return "Average compatibility predicted. Some areas may need attention."
    else:
        return "Low compatibility predicted by ML model. Consider skill development."


# ----------------------------
# Routes
# ----------------------------

@router.get("/team-info")
async def get_student_team_info(
    current_user: dict = Depends(require_student),
):
    team_doc, student_team = await _find_student_team(current_user["id"])

    return {
        "team_document_id": str(team_doc["_id"]),
        "team_number": student_team["team_number"],
        "team_name": student_team.get(
            "team_name", f"Team {student_team['team_number']}"
        ),
        "mode": team_doc.get("mode", "teacher_generated"),
        "created_at": team_doc.get("created_at"),
    }


@router.get("/team-members")
async def get_student_team_members(
    current_user: dict = Depends(require_student),
):
    team_doc, student_team = await _find_student_team(current_user["id"])

    teammates = []

    for member in student_team.get("members", []):
        member_oid = validate_object_id(member["id"])
        user_data = await users_collection.find_one({"_id": member_oid})

        if not user_data:
            continue

        skills = {
            "coding": user_data.get("coding_skill", 0),
            "design": user_data.get("design_skill", 0),
            "communication": user_data.get("communication", 0),
            "leadership": user_data.get("leadership", 0),
        }

        strongest_skill = max(skills, key=skills.get)

        teammates.append(
            {
                "name": user_data["name"],
                "email": user_data["email"],
                "coding": skills["coding"],
                "design": skills["design"],
                "communication": skills["communication"],
                "leadership": skills["leadership"],
                "reliability": user_data.get("reliability", 0),
                "strongest_skill": strongest_skill,
            }
        )

    return {
        "team_number": student_team["team_number"],
        "team_name": student_team.get(
            "team_name", f"Team {student_team['team_number']}"
        ),
        "total_members": len(teammates),
        "members": teammates,
    }


@router.get("/team-ml-score")
async def get_student_team_ml_score(
    current_user: dict = Depends(require_student),
):
    team_doc, student_team = await _find_student_team(current_user["id"])

    return {
        "team_number": student_team["team_number"],
        "team_name": student_team.get(
            "team_name", f"Team {student_team['team_number']}"
        ),
        "ml_predicted_score": student_team.get("ml_compatibility_score", 0),
        "avg_team_strength": student_team.get("avg_team_strength", 0),
        "coding_avg": student_team.get("coding_avg", 0),
        "design_avg": student_team.get("design_avg", 0),
        "communication_avg": student_team.get("communication_avg", 0),
        "leadership_avg": student_team.get("leadership_avg", 0),
        "reliability_avg": student_team.get("reliability_avg", 0),
        "ai_analysis": student_team.get("ai_analysis", "No analysis available"),
    }


@router.get("/team-feedback")
async def get_student_team_feedback(
    current_user: dict = Depends(require_student),
):
    team_doc, student_team = await _find_student_team(current_user["id"])

    feedbacks = await feedback_collection.find(
        {
            "team_id": str(team_doc["_id"]),
            "team_number": student_team["team_number"],
        }
    ).to_list(100)

    if not feedbacks:
        return {
            "team_number": student_team["team_number"],
            "total_feedback_entries": 0,
            "feedback": [],
        }

    formatted_feedback = [
        {
            "performance_score": fb.get("performance_score"),
            "technical_score": fb.get("technical_score"),
            "communication_score": fb.get("communication_score"),
            "collaboration_score": fb.get("collaboration_score"),
            "comments": fb.get("comments"),
            "submitted_by": fb.get("submitted_by"),
            "created_at": fb.get("created_at"),
        }
        for fb in feedbacks
    ]

    return {
        "team_number": student_team["team_number"],
        "total_feedback_entries": len(formatted_feedback),
        "feedback": formatted_feedback,
    }


@router.get("/personal-summary")
async def get_personal_summary(
    current_user: dict = Depends(require_student),
):
    student_oid = validate_object_id(current_user["id"])
    user = await users_collection.find_one({"_id": student_oid})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skills = {
        "coding": user.get("coding_skill", 0),
        "design": user.get("design_skill", 0),
        "communication": user.get("communication", 0),
        "leadership": user.get("leadership", 0),
    }

    strongest_skill = max(skills, key=skills.get)
    weakest_skill = min(skills, key=skills.get)

    overall_score = sum(skills.values()) / 4

    return {
        "name": user["name"],
        "email": user["email"],
        "skills": skills,
        "reliability": user.get("reliability", 0),
        "strongest_skill": strongest_skill,
        "weakest_skill": weakest_skill,
        "overall_skill_score": round(overall_score, 2),
    }


@router.get("/growth-suggestions")
async def get_growth_suggestions(
    current_user: dict = Depends(require_student),
):
    student_oid = validate_object_id(current_user["id"])
    user = await users_collection.find_one({"_id": student_oid})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skills = {
        "coding": user.get("coding_skill", 0),
        "design": user.get("design_skill", 0),
        "communication": user.get("communication", 0),
        "leadership": user.get("leadership", 0),
    }

    weakest_skill = min(skills, key=skills.get)
    reliability = user.get("reliability", 0)

    suggestions = []

    skill_suggestions = {
        "coding": "Improve coding by practicing DSA daily and building mini projects.",
        "design": "Work on UI/UX basics and improve visual structure consistency.",
        "communication": "Practice presenting ideas clearly and participate in discussions.",
        "leadership": "Take initiative in small group tasks and coordinate activities.",
    }
    suggestions.append(skill_suggestions[weakest_skill])

    if reliability < 0.7:
        suggestions.append(
            "Improve reliability by completing tasks on time and being consistent."
        )
    elif reliability < 0.85:
        suggestions.append(
            "Increase consistency to become a highly dependable teammate."
        )
    else:
        suggestions.append("Maintain your strong reliability level.")

    avg_skill_score = sum(skills.values()) / 4

    if avg_skill_score < 6:
        suggestions.append(
            "Focus on strengthening core fundamentals before advanced topics."
        )
    elif avg_skill_score < 8:
        suggestions.append(
            "Push towards mastery level to become a high-impact team member."
        )
    else:
        suggestions.append(
            "You are a strong contributor — aim for mentorship roles."
        )

    return {
        "name": user["name"],
        "weakest_skill": weakest_skill,
        "reliability": reliability,
        "average_skill_score": round(avg_skill_score, 2),
        "growth_plan": suggestions,
    }


@router.post("/check-compatibility")
async def student_check_compatibility(
    teammate_id: str,
    current_user: dict = Depends(require_student),
):
    student1_oid = validate_object_id(current_user["id"])
    student2_oid = validate_object_id(teammate_id)

    student1 = await users_collection.find_one({"_id": student1_oid})
    student2 = await users_collection.find_one({"_id": student2_oid})

    if not student1 or not student2:
        raise HTTPException(status_code=404, detail="Student not found")

    team_metrics = _calculate_team_metrics([student1, student2])
    compatibility_score = predict_team_score(team_metrics)

    status = (
        "Highly Compatible"
        if compatibility_score > 0.75
        else "Moderately Compatible"
        if compatibility_score > 0.5
        else "Low Compatibility"
    )

    return {
        "student_1": student1["name"],
        "student_2": student2["name"],
        "compatibility_score": compatibility_score,
        "status": status,
    }


@router.get("/all-students")
async def get_students_for_compatibility(
    current_user: dict = Depends(require_student),
):
    """Returns other students with limited info for privacy (masked email)."""
    students = []
    async for user in users_collection.find({"role": "student"}):
        if str(user["_id"]) == current_user["id"]:
            continue
        # Privacy: only expose name and masked email
        email = user.get("email", "")
        masked_email = email[:3] + "***@" + email.split("@")[-1] if "@" in email else "***"
        students.append({
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": masked_email,
        })
    return students


@router.post("/create-team")
async def create_team_manually(
    teammate_id: str,
    current_user: dict = Depends(require_student),
):
    student1_oid = validate_object_id(current_user["id"])
    student2_oid = validate_object_id(teammate_id)

    student1 = await users_collection.find_one({"_id": student1_oid})
    student2 = await users_collection.find_one({"_id": student2_oid})

    if not student1 or not student2:
        raise HTTPException(status_code=404, detail="Student not found")

    # Calculate team metrics using shared helper
    team_metrics = _calculate_team_metrics([student1, student2])
    ml_score = predict_team_score(team_metrics)
    ai_analysis = _generate_ai_analysis(ml_score)

    # Generate team name
    first_words = [
        "Quantum", "Apex", "Synergy", "Nexus", "Pinnacle",
        "Aether", "Zenith", "Vanguard", "Nova", "Cyber",
    ]
    second_words = [
        "Innovators", "Dynamics", "Solutions", "Force",
        "Collective", "Minds", "Creators", "Pioneers",
    ]
    team_name = f"{random.choice(first_words)} {random.choice(second_words)}"

    # Calculate individual scores
    def total_score(u):
        return sum([
            u.get("coding_skill", 0),
            u.get("design_skill", 0),
            u.get("communication", 0),
            u.get("leadership", 0),
            u.get("reliability", 0) * 10,
        ])

    team_members = [
        {
            "id": str(student1["_id"]),
            "name": student1["name"],
            "email": student1["email"],
            "score": total_score(student1),
            "specialty": _get_specialty(student1),
        },
        {
            "id": str(student2["_id"]),
            "name": student2["name"],
            "email": student2["email"],
            "score": total_score(student2),
            "specialty": _get_specialty(student2),
        },
    ]

    new_team_doc = {
        "generated_by": current_user["email"],
        "generated_by_id": current_user["id"],
        "mode": "student_created",
        "team_size": 2,
        "total_students": 2,
        "total_teams": 1,
        "teams": [
            {
                "team_number": 1,
                "team_name": team_name,
                "members": team_members,
                **team_metrics,
                "ml_compatibility_score": ml_score,
                "ai_analysis": ai_analysis,
            }
        ],
        "created_at": datetime.now(timezone.utc),
    }

    result = await teams_collection.insert_one(new_team_doc)

    return {
        "message": "Team created successfully",
        "team_document_id": str(result.inserted_id),
    }
