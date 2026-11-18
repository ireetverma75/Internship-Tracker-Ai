import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.database import engine, Base, AsyncSessionLocal
from app.db.models import Job
from app.db.seed import seed_demo_data
from app.api.routes import health, resume, profile, internships, applications, analyze, skills
from routes import jobs, matching, recommendations
from dataset.database_sync import sync_dataset_to_db
from sqlalchemy import select, func

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("internship_tracker")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized.")

    try:
        await seed_demo_data()
        logger.info("Seed data ready.")
    except Exception as e:
        logger.warning(f"Seed data error or already populated: {e}")

    # Auto-seed Hugging Face Jobs dataset if jobs table is empty
    try:
        async with AsyncSessionLocal() as session:
            count_q = select(func.count(Job.id))
            job_count = (await session.execute(count_q)).scalar() or 0
            if job_count == 0:
                logger.info("Jobs table is empty. Initializing with Hugging Face dataset (original split)...")
                sync_res = await sync_dataset_to_db(session=session, split="original")
                logger.info(f"Hugging Face dataset initialized: {sync_res['records_inserted']} jobs synced.")
            else:
                logger.info(f"Jobs table contains {job_count} listings.")
    except Exception as e:
        logger.warning(f"Could not auto-sync Hugging Face dataset at startup: {e}")

    yield

    logger.info("Shutting down backend.")
    await engine.dispose()

app = FastAPI(
    title="Internship Tracker AI API",
    version="1.0.0",
    description="Full-stack AI-powered internship discovery, matching, and application management",
    lifespan=lifespan
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
if settings.CORS_ORIGINS:
    for o in settings.CORS_ORIGINS.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Existing Routers
app.include_router(health.router)
app.include_router(resume.router)
app.include_router(profile.router)
app.include_router(internships.router)
app.include_router(applications.router)
app.include_router(analyze.router)
app.include_router(skills.router)

# Include New Dataset, Matching & Recommendations Routers
app.include_router(jobs.router)
app.include_router(matching.router)
app.include_router(recommendations.router)

# Top-level direct alias endpoints requested by client specifications
@app.get("/api/dashboard/stats")
async def dashboard_stats_alias(
    user_id: str = Depends(applications.get_current_user),
    db: AsyncSessionLocal = Depends(applications.get_db)
):
    return await applications.get_metrics(user_id=user_id, db=db)

@app.get("/api/matching/recommendations")
async def matching_recommendations_alias(
    top_n: int = 8,
    include_synthetic: bool = False,
    user_id: str = Depends(recommendations.get_current_user),
    db: AsyncSessionLocal = Depends(recommendations.get_db)
):
    return await recommendations.get_profile_based_recommendations(
        top_n=top_n,
        include_synthetic=include_synthetic,
        user_id=user_id,
        db=db
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."}
    )
