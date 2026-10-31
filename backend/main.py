"""
FRIDAY - AI Job Scam Detector
FastAPI Backend Application
"""

import os
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

# Load environment configuration
load_dotenv()

from .models import JobAnalysisRequest, JobAnalysisResponse
from .analyzer import analyze_job_listing, get_gemini_client

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("friday.api")

app = FastAPI(
    title="FRIDAY - AI Job Scam Detector API",
    description="Cybersecurity intelligence and AI-powered screening for fraudulent job listings.",
    version="1.0.0")

# Enable CORS for local testing or cross-origin frontend serving
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


@app.get("/api/health")
async def health_check():
    """Health status and configuration check."""
    gemini_ready = get_gemini_client() is not None
    return {
        "status": "online",
        "app": "FRIDAY — AI Job Scam Detector",
        "gemini_configured": gemini_ready,
        "mode": "gemini-api" if gemini_ready else "heuristic-engine"
    }


@app.post("/api/analyze", response_model=JobAnalysisResponse)
async def analyze_job(request: JobAnalysisRequest):
    """
    Analyzes submitted job listing or recruiter communication.
    Performs validation, security checks, and calls the Gemini/heuristic engine.
    """
    # Sanitize and validate length
    clean_desc = request.job_description.strip()
    if len(clean_desc) < 20:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The job description or message is too short. Please paste at least 20 characters of content."
        )

    try:
        analysis = analyze_job_listing(request)
        return analysis
    except Exception as e:
        logger.error(f"Unexpected error in /api/analyze: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the job assessment. Please try again."
        )


# Serve frontend static assets if frontend directory exists
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/")
    async def serve_index():
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return JSONResponse({"message": "FRIDAY Backend API active. index.html not yet found."})


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting FRIDAY Server on http://{host}:{port}")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)

