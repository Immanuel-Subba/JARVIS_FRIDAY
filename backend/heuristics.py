"""
FRIDAY - Heuristic Rule Engine
Provides deterministic, explainable pattern evaluation for offline mode or baseline validation.
"""

import re
from typing import List, Tuple
from .models import RiskSignalItem, ScoreFactorBreakdown, JobAnalysisResponse


# Specific patterns observed in common employment scams
PATTERNS = [
    {
        "category": "Upfront Fees / Payment Demand",
        "regex": r"(registration fee|training fee|processing fee|security deposit|pay for (equipment|laptop|software|visa|id card)|buy gift card|wire transfer|western union|crypto|usdt|bitcoin)",
        "points": 35,
        "headline": "Upfront payment or monetary transfer requested",
        "explanation": "Legitimate employers never demand job seekers pay fees for interviews, onboarding equipment, background checks, or training.",
        "severity": 35
    },
    {
        "category": "Suspicious Communication Channel",
        "regex": r"(telegram|whatsapp|signal|google chat|hangouts|text me on|download telegram|contact @[a-zA-Z0-9_]+)",
        "points": 25,
        "headline": "Interview or recruitment restricted to private messaging apps",
        "explanation": "Scammers favor encrypted chat channels like Telegram and WhatsApp to evade corporate domain tracing and enterprise oversight.",
        "severity": 25
    },
    {
        "category": "Free/Public Email Domain",
        "regex": r"@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|protonmail\.com|mail\.com)",
        "points": 20,
        "headline": "Recruiter using free public email service",
        "explanation": "Legitimate corporate recruiters communicate via company-owned email domains matching their organization (e.g. name@microsoft.com), not generic free accounts.",
        "severity": 20
    },
    {
        "category": "Unrealistic Compensation / Easy Money",
        "regex": r"(\$([5-9][0-9]|[1-9][0-9]{2})\s*/\s*hr|guaranteed income|earn \$[0-9,]+ (weekly|daily)|no experience necessary.*(\$50|\$60|\$70|\$80|\$100)|no experience.*six figures|100% guaranteed)",
        "points": 20,
        "headline": "Extremely high compensation for minimal qualifications",
        "explanation": "Offering disproportionately high hourly or daily rates without requiring technical interviews or domain experience is a classic hook used in task and check-cashing scams.",
        "severity": 20
    },
    {
        "category": "Artificial Urgency & Immediate Hire",
        "regex": r"(immediate hiring|hired immediately|act fast|urgent requirement|spots limited|start today without interview|no interview required)",
        "points": 15,
        "headline": "High-pressure urgency and immediate job offer without rigorous vetting",
        "explanation": "Rushing candidates into accepting positions without formal multi-stage interviews or references is designed to bypass critical thinking and due diligence.",
        "severity": 15
    },
    {
        "category": "Data Harvesting / Sensitive PII",
        "regex": r"(ssn|social security number|bank account details|routing number|passport photo|credit card details|front and back of your id)",
        "points": 30,
        "headline": "Premature request for sensitive banking or identity data",
        "explanation": "Requests for social security numbers, banking details, or identity documents before a formal verified offer and contract are hallmarks of identity theft.",
        "severity": 30
    },
    {
        "category": "Vague Task or Package Reshipping",
        "regex": r"(re-shipping|package inspector|mystery shopper|task optimization|click to earn|data entry.*\$40/hr)",
        "points": 25,
        "headline": "Signs of mule recruitment or task/reshipping scam",
        "explanation": "Roles involving parcel forwarding or clicking apps to earn commissions frequently implicate job seekers in criminal laundering or fraud networks.",
        "severity": 25
    }
]

POSITIVE_PATTERNS = [
    {
        "regex": r"(clear job description|requirements:|qualifications:|equal opportunity employer|benefits:|401\(k\)|health insurance)",
        "note": "Standard structured corporate job posting sections detected."
    },
    {
        "regex": r"(@[a-zA-Z0-9.-]+\.(org|edu|gov|com))",
        "note": "Email or reference to official domain identified."
    }
]


def classify_risk(score: int) -> str:
    """Classifies risk score according to clear established thresholds."""
    if score >= 75:
        return "Very High Risk"
    elif score >= 50:
        return "High Risk"
    elif score >= 25:
        return "Moderate Risk"
    else:
        return "Low Risk"


