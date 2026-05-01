from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

MONGO_URI = settings.MONGO_URI

client = AsyncIOMotorClient(MONGO_URI)

database = client["team_compatibility_db"]

users_collection = database["users"]
teams_collection = database["teams"]
feedback_collection = database["team_feedback"]


async def ensure_indexes():
    """Create database indexes for performance. Called once at startup."""
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("role")
    await teams_collection.create_index("teams.members.id")
    await teams_collection.create_index([("created_at", -1)])
    await feedback_collection.create_index([("team_id", 1), ("team_number", 1)])
