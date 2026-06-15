"""FastAPI application entry point for the ML service."""

from fastapi import FastAPI

from api.routes.analyze_resume import router as analyze_resume_router
from api.routes.health import router as health_router
from api.routes.recommendations import router as recommendations_router
from config import settings

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.include_router(health_router)
app.include_router(analyze_resume_router)
app.include_router(recommendations_router)


@app.get("/")
async def root() -> dict:
    """Basic landing endpoint for the service."""

    return {"service": settings.app_name, "version": settings.app_version}
