/**
 * FRIDAY — AI Job Scam Detector
 * Core Frontend Logic: Cinematic Intro, Vertical Scroll Tracking, Analysis, & UI Interactions
 */

// DOM Elements
const introOverlay = document.getElementById('introOverlay');
const introLetters = document.querySelectorAll('.intro-letter');
const introSubtitle = document.getElementById('introSubtitle');
const skipIntroBtn = document.getElementById('skipIntroBtn');
const scrollProgressBar = document.getElementById('scrollProgressBar');
const customCursor = document.getElementById('customCursor');
const customCursorDot = document.getElementById('customCursorDot');

// Form & Controls
const scamForm = document.getElementById('scamForm');
const jobDescInput = document.getElementById('jobDescInput');
const companyInput = document.getElementById('companyInput');
const jobTitleInput = document.getElementById('jobTitleInput');
const recruiterInput = document.getElementById('recruiterInput');
const jobUrlInput = document.getElementById('jobUrlInput');
const submitBtn = document.getElementById('submitBtn');
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');
const errorAlert = document.getElementById('errorAlert');
const charCounter = document.getElementById('charCounter');

// Results Elements
const resultsSection = document.getElementById('resultsSection');
const scoreGaugeFill = document.getElementById('scoreGaugeFill');
const scoreNumber = document.getElementById('scoreNumber');
const riskBadge = document.getElementById('riskBadge');
const execSummary = document.getElementById('execSummary');
const metaModePill = document.getElementById('metaModePill');
const evidenceGrid = document.getElementById('evidenceGrid');
const breakdownTableBody = document.getElementById('breakdownTableBody');
const positiveList = document.getElementById('positiveList');
const missingList = document.getElementById('missingList');
const recList = document.getElementById('recList');
const transparencyText = document.getElementById('transparencyText');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');

// Cache last analysis for copying/exporting
let currentAnalysisResult = null;

// ==========================================================================
// 1. CINEMATIC INTRO SEQUENCE
// ==========================================================================
function playCinematicIntro() {
  // Check if user has already seen the intro in this browser session


  const letters = ['F', 'R', 'I', 'D', 'A', 'Y'];
  let delay = 350;

  introLetters.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('revealed', 'glitch-flash');
      setTimeout(() => {
        el.classList.remove('glitch-flash');
      }, 220);
    }, delay * (index + 1));
  });

  // Reveal subtitle
  setTimeout(() => {
    introSubtitle.classList.add('revealed');
  }, delay * 7);

  // Transition into main app
  setTimeout(() => {
    dismissIntro();
  }, delay * 9);
}

function dismissIntro() {
  introOverlay.classList.add('hidden');
  sessionStorage.setItem('friday_intro_played', 'true');
}

if (skipIntroBtn) {
  skipIntroBtn.addEventListener('click', dismissIntro);
}

// ==========================================================================
// 2. VERTICAL SCROLL PROGRESS & CURSOR INTERPOLATION
// ==========================================================================
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgressBar) {
    scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
  }
}, { passive: true });

// Desktop Custom Cursor
if (customCursor && customCursorDot && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    customCursorDot.style.left = `${mouseX}px`;
    customCursorDot.style.top = `${mouseY}px`;
  }, { passive: true });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    customCursor.style.left = `${cursorX}px`;
    customCursor.style.top = `${cursorY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);
}

// Character counter
if (jobDescInput && charCounter) {
  jobDescInput.addEventListener('input', () => {
    charCounter.textContent = `${jobDescInput.value.length} / 20,000 characters`;
  });
}

// ==========================================================================
// 3. SAMPLE DATA FILLERS
// ==========================================================================
const SAMPLE_CASES = {
  scam: {
    desc: `URGENT OFFER: You have been selected for the Data Entry & Administrative Optimization Assistant role at Global Apex Logix LLC. 
Pay is $78.50 per hour with 100% guaranteed weekly bonus. No prior technical experience required.
Immediate start today! To confirm your spot, connect immediately with our Senior HR Director on Telegram: @GlobalApexHR_Desk.
You will be issued a company check of $3,500 to purchase required home office equipment (Apple MacBook M3 & certified cryptographic software suite) from our approved vendor. Send your full SSN, home address, and bank routing number to receive your sign-on packet immediately.`,
    company: "Global Apex Logix LLC",
    title: "Data Entry & Admin Assistant",
    recruiter: "hr-globalapex@gmail.com / Telegram @GlobalApexHR_Desk",
    url: "http://bit.ly/apex-career-fast"
  },
  legit: {
    desc: `Junior Web Developer (Frontend)
