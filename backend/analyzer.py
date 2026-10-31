"""
FRIDAY - Gemini API Integration Service
Calls Google GenAI SDK (google-genai) with structured output and fallback resilience.
"""

import os
import json
import logging
from typing import Optional
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv()

from .models import JobAnalysisRequest, JobAnalysisResponse, RiskSignalItem, ScoreFactorBreakdown
from .heuristics import analyze_heuristically, classify_risk

logger = logging.getLogger("friday.analyzer")

GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_PROMPT = """
You are FRIDAY, an elite cybersecurity and fraud prevention analyst specializing in deceptive recruitment practices and employment scams.
Your mission is to perform an objective, explainable, evidence-backed evaluation of a submitted job description or recruiter communication.

CRITICAL INSTRUCTIONS:
1. EXPLAINABILITY & EVIDENCE:
   - Identify specific warning signs and quote or point out the EXACT phrases from the provided input.
   - Do NOT simply accuse without evidence.
   - Separate positive legitimate signs (e.g., standard benefits, normal hiring stages) from red flags.
   - Note what information is missing that prevents complete trust (e.g., lack of verified corporate domain, anonymous recruiter).
2. SCORING METHODOLOGY (0 - 100):
   - 0 - 24: Low Risk (Professional structure, no red flags, realistic responsibilities & compensation).
   - 25 - 49: Moderate Risk (Some ambiguity, vague descriptions, missing corporate details, or mild pressure).
   - 50 - 74: High Risk (Multiple concerning patterns: Telegram/WhatsApp-only interview, free email domains, unrealistic wages, or urgent onboarding).
   - 75 - 100: Very High Risk (Dangerous signals: requests for money/equipment fees/crypto, check cashing, asking for banking credentials/SSN prematurely, guaranteed high income with no experience).
   - Total the risk_score by summing the score_breakdown points. Ensure it remains between 0 and 100.
3. FAIRNESS & TRANSPARENCY:
   - Do NOT label a company fraudulent merely because of one minor flaw.
   - Do NOT claim that you have accessed external live databases, verified tax records, or contacted the company unless explicit verification is part of your training data. Explicitly acknowledge that external company registries were NOT independently inspected.
   - State clearly that this is an initial heuristic/AI screening advisory and not a guarantee of legitimacy or fraud.

You must respond strictly with valid JSON conforming to the requested schema.
"""


def get_gemini_client():
    """Initializes and returns the official Google GenAI client if API key is present."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Error initializing Google GenAI client: {e}")
        return None


def analyze_job_listing(req: JobAnalysisRequest) -> JobAnalysisResponse:
    """
    Analyzes the job submission using the Gemini API.
    If no API key is provided or the API is unavailable, seamlessly falls back
    to the rule-based heuristic engine while keeping the user fully informed.
    """
    client = get_gemini_client()
    
    if client is None:
        logger.warning("Gemini API key not configured or client failed; using heuristic engine.")
        res = analyze_heuristically(
            job_desc=req.job_description,
            company=req.company_name or "",
            title=req.job_title or "",
            recruiter=req.recruiter_contact or "",
            url=req.job_url or ""
        )
        res.transparency_notes = (
            "Screening conducted via FRIDAY's built-in heuristic cybersecurity engine (Gemini API key not configured). "
            "This assessment represents an algorithmic evaluation of common deceptive patterns, not definitive verification."
        )
        return res

    # Construct structured prompt
    prompt = f"""
Analyze the following job submission for scam indicators:

--- JOB DETAILS ---
Company Name: {req.company_name or 'Not specified'}
Job Title: {req.job_title or 'Not specified'}
Recruiter Contact: {req.recruiter_contact or 'Not specified'}
Job URL: {req.job_url or 'Not specified'}

--- CONTENT / MESSAGE / DESCRIPTION ---
{req.job_description}
----------------------------------------

Respond ONLY with a JSON object adhering to this schema:
{{
  "risk_score": integer (0 to 100),
  "risk_category": "Low Risk" | "Moderate Risk" | "High Risk" | "Very High Risk",
  "executive_summary": string (concise summary of findings),
  "risk_signals": [
    {{
      "category": string (e.g., "Upfront Fees", "Communication Channels", "Compensation", "Identity/PII"),
      "signal_type": "warning" | "positive" | "caution",
      "headline": string,
      "evidence_quote": string (verbatim quote or specific observation),
      "explanation": string (why this matters),
      "severity_weight": integer (points 0-35)
    }}
  ],
  "score_breakdown": [
    {{
      "factor_name": string,
      "points_added": integer,
      "rationale": string
    }}
  ],
  "positive_signals": [string],
  "missing_information": [string],
  "recommended_actions": [string],
  "transparency_notes": string
}}
"""

    try:
        from google.genai import types
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        
        raw_text = response.text.strip()
        data = json.loads(raw_text)
        
        # Validate score bounds and category
        score = int(data.get("risk_score", 50))
        score = max(0, min(100, score))
        category = classify_risk(score)
        
        # Build validated Pydantic model
        signals = [
            RiskSignalItem(
                category=s.get("category", "General"),
                signal_type=s.get("signal_type", "warning"),
                headline=s.get("headline", "Pattern identified"),
                evidence_quote=s.get("evidence_quote", "Noted in content"),
                explanation=s.get("explanation", ""),
                severity_weight=int(s.get("severity_weight", 10))
            )
            for s in data.get("risk_signals", [])
        ]
        
        breakdown = [
            ScoreFactorBreakdown(
                factor_name=b.get("factor_name", "Risk factor"),
                points_added=int(b.get("points_added", 10)),
                rationale=b.get("rationale", "")
            )
            for b in data.get("score_breakdown", [])
        ]

        # Add explicit transparency notice
        transparency = data.get("transparency_notes", "")
        if "external company" not in transparency.lower():
            transparency += " Note: FRIDAY evaluated the provided text patterns. Live corporate business registries or external recruiter background checks were not independently verified."

        return JobAnalysisResponse(
            risk_score=score,
            risk_category=category,
            executive_summary=data.get("executive_summary", "Analysis completed."),
            risk_signals=signals,
            score_breakdown=breakdown,
            positive_signals=data.get("positive_signals", []),
            missing_information=data.get("missing_information", []),
            recommended_actions=data.get("recommended_actions", []),
            transparency_notes=transparency,
            analysis_mode="gemini-powered"
        )

    except Exception as e:
        logger.error(f"Gemini API invocation or parsing failed: {e}. Falling back to heuristics.")
        fallback = analyze_heuristically(
            job_desc=req.job_description,
            company=req.company_name or "",
            title=req.job_title or "",
            recruiter=req.recruiter_contact or "",
            url=req.job_url or ""
        )
        fallback.transparency_notes += f" (Gemini API unavailable: {type(e).__name__}; heuristic engine provided fallback evaluation.)"
        return fallback