def analyze_heuristically(
    job_desc: str,
    company: str = "",
    title: str = "",
    recruiter: str = "",
    url: str = ""
) -> JobAnalysisResponse:
    """Deterministic rule-based analysis returning an explainable assessment."""
    full_text = f"{job_desc} {company} {title} {recruiter} {url}".lower()
    
    signals: List[RiskSignalItem] = []
    breakdown: List[ScoreFactorBreakdown] = []
    total_score = 5  # Base baseline
    
    for pat in PATTERNS:
        match = re.search(pat["regex"], full_text)
        if match:
            found_quote = match.group(0)
            # Find context around match
            start = max(0, match.start() - 25)
            end = min(len(full_text), match.end() + 25)
            snippet = f"...{full_text[start:end].strip()}..."
            
            sig = RiskSignalItem(
                category=pat["category"],
                signal_type="warning",
                headline=pat["headline"],
                evidence_quote=f'Matched term: "{found_quote}" ({snippet})',
                explanation=pat["explanation"],
                severity_weight=pat["severity"]
            )
            signals.append(sig)
            
            points = pat["points"]
            total_score += points
            breakdown.append(ScoreFactorBreakdown(
                factor_name=pat["category"],
                points_added=points,
                rationale=pat["headline"]
            ))

    # Evaluate positive indicators
    positives: List[str] = []
    for pos in POSITIVE_PATTERNS:
        if re.search(pos["regex"], full_text):
            positives.append(pos["note"])
            
    if not any(s.category == "Upfront Fees / Payment Demand" for s in signals):
        positives.append("No explicit upfront fee, deposit, or payment demand was found in the text.")

    if not any(s.category == "Data Harvesting / Sensitive PII" for s in signals):
        positives.append("No premature requests for bank routing or SSN numbers were detected in this passage.")

    # Missing information checklist
    missing: List[str] = []
    if not company or len(company.strip()) < 2:
        missing.append("Verified company name or entity registration was not provided.")
    if not url or "http" not in url:
        missing.append("Official company career portal or legitimate job posting URL is missing.")
    if not recruiter or "@" not in recruiter:
        missing.append("Verifiable corporate email address for the recruiter is absent.")
    missing.append("External business registration (e.g. corporate registry, LinkedIn presence) cannot be automatically verified from text alone.")

    # Clamp score
    total_score = min(100, max(0, total_score))
    category = classify_risk(total_score)
    
    # Recommended actions based on severity
    actions = [
        "Search the company name with keywords like 'scam', 'fraud', or 'reviews' on Reddit and Glassdoor.",
        "Check whether the job is listed directly on the employer's official website careers page.",
        "Never send money, purchase equipment, or cash a check sent by a prospective employer before starting work."
    ]
    if total_score >= 50:
        actions.insert(0, "DO NOT disclose sensitive PII (SSN, banking numbers, passport) or click unusual shortened links.")
        actions.append("Refuse to conduct professional interviews exclusively over Telegram or WhatsApp.")

    # Executive summary
    if total_score >= 75:
        summary = f"This posting demonstrates critical red flags ({len(signals)} major warning signals detected) characteristic of aggressive employment or fee-collection scams. Exercise extreme caution."
    elif total_score >= 50:
        summary = f"This opportunity presents multiple suspicious attributes ({len(signals)} warnings). Substantial verification is required before sharing private information or continuing dialogue."
    elif total_score >= 25:
        summary = "Several ambiguous patterns or missing verification details were detected. Proceed cautiously and independently verify the recruiter's identity."
    else:
        summary = "The provided description displays typical professional structure without obvious red flags. Always verify company identity before signing agreements."

    return JobAnalysisResponse(
        risk_score=total_score,
        risk_category=category,
        executive_summary=summary,
        risk_signals=signals,
        score_breakdown=breakdown,
        positive_signals=positives,
        missing_information=missing,
        recommended_actions=actions,
        transparency_notes="Screening powered by rule-based heuristic engine. Assessment is an initial advisory indicator, not legal or definitive proof. External company registries were not contacted.",
        analysis_mode="heuristic-fallback"
    )