At CloudWave Systems, we build cloud-native workflow applications for enterprise teams.
Key Responsibilities:
- Build and maintain user interface components using HTML, CSS, modern JavaScript, and React.
- Collaborate with designers, backend engineers, and product managers in 2-week agile sprints.
- Write unit tests and participate in peer code reviews.

Qualifications:
- Bachelor's degree in Computer Science, software bootcamp certification, or equivalent practical experience.
- Familiarity with Git version control, REST APIs, and responsive design principles.
- Strong problem-solving mindset and clear communication skills.

Benefits:
- Competitive salary ($72,000 - $85,000/year commensurate with experience)
- 401(k) matching up to 4%, Comprehensive health/dental/vision coverage, flexible hybrid work policy.
- Standard 3-stage interview process: recruiter phone screen, technical code walkthrough, team interview.
Equal Opportunity Employer.`,
    company: "CloudWave Systems Inc.",
    title: "Junior Web Developer",
    recruiter: "careers@cloudwavesystems.com",
    url: "https://www.cloudwavesystems.com/careers/jr-web-dev"
  },
  task: {
    desc: `Work From Home Part-Time!
Earn $300 to $600 daily by simply reviewing apps and completing product task optimization. 
Work anytime from your phone, 30-60 minutes per day. 
Requirements: Must have smartphone and Telegram/WhatsApp account. 
To unlock your VIP commission account, a refundable deposit of $100 in USDT/Crypto is required to verify your wallet address.`,
    company: "Apex Task Network",
    title: "Product Task Specialist",
    recruiter: "+1 (800) 555-0199 via WhatsApp",
    url: "https://t.me/task_vip_earn"
  }
};

window.fillSample = function(type) {
  const sample = SAMPLE_CASES[type];
  if (!sample) return;
  jobDescInput.value = sample.desc;
  companyInput.value = sample.company;
  jobTitleInput.value = sample.title;
  recruiterInput.value = sample.recruiter;
  jobUrlInput.value = sample.url;
  jobDescInput.dispatchEvent(new Event('input'));
  hideError();
  // Scroll smoothly to form
  scamForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// ==========================================================================
// 4. FORM SUBMISSION & BACKEND API CALL
// ==========================================================================
scamForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const jobDesc = jobDescInput.value.trim();
  if (jobDesc.length < 20) {
    showError("Please enter at least 20 characters of the job description or message.");
    jobDescInput.focus();
    return;
  }

  // Set loading state
  submitBtn.disabled = true;
  btnSpinner.style.display = 'inline-block';
  btnText.textContent = "Analyzing Signals...";

  const payload = {
    job_description: jobDesc,
    company_name: companyInput.value.trim() || null,
    job_title: jobTitleInput.value.trim() || null,
    recruiter_contact: recruiterInput.value.trim() || null,
    job_url: jobUrlInput.value.trim() || null
  };

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned error (${response.status})`);
    }

    const data = await response.json();
    currentAnalysisResult = data;
    renderResults(data);

    // Reveal and scroll smoothly to results
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    console.error("Analysis request failed:", err);
    showError(`Analysis failed: ${err.message}. Please check your connection or backend status.`);
  } finally {
    submitBtn.disabled = false;
    btnSpinner.style.display = 'none';
    btnText.textContent = "Analyze for Scam Indicators";
  }
});

function showError(msg) {
  errorAlert.textContent = msg;
  errorAlert.style.display = 'block';
}

function hideError() {
  errorAlert.style.display = 'none';
  errorAlert.textContent = '';
}

