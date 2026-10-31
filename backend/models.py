"""
FRIDAY - Data Models & Schemas
Pydantic schemas for request validation, scam analysis output, and explainability.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class JobAnalysisRequest(BaseModel):
    """Input payload submitted by job seeker."""
    job_description: str = Field(
        ...,
        min_length=15,
        max_length=20000,
        description="The pasted job description, email offer, or messaging chat."
    )
    company_name: Optional[str] = Field(
        None,
        max_length=200,
        description="Optional name of the stated employer or company."
    )
    job_title: Optional[str] = Field(
        None,
        max_length=200,
        description="Optional title of the position."
    )
    recruiter_contact: Optional[str] = Field(
        None,
        max_length=300,
        description="Optional recruiter email, phone, Telegram handle, etc."
    )
    job_url: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional job listing or company website URL."
    )


class RiskSignalItem(BaseModel):
    """Specific warning or positive pattern detected in the content."""
    category: str = Field(
        ...,
        description="e.g. 'Upfront Payment', 'Unrealistic Salary', 'Suspicious Contact/Channel', 'Identity/Impersonation', 'Urgency/Pressure', 'Data Harvesting'"
    )
    signal_type: Literal["warning", "positive", "caution"] = Field(
        ...,
        description="Whether this is a negative flag, a reassuring factor, or neutral caution."
    )
    headline: str = Field(
        ...,
        description="Short summary of the specific observation (e.g., 'Telegram/WhatsApp only interview requested')."
    )
    evidence_quote: str = Field(
        ...,
        description="Exact quote or phrase observed in the submitted text, or specific observed absence."
    )
    explanation: str = Field(
        ...,
        description="Clear, explainable reasoning why this pattern matters to job seekers."
    )
    severity_weight: int = Field(
        ...,
        ge=0,
        le=35,
        description="Points contributed toward the overall risk score (0 for positive signals)."
    )


class ScoreFactorBreakdown(BaseModel):
    """Itemized breakdown showing how the risk score was calculated."""
    factor_name: str
    points_added: int
    rationale: str


class JobAnalysisResponse(BaseModel):
    """Complete explainable risk assessment returned to frontend."""
    risk_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Calculated composite risk score from 0 to 100."
    )
    risk_category: Literal["Low Risk", "Moderate Risk", "High Risk", "Very High Risk"] = Field(
        ...,
        description="Categorical tier based on established thresholds."
    )
    executive_summary: str = Field(
        ...,
        description="Brief 2-3 sentence overview of findings in accessible language."
    )
    
    # Detailed evidence
    risk_signals: List[RiskSignalItem] = Field(
        default_factory=list,
        description="List of detected red flags and positive reassuring signals."
    )
    
    # Explainable calculation breakdown
    score_breakdown: List[ScoreFactorBreakdown] = Field(
        default_factory=list,
        description="Itemized score contributors showing exactly how points accumulated."
    )
    
    # Positive signals
    positive_signals: List[str] = Field(
        default_factory=list,
        description="Legitimate business patterns observed (e.g. standard email domain, no fee requests)."
    )
    
    # Uncertainty & Missing details
    missing_information: List[str] = Field(
        default_factory=list,
        description="Important data points absent from the post (e.g. corporate domain, physical location, tax ID)."
    )
    
    # Actionable guidance
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="Immediate, practical steps for the candidate before proceeding."
    )
    
    # Transparency & Limitations disclaimer
    transparency_notes: str = Field(
        ...,
        description="Explicit notice regarding AI screening limitations and verified vs observed status."
    )
    
    analysis_mode: str = Field(
        default="gemini-powered",
        description="'gemini-powered' or 'heuristic-fallback' if API key is not configured."
    )

