import random
import math
from app.ml_service import predict_team_score

def generate_ai_explanation(team, ml_score):
    explanation = []
    if ml_score > 0.8:
        explanation.append("Highly compatible team predicted by ML model.")
    elif ml_score > 0.6:
        explanation.append("Moderately strong team composition.")
    elif ml_score > 0.4:
        explanation.append("Average compatibility predicted.")
    else:
        explanation.append("Low compatibility predicted by ML model.")

    if team["coding_avg"] > 7:
        explanation.append("Strong technical strength.")
    if team["communication_avg"] > 7:
        explanation.append("Excellent communication balance.")
    if team["leadership_avg"] > 7:
        explanation.append("Good leadership presence.")
    if team["reliability_avg"] > 0.8:
        explanation.append("High team reliability.")

    return " ".join(explanation)

def generate_teams_logic(students, team_size: int):
    # Calculate total score
    for student in students:
        student["total_score"] = (
            student.get("coding_skill", 0)
            + student.get("design_skill", 0)
            + student.get("communication", 0)
            + student.get("leadership", 0)
            + (student.get("reliability", 0) * 10)
        )

    students.sort(key=lambda x: x["total_score"], reverse=True)

    num_teams = math.ceil(len(students) / team_size)
    if num_teams == 0:
        num_teams = 1
        
    teams = [[] for _ in range(num_teams)]

    # Snake distribution logic
    team_index = 0
    direction = 1

    for student in students:
        teams[team_index].append(student)

        team_index += direction

        if team_index == num_teams:
            team_index = num_teams - 1
            direction = -1
        elif team_index < 0:
            team_index = 0
            direction = 1

    analyzed_teams = []

    for idx, team in enumerate(teams):
        if not team:
            continue
            
        total_strength = sum(member["total_score"] for member in team)
        avg_strength = total_strength / len(team)

        coding_avg = sum(m.get("coding_skill", 0) for m in team) / len(team)
        design_avg = sum(m.get("design_skill", 0) for m in team) / len(team)
        communication_avg = sum(m.get("communication", 0) for m in team) / len(team)
        leadership_avg = sum(m.get("leadership", 0) for m in team) / len(team)
        reliability_avg = sum(m.get("reliability", 0) for m in team) / len(team)

        team_data = {
            "team_number": idx + 1,
            "team_name": f"{random.choice(['Quantum', 'Apex', 'Synergy', 'Nexus', 'Pinnacle', 'Aether', 'Zenith', 'Vanguard', 'Nova', 'Cyber', 'Alpha', 'Omega', 'Visionary', 'Dynamic'])} {random.choice(['Innovators', 'Dynamics', 'Solutions', 'Force', 'Collective', 'Minds', 'Creators', 'Network', 'Titans', 'Engineers', 'Architects', 'Pioneers'])}",
            "members": [
                {
                    "id": str(m["_id"]),
                    "name": m["name"],
                    "email": m["email"],
                    "score": m["total_score"],
                    "specialty": max(
                        [
                            ("Coding", m.get("coding_skill", 0)),
                            ("Design", m.get("design_skill", 0)),
                            ("Leadership", m.get("leadership", 0)),
                            ("Communication", m.get("communication", 0))
                        ],
                        key=lambda x: x[1]
                    )[0]
                }
                for m in team
            ],
            "avg_team_strength": round(avg_strength, 2),
            "coding_avg": round(coding_avg, 2),
            "design_avg": round(design_avg, 2),
            "communication_avg": round(communication_avg, 2),
            "leadership_avg": round(leadership_avg, 2),
            "reliability_avg": round(reliability_avg, 2)
        }

        # ML Prediction
        ml_score = predict_team_score(team_data)
        team_data["ml_compatibility_score"] = ml_score
        team_data["ai_analysis"] = generate_ai_explanation(team_data, ml_score)

        analyzed_teams.append(team_data)

    return analyzed_teams, num_teams
