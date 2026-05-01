from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import ensure_indexes

# Import routers
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.student import router as student_router
from app.routes.teacher import router as teacher_router
from app.routes.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database indexes
    await ensure_indexes()
    yield
    # Shutdown: nothing to clean up


app = FastAPI(
    title="AI Team Analyzer API",
    description="ML-powered team compatibility and performance analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(admin_router)


@app.get("/")
async def root():
    return {"message": "Team Compatibility API Running"}