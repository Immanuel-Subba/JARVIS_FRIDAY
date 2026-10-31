# FRIDAY — AI Job Scam Detector

> **Next-Generation Recruitment Defense Platform for Students & Job Seekers**  
> Protects candidates from deceptive job advertisements, fake recruiter checks, encrypted chat pivots, and identity theft before sharing sensitive personal details.

---

## 1. Overview & Architecture

FRIDAY is a complete, full-stack cybersecurity web application built for hackathon demonstration. It evaluates submitted job descriptions, unsolicited recruiter emails, and chat messages using **Google GenAI (Gemini 2.5 Flash)** and an algorithmic heuristic cybersecurity engine.

```
┌────────────────────────────────────────────────────────┐
│             FRONTEND (Client-Side)                     │
│  - Vanilla HTML5, CSS3 (Midnight Navy & Cyan Identity) │
│  - Cinematic "F-R-I-D-A-Y" Wordmark Reveal Overlay     │
│  - Vertical-Only Page Scroll & Progress Indicator      │
│  - Dynamic Risk Gauge & Explainable Evidence Cards     │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/analyze (JSON)
┌──────────────────────────▼─────────────────────────────┐
│             BACKEND (FastAPI - Python)                 │
│  - Input sanitization & Pydantic request validation    │
│  - Official Google Gen AI SDK (`google-genai`)         │
│  - Deterministic fallback heuristic engine             │
│  - Score bounds verification & XSS mitigation          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Key Features

1. **Job Scam Threat Analyzer**: Submit job descriptions with optional context (Company, Title, Recruiter, URL) with instant sample loaders (Scam, Task Scam, Legitimate).
2. **Explainable 0–100 Risk Scoring**:
   - **0 – 24**: Low Risk (Standard corporate hiring structure).
   - **25 – 49**: Moderate Risk (Ambiguous details, missing corporate email).
   - **50 – 74**: High Risk (Encrypted messaging only, free email domains, wage anomalies).
   - **75 – 100**: Very High Risk (Upfront fees, fake check equipment scams, premature SSN requests).
3. **Itemized Evidence Breakdown**: Highlights exact quotes, severity points, positive reassuring signals, and missing verification details.
4. **Cinematic Intro**: Electric-blue neon sequential letter reveal (`F -> R -> I -> D -> A -> Y`) settling into a stable wordmark with skip and reduced-motion controls.
5. **Strictly Vertical Scrolling**: Fully responsive with smooth transitions and zero horizontal scroll hijacking.
6. **Trust & Transparency Disclaimer**: Explicitly informs the candidate that the assessment is an initial heuristic screening tool and does not replace official business registry verification.

---

## 3. Project Directory Structure

```
d:\Friday\
├── backend\
│   ├── __init__.py
│   ├── analyzer.py        # Gemini API integration (google-genai SDK) with graceful fallback
│   ├── heuristics.py      # Deterministic rule engine for pattern matching & score bounds
│   ├── main.py            # FastAPI application, CORS, and static file mount
│   └── models.py          # Pydantic data schemas (JobAnalysisRequest, JobAnalysisResponse)
├── frontend\
│   ├── css\
│   │   └── styles.css     # Midnight navy palette, custom cursor, gauge styles, responsive layout
│   ├── js\
│   │   └── app.js         # Cinematic intro, vertical scroll tracker, fetch API & dashboard DOM rendering
│   └── index.html         # Semantic HTML5 layout with accessibility attributes
├── .env.example           # Configuration template for GEMINI_API_KEY
├── .gitignore             # Git ignore rules for secrets (.env) and Python artifacts
├── requirements.txt       # Python package dependencies
├── test_core.py           # Verification test suite for scoring & models
└── README.md              # Project documentation & run guide
```

---

## 4. Quickstart: Installation & Running

### Prerequisites
- Python 3.10+ (Tested on Python 3.11.5)
- Modern web browser (Chrome, Edge, Firefox)

### Step 1: Install Dependencies
Open PowerShell or VS Code Terminal in `d:\Friday`:
```powershell
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Open `.env` and set your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=8000
HOST=127.0.0.1
```
*(Note: If no API key is provided, FRIDAY automatically runs in built-in cybersecurity heuristic mode, ensuring the app remains fully functional without crashing.)*

### Step 3: Run the Application Server
Start the backend server using Uvicorn:
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 4: Open in Your Browser
Visit:
```
http://127.0.0.1:8000/
```

---

## 5. Verification Test Suite
To run the automated validation tests:
```powershell
python test_core.py
```
Expected output:
```
[PASS] Test 1 Passed! (Scam Detection)
[PASS] Test 2 Passed! (Legitimate Posting)
[PASS] Test 3 Passed! (Risk Classification Thresholds)
ALL CORE UNIT & INTEGRATION TESTS PASSED (3/3)
```

---

## 6. Security & Responsible AI Considerations
- **No Client-Side Secrets**: `GEMINI_API_KEY` is loaded and managed exclusively on the FastAPI server.
- **Data Privacy**: Input text is processed strictly for ephemeral analysis and is never stored in a database.
- **XSS Mitigation**: User-supplied input and quote snippets are escaped using `escapeHTML()` before rendering in the DOM.
- **Explainability**: AI results clearly distinguish observed evidence from inferences and state model limitations.