// ==========================================================================
// 5. RENDER RESULTS DASHBOARD
// ==========================================================================
function renderResults(data) {
  const score = Math.max(0, Math.min(100, data.risk_score));
  
  // Animate Gauge & Score Number
  scoreNumber.textContent = score;
  const circumference = 440; // 2 * PI * 70
  const offset = circumference - (score / 100) * circumference;
  
  // Set stroke color based on tier
  let strokeColor = '#10b981';
  let badgeClass = 'low';
  
  if (score >= 75) {
    strokeColor = '#ef4444';
    badgeClass = 'very-high';
  } else if (score >= 50) {
    strokeColor = '#f97316';
    badgeClass = 'high';
  } else if (score >= 25) {
    strokeColor = '#f59e0b';
    badgeClass = 'moderate';
  }

  scoreGaugeFill.style.stroke = strokeColor;
  scoreGaugeFill.style.strokeDashoffset = offset;

  // Set Risk Badge
  riskBadge.className = `risk-badge ${badgeClass}`;
  riskBadge.textContent = data.risk_category;

  // Executive summary
  execSummary.textContent = data.executive_summary;

  // Meta mode pill
  metaModePill.textContent = data.analysis_mode === 'gemini-powered' 
    ? '⚡ AI Intelligence Engine: Gemini 2.5' 
    : '🛡️ Local Algorithmic Heuristic Engine';

  // Render Risk Signals
  evidenceGrid.innerHTML = '';
  if (!data.risk_signals || data.risk_signals.length === 0) {
    evidenceGrid.innerHTML = `
      <div class="evidence-card" style="border-left: 3px solid #10b981;">
        <div class="evidence-headline" style="color: #10b981;">No explicit red flag patterns detected</div>
        <p class="evidence-explanation">The submitted text does not contain common overt indicators such as upfront fee requests, encrypted-only chat, or check-cashing requests.</p>
      </div>`;
  } else {
    data.risk_signals.forEach(sig => {
      const card = document.createElement('div');
      card.className = 'evidence-card';
      const sevClass = sig.severity_weight >= 25 ? 'severity-warn' : 'severity-mod';
      card.innerHTML = `
        <div class="evidence-card-header">
          <span class="evidence-category">${escapeHTML(sig.category)}</span>
          <span class="evidence-severity ${sevClass}">+${sig.severity_weight} Pts Risk</span>
        </div>
        <div class="evidence-headline">${escapeHTML(sig.headline)}</div>
        <div class="evidence-quote-box">${escapeHTML(sig.evidence_quote)}</div>
        <div class="evidence-explanation">${escapeHTML(sig.explanation)}</div>
      `;
      evidenceGrid.appendChild(card);
    });
  }

  // Render Score Breakdown
  breakdownTableBody.innerHTML = '';
  if (data.score_breakdown && data.score_breakdown.length > 0) {
    data.score_breakdown.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHTML(item.factor_name)}</strong></td>
        <td>${escapeHTML(item.rationale)}</td>
        <td class="breakdown-points">+${item.points_added}</td>
      `;
      breakdownTableBody.appendChild(row);
    });
  } else {
    breakdownTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Baseline profile maintained. No individual penalty additions.</td></tr>`;
  }

  // Render Positive Reassuring Signals
  positiveList.innerHTML = '';
  if (data.positive_signals && data.positive_signals.length > 0) {
    data.positive_signals.forEach(pos => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="color: #10b981;">✓</span> <span>${escapeHTML(pos)}</span>`;
      positiveList.appendChild(li);
    });
  } else {
    positiveList.innerHTML = `<li><span style="color: var(--text-muted);">-</span> <span>No specific positive signals observed.</span></li>`;
  }

  // Render Missing Information
  missingList.innerHTML = '';
  if (data.missing_information && data.missing_information.length > 0) {
    data.missing_information.forEach(mis => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="color: #f59e0b;">?</span> <span>${escapeHTML(mis)}</span>`;
      missingList.appendChild(li);
    });
  } else {
    missingList.innerHTML = `<li><span>No major verification information noted as missing.</span></li>`;
  }

  // Render Recommended Next Steps
  recList.innerHTML = '';
  if (data.recommended_actions && data.recommended_actions.length > 0) {
    data.recommended_actions.forEach((act, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="rec-step-num">${idx + 1}</span>
        <span>${escapeHTML(act)}</span>
      `;
      recList.appendChild(li);
    });
  }

  // Transparency Disclaimer
  transparencyText.textContent = data.transparency_notes;
}

// Reset / Analyze Another Job
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    resultsSection.style.display = 'none';
    jobDescInput.value = '';
    companyInput.value = '';
    jobTitleInput.value = '';
    recruiterInput.value = '';
    jobUrlInput.value = '';
    charCounter.textContent = '0 / 20,000 characters';
    currentAnalysisResult = null;
    scamForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    jobDescInput.focus();
  });
}

// Copy Summary
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    if (!currentAnalysisResult) return;
    const exportText = `--- FRIDAY AI Job Scam Detector Assessment ---
Risk Score: ${currentAnalysisResult.risk_score}/100 (${currentAnalysisResult.risk_category})
Summary: ${currentAnalysisResult.executive_summary}

Risk Signals Detected (${currentAnalysisResult.risk_signals.length}):
${currentAnalysisResult.risk_signals.map(s => `• [${s.category}] ${s.headline} (Quote: ${s.evidence_quote})`).join('\n')}

Recommended Next Steps:
${currentAnalysisResult.recommended_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Transparency Notice:
${currentAnalysisResult.transparency_notes}
---------------------------------------------`;

    navigator.clipboard.writeText(exportText).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "✓ Assessment Copied!";
      setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
    }).catch(err => {
      alert("Failed to copy assessment to clipboard.");
    });
  });
}

// ==========================================================================
// 5. CINEMATIC 3D SCROLL-RESPONSIVE BACKGROUND (Three.js & WebGL)
// ==========================================================================
function initFriday3DBackground() {
  const canvas = document.getElementById('friday3dCanvas');
  if (!canvas) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const glCanvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // Graceful fallback to 2.5D Canvas if Three.js is not loaded or WebGL is unsupported
  if (typeof THREE === 'undefined' || !isWebGLAvailable()) {
    initCanvas2DFallback(canvas, prefersReducedMotion);
    return;
  }

  try {
    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 16);

    // 3. Scene Setup
    const scene = new THREE.Scene();

    // Main system group (rotates and transforms based on scroll)
    const systemGroup = new THREE.Group();
    scene.add(systemGroup);

    // ------------------------------------------------------------------------
    // A. Luminous Spherical AI Core
    // ------------------------------------------------------------------------
    const coreGroup = new THREE.Group();
    systemGroup.add(coreGroup);

    // Inner wireframe nucleus (Electric Blue)
    const innerNucleusGeo = new THREE.IcosahedronGeometry(2.0, 2);
    const innerNucleusMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const innerNucleus = new THREE.Mesh(innerNucleusGeo, innerNucleusMat);
    coreGroup.add(innerNucleus);

    // Dense inner point cloud shell (Cyber Cyan)
    const coreSphereGeo = new THREE.SphereGeometry(1.7, 28, 28);
    const corePointsMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 0.055,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const corePoints = new THREE.Points(coreSphereGeo, corePointsMat);
    coreGroup.add(corePoints);

    // Outer crystalline hex cage (Subtle Electric Blue)
    const outerCageGeo = new THREE.IcosahedronGeometry(2.45, 1);
    const outerCageMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const outerCage = new THREE.Mesh(outerCageGeo, outerCageMat);
    coreGroup.add(outerCage);

    // ------------------------------------------------------------------------
    // B. Fine Multi-Axis Orbital Rings
    // ------------------------------------------------------------------------
    const ringsGroup = new THREE.Group();
    systemGroup.add(ringsGroup);

    // Ring 1 (Inner Cyan Ring)
    const ring1Geo = new THREE.TorusGeometry(3.6, 0.02, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3.2;
    ring1.rotation.y = 0.2;
    ringsGroup.add(ring1);

    // Ring 2 (Middle Electric Ring)
    const ring2Geo = new THREE.TorusGeometry(5.0, 0.022, 16, 140);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.42
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 6;
    ringsGroup.add(ring2);

    // Ring 3 (Outer Horizon Accent Ring)
    const ring3Geo = new THREE.TorusGeometry(6.4, 0.018, 16, 160);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.3
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 2.8;
    ring3.rotation.z = 0.5;
    ringsGroup.add(ring3);

    // Orbital marker node on Ring 1
    const markerGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.95
    });
    const ringMarker = new THREE.Mesh(markerGeo, markerMat);
    ringMarker.position.set(3.6, 0, 0);
    ring1.add(ringMarker);

    // ------------------------------------------------------------------------
    // C. Interconnected Neural Network Nodes & Synaptic Lines
    // ------------------------------------------------------------------------
    const neuralGroup = new THREE.Group();
    systemGroup.add(neuralGroup);

    const nodeCount = 80;
    const nodePositions = [];
    const nodeCoords = [];

    // Distribute nodes in a 3D cloud around the AI core
    for (let i = 0; i < nodeCount; i++) {
      const radius = 3.5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      nodeCoords.push(new THREE.Vector3(x, y, z));
      nodePositions.push(x, y, z);
    }

    // Node Points
    const nodesGeo = new THREE.BufferGeometry();
    nodesGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
    const nodesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.09,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const neuralNodes = new THREE.Points(nodesGeo, nodesMat);
    neuralGroup.add(neuralNodes);

    // Synaptic Connection Lines between nearby nodes
    const lineIndices = [];
    const maxConnectDist = 3.2;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodeCoords[i].distanceTo(nodeCoords[j]) < maxConnectDist) {
          lineIndices.push(nodeCoords[i].x, nodeCoords[i].y, nodeCoords[i].z);
          lineIndices.push(nodeCoords[j].x, nodeCoords[j].y, nodeCoords[j].z);
        }
      }
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineIndices, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending
    });
    const neuralLines = new THREE.LineSegments(linesGeo, linesMat);
    neuralGroup.add(neuralLines);

    // ------------------------------------------------------------------------
    // D. Ambient Floating Data Particles
    // ------------------------------------------------------------------------
    const particleCount = 280;
    const particlePositions = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions.push(
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 24
      );
    }
    const ambientGeo = new THREE.BufferGeometry();
    ambientGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const ambientMat = new THREE.PointsMaterial({
      color: 0x0284c7,
      size: 0.05,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const ambientParticles = new THREE.Points(ambientGeo, ambientMat);
    scene.add(ambientParticles);

    // ------------------------------------------------------------------------
    // E. Holographic Cyber Compass Disk
    // ------------------------------------------------------------------------
    const compassGeo = new THREE.RingGeometry(2.8, 7.2, 48, 1);
    const compassMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide
    });
    const compassDisk = new THREE.Mesh(compassGeo, compassMat);
    compassDisk.rotation.x = Math.PI / 2.2;
    compassDisk.position.y = -3.2;
    systemGroup.add(compassDisk);

    // ------------------------------------------------------------------------
    // F. Vertical Scroll Tracking & Smooth Interpolation
    // ------------------------------------------------------------------------
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let isTabVisible = true;

    function updateScrollProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      targetScrollProgress = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // Tab visibility handling (pause to conserve GPU/CPU)
    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });

    // Window Resize Handling
    function onResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }
    window.addEventListener('resize', onResize, { passive: true });

    // ------------------------------------------------------------------------
    // G. Animation Render Loop
    // ------------------------------------------------------------------------
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth scroll interpolation (Lerp factor 0.065)
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * (prefersReducedMotion ? 0.03 : 0.065);

      // 1. Continuous Ambient Floating Motion
      const baseRotationSpeed = prefersReducedMotion ? 0.04 : 0.15;
      innerNucleus.rotation.x += delta * baseRotationSpeed;
      innerNucleus.rotation.y += delta * (baseRotationSpeed * 1.3);
      outerCage.rotation.x -= delta * (baseRotationSpeed * 0.8);
      outerCage.rotation.z += delta * (baseRotationSpeed * 0.6);
      corePoints.rotation.y += delta * (baseRotationSpeed * 0.5);

      // Rings continuous rotation
      ring1.rotation.z += delta * 0.2;
      ring2.rotation.x += delta * 0.14;
      ring3.rotation.y -= delta * 0.12;

      // Ambient particle gentle drift
      ambientParticles.rotation.y = elapsedTime * 0.015;
      ambientParticles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.05;

      // 2. Scroll-Linked Transformations (Full Bi-directional Response)
      if (!prefersReducedMotion) {
        const p = currentScrollProgress;

        // System position moves gracefully along an S-curve across sections
        // Offset slightly to provide visual framing behind content cards
        systemGroup.position.x = Math.sin(p * Math.PI * 1.8) * 2.2;
        systemGroup.position.y = (0.5 - p * 2.4);
        systemGroup.position.z = Math.sin(p * Math.PI) * 1.8;

        // System Rotation responds directly to scroll position
        systemGroup.rotation.y = elapsedTime * 0.08 + p * Math.PI * 1.25;
        systemGroup.rotation.x = Math.sin(p * Math.PI) * 0.28;

        // Camera Depth & Subtle Pan
        camera.position.z = 16 - p * 3.2;
        camera.position.y = -p * 1.4;

        // Orbital Rings dynamic inclination shifts with scroll
        ring1.rotation.x = (Math.PI / 3.2) + p * Math.PI * 0.8;
        ring2.rotation.y = (-Math.PI / 4) - p * Math.PI * 1.1;
        ring3.rotation.z = 0.5 + p * Math.PI * 0.6;

        // Neural network activates as user scrolls into detection logic and scam patterns
        neuralLines.material.opacity = 0.14 + p * 0.32;
        neuralNodes.material.opacity = 0.65 + p * 0.3;
        neuralGroup.rotation.y = -p * 1.5 - elapsedTime * 0.05;

        // Core pulse and opacity scaling
        const pulse = 1 + Math.sin(elapsedTime * 2.5 + p * 4) * 0.05;
        coreGroup.scale.set(pulse, pulse, pulse);
        innerNucleusMat.opacity = 0.3 + p * 0.2;
      }

      renderer.render(scene, camera);
    }

    animate();

  } catch (err) {
    console.warn("FRIDAY WebGL initialization notice:", err);
    initCanvas2DFallback(canvas, prefersReducedMotion);
  }
}

// ----------------------------------------------------------------------------
// Graceful Canvas 2.5D Fallback (For offline/non-WebGL environments)
// ----------------------------------------------------------------------------
function initCanvas2DFallback(canvas, prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  let targetScroll = 0;
  let currentScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    targetScroll = maxScroll > 0 ? scrollTop / maxScroll : 0;
  }, { passive: true });

  const points = [];
  const count = 60;
  for (let i = 0; i < count; i++) {
    points.push({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
      z: (Math.random() - 0.5) * 800,
      baseRadius: 180 + Math.random() * 120
    });
  }

  let angle = 0;
  let isTabActive = true;
  document.addEventListener('visibilitychange', () => { isTabActive = !document.hidden; });

  function render2D() {
    requestAnimationFrame(render2D);
    if (!isTabActive) return;

    ctx.clearRect(0, 0, width, height);

    currentScroll += (targetScroll - currentScroll) * 0.06;
    angle += prefersReducedMotion ? 0.003 : 0.008;

    const centerX = width * 0.5 + Math.sin(currentScroll * Math.PI) * 120;
    const centerY = height * 0.5 + (0.5 - currentScroll) * 80;
    const fov = 350;

    // Render central energy rings
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      const ringRadius = (90 + r * 55) * (1 + currentScroll * 0.2);
      ctx.ellipse(
        centerX,
        centerY,
        ringRadius,
        ringRadius * (0.35 + Math.sin(angle + r) * 0.15),
        angle * (r % 2 === 0 ? 1 : -1) + currentScroll * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = r === 0 ? 'rgba(56, 189, 248, 0.45)' : (r === 1 ? 'rgba(14, 165, 233, 0.35)' : 'rgba(0, 242, 254, 0.25)');
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Render 3D projected nodes
    const projected = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const rad = angle + i * 0.1 + currentScroll * 1.5;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      const x = p.x * cosA - p.z * sinA;
      const z = p.x * sinA + p.z * cosA + 500;
      const y = p.y;

      const scale = fov / z;
      const px = centerX + x * scale;
      const py = centerY + y * scale;

      projected.push({ x: px, y: py, scale: scale });

      ctx.fillStyle = 'rgba(56, 189, 248, ' + Math.min(0.8, scale * 1.2) + ')';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, scale * 2.2), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render connecting lines
    ctx.strokeStyle = 'rgba(14, 165, 233, ' + (0.08 + currentScroll * 0.12) + ')';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < projected.length; i += 2) {
      if (i + 1 < projected.length) {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[i + 1].x, projected[i + 1].y);
        ctx.stroke();
      }
    }
  }

  render2D();
}

// Utility: Prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  playCinematicIntro();
  initFriday3DBackground();
});

