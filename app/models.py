from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"


class TeamMember(BaseModel):
    id: str
    name: str
    email: EmailStr
    score: float
    specialty: str

class AnalyzedTeam(BaseModel):
    team_number: int
    team_name: str
    members: List[TeamMember]
    avg_team_strength: float
    coding_avg: float
    design_avg: float
    communication_avg: float
    leadership_avg: float
    reliability_avg: float
    ml_compatibility_score: float
    ai_analysis: str

class TeamGenerationResponse(BaseModel):
    team_document_id: str
    total_students: int
    team_size: int
    total_teams: int
    teams: List[AnalyzedTeam]

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    coding_skill: int = Field(..., ge=0, le=10)
    design_skill: int = Field(..., ge=0, le=10)
    leadership: int = Field(..., ge=0, le=10)
    communication: int = Field(..., ge=0, le=10)
    reliability: float = Field(..., ge=0.0, le=1.0)

class CompatibilityRequest(BaseModel):
    student_ids: List[str]

class TeamGenerationRequest(BaseModel):
    team_size: Optional[int] = None
    num_teams: Optional[int] = None
    mode: str = "size"  # "size" or "count"

class TeamFeedbackRequest(BaseModel):
    team_id: str
    team_number: int
    performance_score: float = Field(..., ge=0, le=10)
    technical_score: float = Field(..., ge=0, le=10)
    communication_score: float = Field(..., ge=0, le=10)
    collaboration_score: float = Field(..., ge=0, le=10)
    comments: str