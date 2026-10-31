"""
Direct synchronous verification test for FRIDAY endpoints & business logic.
"""

from backend.models import JobAnalysisRequest
from backend.analyzer import analyze_job_listing
from backend.heuristics import classify_risk

def test_friday_core():
    print("=" * 60)
    print("FRIDAY CORE VERIFICATION TEST SUITE")
    print("=" * 60)

    # Test 1: High Risk Equipment & Telegram Scam
    print("\n[TEST 1] Analyzing High-Risk Telegram & Check Scam...")
    scam_req = JobAnalysisRequest(
        job_description="Urgent offer! Earn $85/hr for remote data entry with zero experience. Message HR on Telegram @GlobalDesk to receive a $3500 equipment check and pay the $50 registration fee.",
        company_name="Apex Logistics LLC",
        job_title="Data Entry Assistant",
        recruiter_contact="hr-apex@gmail.com",
        job_url="http://bit.ly/scam-test"
    )
    res_scam = analyze_job_listing(scam_req)
    print(f"-> Risk Score: {res_scam.risk_score}/100")
    print(f"-> Risk Category: {res_scam.risk_category}")
    print(f"-> Signals Count: {len(res_scam.risk_signals)}")
    print(f"-> Mode: {res_scam.analysis_mode}")
    assert res_scam.risk_score >= 50, "Scam score should be >= 50"
    assert res_scam.risk_category in ["High Risk", "Very High Risk"]
    print("[PASS] Test 1 Passed!")

    # Test 2: Low Risk Professional Job Posting
    print("\n[TEST 2] Analyzing Legitimate Professional Job Description...")
    legit_req = JobAnalysisRequest(
        job_description="We are seeking a Junior Frontend Developer to join our engineering team. Requirements: BS in Computer Science or boot camp equivalent, proficiency in HTML, CSS, JavaScript, and Git. Competitive compensation ($70k-$85k) with health insurance and 401(k) matching. Standard multi-stage interview.",
        company_name="CloudWave Systems Inc",
        job_title="Junior Frontend Developer",
        recruiter_contact="careers@cloudwavesystems.com",
        job_url="https://cloudwavesystems.com/careers/jr-frontend"
    )
    res_legit = analyze_job_listing(legit_req)
    print(f"-> Risk Score: {res_legit.risk_score}/100")
    print(f"-> Risk Category: {res_legit.risk_category}")
    print(f"-> Positive Signals: {len(res_legit.positive_signals)}")
    assert res_legit.risk_score < 40, "Legitimate job should have low risk score"
    assert res_legit.risk_category in ["Low Risk", "Moderate Risk"]
    print("[PASS] Test 2 Passed!")

    # Test 3: Score Classification Function
    print("\n[TEST 3] Verifying Risk Thresholds...")
    assert classify_risk(10) == "Low Risk"
    assert classify_risk(25) == "Moderate Risk"
    assert classify_risk(50) == "High Risk"
    assert classify_risk(85) == "Very High Risk"
    print("[PASS] Test 3 Passed!")

    print("\n" + "=" * 60)
    print("ALL CORE UNIT & INTEGRATION TESTS PASSED (3/3)")
    print("=" * 60)

if __name__ == "__main__":
    test_friday_core()
