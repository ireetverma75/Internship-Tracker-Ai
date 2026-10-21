import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.database import engine, Base
from app.db.seed import seed_demo_data
from app.api.routes import health, resume, profile, internships, applications, analyze

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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(resume.router)
app.include_router(profile.router)
app.include_router(internships.router)
app.include_router(applications.router)
app.include_router(analyze.router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."}
    )
