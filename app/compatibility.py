from typing import List
from app.ml_service import predict_team_score

def calculate_compatibility(students: List[dict]):
    if len(students) < 2:
        return {
            "compatibility_score": 0,
            "analysis": "At least 2 students required for synergy analysis."
        }

    # Calculate averages for ML model
    coding_avg = sum(s.get("coding_skill", 0) for s in students) / len(students)
    design_avg = sum(s.get("design_skill", 0) for s in students) / len(students)
    communication_avg = sum(s.get("communication", 0) for s in students) / len(students)
    leadership_avg = sum(s.get("leadership", 0) for s in students) / len(students)
    reliability_avg = sum(s.get("reliability", 0) for s in students) / len(students)

    avg_team_strength = (
        coding_avg + design_avg + communication_avg + leadership_avg + (reliability_avg * 10)
    )

    team_data = {
        "avg_team_strength": avg_team_strength,
        "coding_avg": coding_avg,
        "design_avg": design_avg,
        "communication_avg": communication_avg,
        "leadership_avg": leadership_avg,
        "reliability_avg": reliability_avg,
    }

    # 🔥 Use ML Model for prediction
    compatibility_score = predict_team_score(team_data)

    # Professional AI Analysis
    if compatibility_score > 0.8:
        analysis = "Elite Synergy: The team demonstrates exceptional balance with high predicted performance and reliability."
    elif compatibility_score > 0.6:
        analysis = "Strong Composition: Solid alignment across core skills with minor areas for optimization."
    elif compatibility_score > 0.4:
        analysis = "Moderate Alignment: Functional team structure with opportunities to improve collaborative coordination."
    else:
        analysis = "Low Compatibility: Skill gaps or low reliability may impact project velocity."

    return {
        "compatibility_score": compatibility_score,
        "analysis": analysis,
        "detailed_metrics": team_data
    }
