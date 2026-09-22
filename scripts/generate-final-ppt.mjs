import pptxgen from "pptxgenjs";

const pres = new pptxgen();

// Set 16:9 widescreen presentation
pres.layout = "LAYOUT_16x9";
pres.title = "MediScan V3 - Final Project Presentation";
pres.author = "MediScan Team";
pres.subject = "Evidence-Locked Personal Health Intelligence & Drug Safety Assistant";

// Design Palette
const C_BG = "0B132B";        // Dark Navy background
const C_CARD = "1C2541";      // Card fill
const C_CARD_BORDER = "3A506B"; // Card border
const C_ACCENT = "0D9488";    // Teal accent
const C_ACCENT_LIGHT = "14B8A6";
const C_CYAN = "38BDF8";      // Highlight cyan
const C_TEXT_MAIN = "F8FAFC"; // Clean white/off-white
const C_TEXT_MUTED = "94A3B8";// Muted gray
const C_EMERALD = "10B981";   // Green badge
const C_AMBER = "F59E0B";     // Amber badge
const C_ROSE = "F43F5E";      // Red badge

// Helper to style a slide header
function addSlideHeader(slide, category, title, subtitle) {
  // Background
  slide.background = { color: C_BG };

  // Top Category Pill / Breadcrumb
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 0.45,
    w: 2.6,
    h: 0.35,
    rectRadius: 0.15,
    fill: { color: "132E48" },
    line: { color: C_CYAN, width: 1 },
  });
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.45,
    w: 2.6,
    h: 0.35,
    fontSize: 10,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
    align: "center",
    valign: "middle",
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.85,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    fontFace: "Arial",
    bold: true,
    color: C_TEXT_MAIN,
  });

  // Slide Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.4,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  }
}

// ==========================================
// SLIDE 1: TITLE & PROJECT IDENTITY
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_BG };

  // Decorative Accent Top Line
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.1,
    fill: { color: C_ACCENT_LIGHT },
  });

  // Center Badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.66,
    y: 1.2,
    w: 4.0,
    h: 0.45,
    rectRadius: 0.2,
    fill: { color: "132E48" },
    line: { color: C_CYAN, width: 1.5 },
  });
  slide.addText("CLINICAL-GRADE HEALTH INTELLIGENCE", {
    x: 4.66,
    y: 1.2,
    w: 4.0,
    h: 0.45,
    fontSize: 11,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
    align: "center",
    valign: "middle",
  });

  // Title
  slide.addText("MediScan V3 (MEDISCAN-EDM)", {
    x: 1.0,
    y: 1.8,
    w: 11.33,
    h: 1.1,
    fontSize: 40,
    fontFace: "Arial",
    bold: true,
    color: C_TEXT_MAIN,
    align: "center",
  });

  // Subtitle
  slide.addText("Evidence-Locked Personal Health Intelligence & Drug Safety Assistant", {
    x: 1.0,
    y: 2.85,
    w: 11.33,
    h: 0.6,
    fontSize: 18,
    fontFace: "Arial",
    color: C_CYAN,
    align: "center",
  });

  // Core Principle Highlight Card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.66,
    y: 3.6,
    w: 8.0,
    h: 1.2,
    rectRadius: 0.15,
    fill: { color: C_CARD },
    line: { color: C_ACCENT, width: 1.5 },
  });
  slide.addText("CORE PHILOSOPHY:\n\"Evidence First. AI Second. Don't Just Ask AI. Verify First.\"", {
    x: 2.8,
    y: 3.7,
    w: 7.7,
    h: 1.0,
    fontSize: 14,
    fontFace: "Arial",
    bold: true,
    color: C_TEXT_MAIN,
    align: "center",
    valign: "middle",
  });

  // 3 Pillar Cards at Bottom
  const pillars = [
    { title: "Deterministic Range Grounding", desc: "Patient values evaluated strictly against printed lab boundaries" },
    { title: "openFDA Monograph Alignment", desc: "Active ingredients cross-referenced with authoritative FDA data" },
    { title: "Zero-PII Cryptographic Seals", desc: "Deterministic FNV-1a IDs with tamper detection & memory isolation" },
  ];

  pillars.forEach((p, idx) => {
    const x = 1.0 + idx * 3.85;
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 5.1,
      w: 3.6,
      h: 1.5,
      rectRadius: 0.1,
      fill: { color: "111C38" },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slide.addText(p.title, {
      x: x + 0.15,
      y: 5.25,
      w: 3.3,
      h: 0.45,
      fontSize: 13,
      fontFace: "Arial",
      bold: true,
      color: C_CYAN,
      align: "center",
    });
    slide.addText(p.desc, {
      x: x + 0.15,
      y: 5.75,
      w: 3.3,
      h: 0.75,
      fontSize: 11,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
      align: "center",
    });
  });

  slide.addNotes(
    "Good morning/afternoon everyone. Welcome to our presentation of MediScan V3, an Evidence-Locked Personal Health Intelligence and Drug Safety Assistant.\n\n" +
    "Generative AI has captivated the medical field, but in clinical healthcare, AI hallucinations can lead to life-threatening decisions. Our guiding motto is: 'Evidence First. AI Second.' MediScan does not treat LLMs as authoritative clinical arbiters. Instead, we introduce a deterministic, cryptographically locked architecture where every biomarker is strictly bound to original report quotes and validated against printed laboratory intervals and official openFDA monographs."
  );
}

// ==========================================
// SLIDE 2: PROBLEM STATEMENT & MOTIVATION
// ==========================================
{
  const slide = pres.addSlide();
  addSlideHeader(
    slide,
    "Problem & Clinical Need",
    "The Health AI Dilemma: Why Generative AI Alone Is Dangerous",
    "Four critical failure points in consumer health tools that MediScan solves"
  );

  const problems = [
    {
      num: "01",
      title: "LLM Hallucinations & Fabrications",
      badge: "RISK: CLINICAL ERROR",
      badgeColor: C_ROSE,
      desc: "Standard AI models invent plausible-sounding values, misinterpret units, or alter decimal points. In healthcare, a decimal misplacement (e.g., Potassium 3.2 vs 5.2) can be fatal.",
    },
    {
      num: "02",
      title: "The 'Global Range' Fallacy",
      badge: "RISK: MISDIAGNOSIS",
      badgeColor: C_ROSE,
      desc: "Generic health apps evaluate biomarkers against textbook global averages. Real clinical labs use diverse calibration assays, age brackets, and equipment-specific reference intervals printed directly on the page.",
    },
    {
      num: "03",
      title: "Silent Drug-Drug Interactions (DDI)",
      badge: "RISK: TOXICITY",
      badgeColor: C_AMBER,
      desc: "Over 38% of consumers take concurrent Over-The-Counter (OTC) drugs with hidden duplications or severe contraindications (e.g., combining NSAIDs + blood thinners without realizing the gastrointestinal hemorrhage risk).",
    },
    {
      num: "04",
      title: "Severe PII & Privacy Breaches",
      badge: "RISK: DATA EXPOSURE",
      badgeColor: C_AMBER,
      desc: "Patients are routinely coerced into uploading full PDFs containing Names, Social Security/MRN numbers, and physician notes directly to unvetted cloud chat endpoints.",
    },
  ];

  problems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 5.9;
    const y = 2.0 + row * 2.45;

    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 5.7,
      h: 2.25,
      rectRadius: 0.12,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    // Number & Badge Row
    slide.addText(item.num, {
      x: x + 0.3,
      y: y + 0.2,
      w: 0.8,
      h: 0.4,
      fontSize: 20,
      fontFace: "Arial",
      bold: true,
      color: C_CYAN,
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 3.2,
      y: y + 0.2,
      w: 2.2,
      h: 0.32,
      rectRadius: 0.1,
      fill: { color: "2B1B26" },
      line: { color: item.badgeColor, width: 1 },
    });
    slide.addText(item.badge, {
      x: x + 3.2,
      y: y + 0.2,
      w: 2.2,
      h: 0.32,
      fontSize: 9,
      fontFace: "Arial",
      bold: true,
      color: item.badgeColor,
      align: "center",
      valign: "middle",
    });

    // Title
    slide.addText(item.title, {
      x: x + 0.3,
      y: y + 0.65,
      w: 5.1,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });

    // Description
    slide.addText(item.desc, {
      x: x + 0.3,
      y: y + 1.1,
      w: 5.1,
      h: 1.0,
      fontSize: 11,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  slide.addNotes(
    "To understand why MediScan was engineered, let us look at the current medical AI landscape.\n\n" +
    "First: Traditional generative AI chatbots suffer from hallucinations. When a patient feeds a complex 4-page blood test into ChatGPT, the AI might misplace a decimal point or drop a negative sign.\n\n" +
    "Second: The 'Global Range Fallacy'. Every laboratory uses distinct testing machinery and calibrates its own reference intervals. An AI trained on general internet data uses generic ranges, flagging normal values as abnormal or missing dangerous outliers.\n\n" +
    "Third: Drug interactions are often invisible to patients taking common over-the-counter medications.\n\n" +
    "Fourth: Data privacy. Most apps require complete user accounts and upload entire medical records containing personal identification to cloud servers. MediScan was engineered to dismantle every one of these failure modes."
  );
}

// ==========================================
// SLIDE 3: SYSTEM ARCHITECTURE & DATA FLOW
// ==========================================
{
  const slide = pres.addSlide();
  addSlideHeader(
    slide,
    "System Architecture",
    "Full-Stack Pipeline: Deterministic Dual-Engine Verification",
    "Separation of AI extraction from code-level deterministic verification"
  );

  // Left Column: Architecture Box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.0,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.12,
    fill: { color: C_CARD },
    line: { color: C_CYAN, width: 1.5 },
  });

  slide.addText("ENGINEERING ARCHITECTURE", {
    x: 1.1,
    y: 2.2,
    w: 5.0,
    h: 0.35,
    fontSize: 13,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
  });

  const archBullets = [
    { head: "Frontend & SSR Runtime", body: "TanStack Start + React 19 + Nitro server engine on Vite 8." },
    { head: "Resilient AI Gateway", body: "Vercel AI SDK with Google Gemini 2.5 Flash + multi-model fallback queue." },
    { head: "State & Interaction", body: "Type-safe routing, Tailwind CSS v4 design tokens, Radix UI primitives." },
    { head: "Offline Guest & Auth", body: "Zero-barrier guest mode with optional Supabase OAuth & RLS storage." },
    { head: "Deterministic Gatekeeper", body: "Pure TypeScript verification engines; AI never sets abnormal flags." },
  ];

  archBullets.forEach((b, i) => {
    slide.addText(`• ${b.head}: `, {
      x: 1.1,
      y: 2.65 + i * 0.82,
      w: 5.0,
      h: 0.35,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });
    slide.addText(b.body, {
      x: 1.3,
      y: 2.95 + i * 0.82,
      w: 4.8,
      h: 0.5,
      fontSize: 10.5,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  // Right Column: Step by Step Flow
  const steps = [
    { step: "STAGE 1: INPUT ACQUISITION", desc: "PDF Text-Layer Extraction (pdfjs-dist) or Packaging Photo OCR with magic-byte validation." },
    { step: "STAGE 2: EXTRACTION & QUOTE LOCKING", desc: "Gemini extracts structured candidate tuples; engine verifies exact verbatim substring quotes." },
    { step: "STAGE 3: DETERMINISTIC EVALUATION", desc: "Report Lens computes range bounds; Medicine Lens normalizes aliases & cross-checks openFDA." },
    { step: "STAGE 4: SEALING & EXPORT", desc: "Zero-PII FNV-1a verification ID generated. Clinical brief exported to Markdown, CSV, or JSON." },
  ];

  steps.forEach((s, idx) => {
    const y = 2.0 + idx * 1.2;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y,
      w: 5.7,
      h: 1.05,
      rectRadius: 0.1,
      fill: { color: "132240" },
      line: { color: C_ACCENT, width: 1 },
    });
    slide.addText(s.step, {
      x: 7.0,
      y: y + 0.12,
      w: 5.3,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: C_ACCENT_LIGHT,
    });
    slide.addText(s.desc, {
      x: 7.0,
      y: y + 0.42,
      w: 5.3,
      h: 0.55,
      fontSize: 10,
      fontFace: "Arial",
      color: C_TEXT_MAIN,
    });
  });

  slide.addNotes(
    "Here we present the end-to-end architecture of MediScan V3. What makes this architecture unique is the strict firewall between the AI layer and the clinical determination layer.\n\n" +
    "The application is built on modern full-stack SSR using TanStack Start and Nitro with React 19. When a user provides a medical lab report or medication photo, the text is extracted locally using text-layer parsing.\n\n" +
    "Next, Gemini 2.5 Flash is invoked through the Vercel AI SDK. But here is the critical distinction: the AI is only permitted to extract candidate rows and exact quote substrings. The model does NOT classify whether a biomarker is high or low. That is handled deterministically by our pure TypeScript verification engine, which matches the printed reference bounds and seals the output with an FNV-1a cryptographic hash."
  );
}

// ==========================================
// SLIDE 4: MODULE 1: REPORT LENS
// ==========================================
{
  const slide = pres.addSlide();
  addSlideHeader(
    slide,
    "Module Deep-Dive 1",
    "Report Lens: Evidence-Locked Laboratory Biomarker Extraction",
    "How MediScan guarantees 0% hallucination on patient lab reports"
  );

  // Left Box: 3 Core Technologies
  const reportFeatures = [
    {
      title: "Character-Level Quote Locking",
      desc: "Every biomarker value, unit, and range is mapped to an exact verbatim character substring in the patient's original report. If a quote cannot be verified in the source text, it is instantly tagged UNVERIFIED.",
    },
    {
      title: "Deterministic Range Comparison",
      desc: "Our engine parses arbitrary clinical range formats (e.g., '13.5 - 17.5', '< 100', '>= 60', 'Negative') and deterministically classifies patient values into LOW, NORMAL, HIGH, or CRITICAL.",
    },
    {
      title: "Plain vs. Technical Dual Mode",
      desc: "Instant real-time toggle across screens. Patients view plain-English summaries and guided doctor questions; clinicians view raw intervals, exact units, and verification offsets.",
    },
  ];

  reportFeatures.forEach((f, idx) => {
    const y = 2.0 + idx * 1.55;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y,
      w: 5.6,
      h: 1.4,
      rectRadius: 0.1,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slide.addText(f.title, {
      x: 1.0,
      y: y + 0.15,
      w: 5.2,
      h: 0.35,
      fontSize: 13,
      fontFace: "Arial",
      bold: true,
      color: C_CYAN,
    });
    slide.addText(f.desc, {
      x: 1.0,
      y: y + 0.5,
      w: 5.2,
      h: 0.8,
      fontSize: 10.5,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  // Right Box: Visual Findings Table Mockup
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 2.0,
    w: 5.7,
    h: 4.65,
    rectRadius: 0.12,
    fill: { color: "111C38" },
    line: { color: C_ACCENT, width: 1.5 },
  });

  slide.addText("LIVE DETERMINISTIC FINDINGS ENGINE", {
    x: 7.1,
    y: 2.2,
    w: 5.1,
    h: 0.3,
    fontSize: 12,
    fontFace: "Arial",
    bold: true,
    color: C_ACCENT_LIGHT,
  });

  // Table Header
  const headers = [
    { text: "BIOMARKER", x: 7.1, w: 1.6 },
    { text: "VALUE", x: 8.7, w: 0.9 },
    { text: "REF RANGE", x: 9.6, w: 1.3 },
    { text: "STATUS", x: 10.9, w: 1.4 },
  ];
  headers.forEach((h) => {
    slide.addText(h.text, {
      x: h.x,
      y: 2.65,
      w: h.w,
      h: 0.25,
      fontSize: 9,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MUTED,
    });
  });

  // Sample Rows
  const sampleRows = [
    { name: "Hemoglobin", val: "10.2 g/dL", ref: "13.5 - 17.5", status: "LOW", color: C_ROSE, quote: "\"Hemoglobin: 10.2 g/dL\"" },
    { name: "Platelet Count", val: "90 10^3/uL", ref: "150 - 450", status: "LOW", color: C_ROSE, quote: "\"Platelet Count 90\"" },
    { name: "Fasting Glucose", val: "94 mg/dL", ref: "70 - 99", status: "NORMAL", color: C_EMERALD, quote: "\"Glucose, Fasting: 94\"" },
    { name: "Total Cholesterol", val: "228 mg/dL", ref: "< 200", status: "HIGH", color: C_AMBER, quote: "\"Total Cholesterol 228\"" },
  ];

  sampleRows.forEach((r, idx) => {
    const y = 3.0 + idx * 0.9;
    slide.addShape(pres.ShapeType.rect, {
      x: 7.0,
      y,
      w: 5.3,
      h: 0.8,
      fill: { color: "182647" },
      line: { color: "283A64", width: 1 },
    });
    slide.addText(r.name, { x: 7.1, y: y + 0.08, w: 1.6, h: 0.3, fontSize: 11, fontFace: "Arial", bold: true, color: C_TEXT_MAIN });
    slide.addText(r.val, { x: 8.7, y: y + 0.08, w: 0.9, h: 0.3, fontSize: 10.5, fontFace: "Arial", color: C_TEXT_MAIN });
    slide.addText(r.ref, { x: 9.6, y: y + 0.08, w: 1.3, h: 0.3, fontSize: 10, fontFace: "Arial", color: C_TEXT_MUTED });
    
    // Status Badge
    slide.addShape(pres.ShapeType.roundRect, {
      x: 11.0,
      y: y + 0.08,
      w: 1.1,
      h: 0.28,
      rectRadius: 0.1,
      fill: { color: "2B1B26" },
      line: { color: r.color, width: 1 },
    });
    slide.addText(r.status, { x: 11.0, y: y + 0.08, w: 1.1, h: 0.28, fontSize: 9, fontFace: "Arial", bold: true, color: r.color, align: "center", valign: "middle" });

    // Quote preview
    slide.addText(`Locked Quote: ${r.quote} ✓`, {
      x: 7.1,
      y: y + 0.42,
      w: 5.1,
      h: 0.25,
      fontSize: 8.5,
      fontFace: "Arial",
      color: C_CYAN,
    });
  });

  slide.addNotes(
    "Let us dive into Module 1: The Report Lens. This is where laboratory reports are analyzed with clinical rigor.\n\n" +
    "Notice the table on the right: when MediScan processes a Complete Blood Count report, it extracts parameters like Hemoglobin and Platelet Count. But notice line below each row: 'Locked Quote'. Every extracted row must match the exact character sequence in the source document.\n\n" +
    "Furthermore, the status 'LOW' or 'HIGH' is computed entirely by our TypeScript engine using the printed reference range on that exact laboratory paper—not a generic database range. If the user clicks any row, the UI jumps directly to the highlighted source text in our Evidence Modal."
  );
}

// ==========================================
// SLIDE 5: MODULE 2: MEDICINE LENS & DDI
// ==========================================
{
  const slide = pres.addSlide();
  addSlideHeader(
    slide,
    "Module Deep-Dive 2",
    "Medicine Lens & Symmetrical Drug-Drug Interaction Matrix",
    "Packaging OCR, openFDA monograph mapping, and commutative safety checks"
  );

  // 3 Feature Cards
  const medFeatures = [
    {
      title: "1. Packaging Active Ingredient OCR",
      tag: "openFDA Grounded",
      desc: "Extracts chemical drug names and concentrations directly from photos of blister packs and boxes. Eliminates dangerous brand confusion by resolving aliases (e.g., Tylenol -> Acetaminophen, Advil -> Ibuprofen).",
    },
    {
      title: "2. Symmetrical Interaction Matrix",
      tag: "makePairKey(A, B) = makePairKey(B, A)",
      desc: "Drug interaction evaluation is mathematically commutative. The system guarantees that checking Drug A + Drug B produces the exact same clinical warning as Drug B + Drug A without duplicate or missing edges.",
    },
    {
      title: "3. Neutral Non-Reassurance",
      tag: "Clinical Safety Principle",
      desc: "'Absence of evidence is not evidence of absence.' If two medications have no recorded interaction in the FDA monograph matrix, MediScan issues a neutral cautionary notice rather than a false safe reassurance.",
    },
  ];

  medFeatures.forEach((m, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.0,
      w: 3.7,
      h: 2.2,
      rectRadius: 0.12,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1 },
    });
    slide.addText(m.title, {
      x: x + 0.2,
      y: 2.15,
      w: 3.3,
      h: 0.45,
      fontSize: 12.5,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.2,
      y: 2.65,
      w: 3.3,
      h: 0.28,
      rectRadius: 0.08,
      fill: { color: "132E48" },
      line: { color: C_CYAN, width: 1 },
    });
    slide.addText(m.tag, {
      x: x + 0.2,
      y: 2.65,
      w: 3.3,
      h: 0.28,
      fontSize: 8.5,
      fontFace: "Arial",
      bold: true,
      color: C_CYAN,
      align: "center",
      valign: "middle",
    });
    slide.addText(m.desc, {
      x: x + 0.2,
      y: 3.05,
      w: 3.3,
      h: 1.0,
      fontSize: 10,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  // Bottom Interaction Tier Showcase
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 4.45,
    w: 11.7,
    h: 2.2,
    rectRadius: 0.12,
    fill: { color: "111C38" },
    line: { color: C_ACCENT, width: 1 },
  });

  slide.addText("VALIDATED CLINICAL SEVERITY TIERS & BIOLOGICAL MECHANISMS", {
    x: 1.1,
    y: 4.6,
    w: 10.5,
    h: 0.3,
    fontSize: 11.5,
    fontFace: "Arial",
    bold: true,
    color: C_ACCENT_LIGHT,
  });

  const tiers = [
    {
      level: "MAJOR RISK",
      pair: "Aspirin + Ibuprofen",
      mech: "Additive COX-1 inhibition exponentially spikes gastrointestinal bleeding & ulcer risk.",
      color: C_ROSE,
      box: "2D141E",
    },
    {
      level: "MODERATE RISK",
      pair: "Paracetamol + Alcohol/Cold Combos",
      mech: "Cumulative hepatotoxic load from hidden acetaminophen in multi-symptom cold syrups.",
      color: C_AMBER,
      box: "2D2214",
    },
    {
      level: "UNKNOWN / UNRECORDED",
      pair: "Novel OTC + Dietary Supplements",
      mech: "System triggers explicit warning: 'Not verified safe. Always consult your pharmacist.'",
      color: C_CYAN,
      box: "132E48",
    },
  ];

  tiers.forEach((t, i) => {
    const x = 1.1 + i * 3.8;
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 4.95,
      w: 3.55,
      h: 1.5,
      rectRadius: 0.08,
      fill: { color: t.box },
      line: { color: t.color, width: 1 },
    });
    slide.addText(t.level, {
      x: x + 0.15,
      y: 5.05,
      w: 3.25,
      h: 0.25,
      fontSize: 10,
      fontFace: "Arial",
      bold: true,
      color: t.color,
    });
    slide.addText(t.pair, {
      x: x + 0.15,
      y: 5.3,
      w: 3.25,
      h: 0.25,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });
    slide.addText(t.mech, {
      x: x + 0.15,
      y: 5.6,
      w: 3.25,
      h: 0.75,
      fontSize: 9.5,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  slide.addNotes(
    "Module 2 is our Medicine Lens and Drug-Drug Interaction Checker.\n\n" +
    "When patients take medications, they frequently know only brand names like Tylenol or Advil, without realizing both could belong to overlapping drug classes. MediScan uses OCR and alias normalization to map brand names to official openFDA OTC monographs.\n\n" +
    "A key technical innovation here is our Symmetrical Pair Key algorithm: makePairKey. In computer science, if a user checks Drug A with Drug B, the system must evaluate the exact same interaction rules as Drug B with Drug A. Furthermore, we follow the medical ethics principle of 'Neutral Non-Reassurance': if an interaction is unrecorded, we never claim the combination is harmless. Instead, we warn the user that absence of data is not evidence of safety."
  );
}

// ==========================================
// SLIDE 6: SECURITY & DOCTOR BRIEF EXPORT
// ==========================================
{
  const slide = pres.addSlide();
  addSlideHeader(
    slide,
    "Privacy & Clinical Export",
    "Zero-PII Verification ID & Physician-Ready Visit Brief",
    "Cryptographic tamper detection and actionable clinical consultations"
  );

  // Left Card: Zero PII & Verification Lab
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.0,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.12,
    fill: { color: C_CARD },
    line: { color: C_CYAN, width: 1 },
  });

  slide.addText("CRYPTOGRAPHIC INTEGRITY & VERIFICATION LAB", {
    x: 1.1,
    y: 2.2,
    w: 5.0,
    h: 0.35,
    fontSize: 12,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
  });

  const secPoints = [
    {
      title: "Deterministic Verification ID (MS-XXXXXXXX)",
      desc: "Derived via FNV-1a 32-bit hashing over finding counts, report category, and timestamp. Never hashes or stores patient names, emails, or MRNs.",
    },
    {
      title: "Canonical Evidence Fingerprinting",
      desc: "Computes a canonical string hash: 'testName|valueText|status|quote'. Ensures end-to-end immutability from OCR to final render.",
    },
    {
      title: "Interactive Tamper Detection Lab",
      desc: "Built-in live auditor screen: simulates intentional text edits (e.g., changing 10.2 to 14.0). Shows how cryptographic seals immediately fail verification.",
    },
    {
      title: "Zero Memory Footprint & Guest Mode",
      desc: "Ephemeral in-memory processing. Full functionality accessible offline with zero account creation required.",
    },
  ];

  secPoints.forEach((p, idx) => {
    const y = 2.65 + idx * 1.0;
    slide.addText(`• ${p.title}`, {
      x: 1.1,
      y,
      w: 5.0,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });
    slide.addText(p.desc, {
      x: 1.3,
      y: y + 0.28,
      w: 4.8,
      h: 0.65,
      fontSize: 10,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  // Right Card: Doctor Brief & Multi-Format Export
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 2.0,
    w: 5.7,
    h: 4.8,
    rectRadius: 0.12,
    fill: { color: "111C38" },
    line: { color: C_ACCENT, width: 1 },
  });

  slide.addText("PHYSICIAN-READY DOCTOR VISIT BRIEF", {
    x: 7.1,
    y: 2.2,
    w: 5.1,
    h: 0.35,
    fontSize: 12,
    fontFace: "Arial",
    bold: true,
    color: C_ACCENT_LIGHT,
  });

  slide.addText("Empowering patients to have high-efficiency, targeted discussions with their healthcare providers without overwhelming clinical jargon.", {
    x: 7.1,
    y: 2.6,
    w: 5.1,
    h: 0.6,
    fontSize: 10.5,
    fontFace: "Arial",
    color: C_TEXT_MUTED,
  });

  // 3 Clinical Brief Pillars
  const briefPillars = [
    { icon: "📋", title: "Flagged Biomarker Digest", desc: "Isolates out-of-range findings with laboratory reference context." },
    { icon: "💊", title: "Active Medication Snapshot", desc: "Lists all detected OTC active ingredients and interaction flags." },
    { icon: "❓", title: "Curated Doctor Questions", desc: "Generates tailored questions for the patient to ask their physician." },
  ];

  briefPillars.forEach((bp, i) => {
    const y = 3.3 + i * 0.8;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.1,
      y,
      w: 5.1,
      h: 0.7,
      rectRadius: 0.08,
      fill: { color: "192749" },
      line: { color: "2A3D6B", width: 1 },
    });
    slide.addText(`${bp.icon} ${bp.title}`, {
      x: 7.25,
      y: y + 0.08,
      w: 4.8,
      h: 0.28,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });
    slide.addText(bp.desc, {
      x: 7.5,
      y: y + 0.34,
      w: 4.5,
      h: 0.3,
      fontSize: 9.5,
      fontFace: "Arial",
      color: C_CYAN,
    });
  });

  // Export Formats Box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 7.1,
    y: 5.85,
    w: 5.1,
    h: 0.75,
    rectRadius: 0.08,
    fill: { color: "132E48" },
    line: { color: C_CYAN, width: 1 },
  });
  slide.addText("MULTI-FORMAT EXPORT ENGINE:", {
    x: 7.25,
    y: 5.92,
    w: 4.8,
    h: 0.25,
    fontSize: 9.5,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
  });
  slide.addText("• Markdown (.md) for personal notes  • CSV (.csv) for EMRs  • JSON payload for EHR APIs", {
    x: 7.25,
    y: 6.18,
    w: 4.8,
    h: 0.35,
    fontSize: 9,
    fontFace: "Arial",
    color: C_TEXT_MAIN,
  });

  slide.addNotes(
    "Security and patient empowerment are fundamental to MediScan.\n\n" +
    "Most medical applications risk violating HIPAA or GDPR by storing patient names alongside diagnosis text. In MediScan, all verification identifiers are computed with non-sensitive FNV-1a hashing. We even built an interactive Tamper Detection Lab that proves that altering a single character in the lab report causes the cryptographic fingerprint to fail.\n\n" +
    "Finally, we don't just leave patients with raw numbers. Our Doctor Visit Brief compiles all abnormal biomarkers and active medications into an exportable, one-page clinical briefing—complete with recommended questions for the patient's next appointment. It exports instantly in Markdown, CSV, and structured JSON."
  );
}

// ==========================================
// SLIDE 7: TESTING, QUALITY & EVALUATION
// ==========================================
{
  const slide = pres.addSlide();
  addSlideHeader(
    slide,
    "Quality & Validation",
    "Rigorous Automated Testing & Verification Metrics",
    "100% automated test coverage validating safety, quote integrity, and zero regressions"
  );

  // 4 Top Metric Badges
  const metrics = [
    { label: "TEST SUITES", val: "19 / 19", sub: "100% Passing", color: C_EMERALD },
    { label: "AUTOMATED TESTS", val: "201 Tests", sub: "Vitest Fast Execution", color: C_CYAN },
    { label: "TYPESCRIPT ERRORS", val: "0 Errors", sub: "Strict Type Safety", color: C_EMERALD },
    { label: "EVIDENCE LOCK RATE", val: "100%", sub: "Verbatim Quote Match", color: C_CYAN },
  ];

  metrics.forEach((m, idx) => {
    const x = 0.8 + idx * 2.95;
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.0,
      w: 2.8,
      h: 1.35,
      rectRadius: 0.1,
      fill: { color: C_CARD },
      line: { color: m.color, width: 1.5 },
    });
    slide.addText(m.label, {
      x: x + 0.1,
      y: 2.1,
      w: 2.6,
      h: 0.25,
      fontSize: 9,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MUTED,
      align: "center",
    });
    slide.addText(m.val, {
      x: x + 0.1,
      y: 2.35,
      w: 2.6,
      h: 0.5,
      fontSize: 22,
      fontFace: "Arial",
      bold: true,
      color: m.color,
      align: "center",
    });
    slide.addText(m.sub, {
      x: x + 0.1,
      y: 2.9,
      w: 2.6,
      h: 0.3,
      fontSize: 9.5,
      fontFace: "Arial",
      color: C_TEXT_MAIN,
      align: "center",
    });
  });

  // Bottom Table: Key Test Suites Breakdowns
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 3.55,
    w: 11.7,
    h: 3.25,
    rectRadius: 0.12,
    fill: { color: "111C38" },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText("KEY AUTOMATED VERIFICATION SUITES (VITEST)", {
    x: 1.1,
    y: 3.75,
    w: 10.5,
    h: 0.3,
    fontSize: 12,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
  });

  const testSuites = [
    {
      file: "tests/report/engine.test.ts",
      count: "69 tests",
      focus: "Biomarker parsing, decimal boundary calculations, reference range normalization (HIGH/LOW/NORMAL/CRITICAL).",
    },
    {
      file: "tests/report/evidence.test.ts",
      count: "12 tests",
      focus: "Substring character offset locking, quote tamper detection, and unverified finding rejection.",
    },
    {
      file: "tests/medicine/interactions.test.ts",
      count: "15 tests",
      focus: "Symmetrical pair hashing makePairKey(A,B), alias resolution (Tylenol -> paracetamol), severity categorization.",
    },
    {
      file: "tests/report/summaryExport.test.ts",
      count: "4 tests",
      focus: "Deterministic Doctor Brief generation, Markdown formatting, CSV tabular correctness, JSON cryptographic payload.",
    },
    {
      file: "tests/shared/model.server.test.ts",
      count: "8 tests",
      focus: "Gemini multi-model fallback execution, automatic failover when primary models hit quota limits.",
    },
  ];

  testSuites.forEach((ts, idx) => {
    const y = 4.15 + idx * 0.5;
    slide.addText(ts.file, {
      x: 1.1,
      y,
      w: 3.2,
      h: 0.4,
      fontSize: 10,
      fontFace: "Courier New",
      bold: true,
      color: C_ACCENT_LIGHT,
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 4.4,
      y: y + 0.02,
      w: 1.1,
      h: 0.28,
      rectRadius: 0.08,
      fill: { color: "132E48" },
      line: { color: C_CYAN, width: 1 },
    });
    slide.addText(ts.count, {
      x: 4.4,
      y: y + 0.02,
      w: 1.1,
      h: 0.28,
      fontSize: 8.5,
      fontFace: "Arial",
      bold: true,
      color: C_CYAN,
      align: "center",
      valign: "middle",
    });
    slide.addText(ts.focus, {
      x: 5.65,
      y,
      w: 6.6,
      h: 0.4,
      fontSize: 9.5,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  slide.addNotes(
    "In software engineering—especially in healthcare technology—untested code is broken code.\n\n" +
    "We subjected MediScan to 19 dedicated test suites spanning 201 automated unit and integration tests. All 201 tests pass with a 100% success rate.\n\n" +
    "These tests explicitly verify our core guarantees: engine.test.ts runs 69 test cases evaluating every numerical edge case in lab reference ranges. evidence.test.ts validates that any missing or modified quote fails verification. interactions.test.ts guarantees commutative interaction matching. And model.server.test.ts ensures that if Google Gemini 2.5 Flash faces rate limits, the system seamlessly falls back to backup models without crashing."
  );
}

// ==========================================
// SLIDE 8: CONCLUSION & FUTURE HORIZONS
// ==========================================
{
  const slide = pres.addSlide();
  addSlideHeader(
    slide,
    "Summary & Next Steps",
    "Conclusion, Clinical Impact & Future Horizon",
    "Transforming healthcare data from intimidating paperwork into verified personal intelligence"
  );

  // Left Column: Key Achievements
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.0,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.12,
    fill: { color: C_CARD },
    line: { color: C_ACCENT, width: 1.5 },
  });

  slide.addText("CORE PROJECT CONTRIBUTIONS", {
    x: 1.1,
    y: 2.2,
    w: 5.0,
    h: 0.35,
    fontSize: 13,
    fontFace: "Arial",
    bold: true,
    color: C_ACCENT_LIGHT,
  });

  const accomplishments = [
    { title: "Deterministic Safety Protocol", desc: "Pioneered 'Evidence First, AI Second' — anchoring probabilistic LLM extractions to verbatim textual proof." },
    { title: "Lab-Specific Range Grounding", desc: "Overcame the generic reference range trap by calculating abnormalities strictly from the printed report boundaries." },
    { title: "Authoritative Medication Safety", desc: "Cross-referenced active drug ingredients with official openFDA monographs and commutative pair checks." },
    { title: "Privacy By Architecture", desc: "Eliminated PII exposure through non-sensitive FNV-1a hashing and zero-obligation offline guest mode." },
  ];

  accomplishments.forEach((a, i) => {
    slide.addText(`✔ ${a.title}`, {
      x: 1.1,
      y: 2.65 + i * 1.0,
      w: 5.0,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });
    slide.addText(a.desc, {
      x: 1.4,
      y: 2.95 + i * 1.0,
      w: 4.7,
      h: 0.65,
      fontSize: 10,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  // Right Column: Future Roadmap
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 2.0,
    w: 5.7,
    h: 3.5,
    rectRadius: 0.12,
    fill: { color: "111C38" },
    line: { color: C_CYAN, width: 1 },
  });

  slide.addText("FUTURE SCOPE & CLINICAL HORIZONS", {
    x: 7.1,
    y: 2.2,
    w: 5.1,
    h: 0.35,
    fontSize: 13,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
  });

  const roadmap = [
    { phase: "HL7 / FHIR Integration", desc: "Direct bidirectional synchronization with hospital Electronic Health Records (EHR)." },
    { phase: "Global Pharmacopeia Databases", desc: "Expanding beyond openFDA to EMA (Europe), CDSCO (India), and WHO drug databases." },
    { phase: "Edge On-Device Inference", desc: "Local WebAssembly OCR and small language models for 100% private, offline client-side evaluation." },
  ];

  roadmap.forEach((r, idx) => {
    const y = 2.65 + idx * 0.85;
    slide.addText(`🚀 ${r.phase}`, {
      x: 7.1,
      y,
      w: 5.1,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: C_TEXT_MAIN,
    });
    slide.addText(r.desc, {
      x: 7.4,
      y: y + 0.28,
      w: 4.8,
      h: 0.5,
      fontSize: 10,
      fontFace: "Arial",
      color: C_TEXT_MUTED,
    });
  });

  // Concluding Banner
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 5.65,
    w: 5.7,
    h: 1.15,
    rectRadius: 0.12,
    fill: { color: "132E48" },
    line: { color: C_ACCENT_LIGHT, width: 1.5 },
  });
  slide.addText("\"MediScan: Making AI Accountable to the Medical Truth.\"", {
    x: 7.0,
    y: 5.75,
    w: 5.3,
    h: 0.45,
    fontSize: 13,
    fontFace: "Arial",
    bold: true,
    color: C_CYAN,
    align: "center",
  });
  slide.addText("Thank you! Open for Questions & Demonstration.", {
    x: 7.0,
    y: 6.25,
    w: 5.3,
    h: 0.4,
    fontSize: 11,
    fontFace: "Arial",
    color: C_TEXT_MAIN,
    align: "center",
  });

  slide.addNotes(
    "In conclusion, MediScan V3 proves that we do not have to accept AI hallucinations as an unavoidable cost of modern software.\n\n" +
    "By establishing the 'Evidence First, AI Second' framework, we empower everyday patients to understand their lab results and medicine packaging with the confidence that every word is grounded in printed fact and authoritative FDA guidelines.\n\n" +
    "Looking forward, we aim to integrate direct FHIR interoperability for hospital records and bring complete local-edge processing to mobile devices. Thank you very much for your time. We are now delighted to answer your questions and demonstrate the live system!"
  );
}

// Generate the PPTX file
const outputPath = "MEDISCAN_FINAL_PRESENTATION.pptx";
pres.writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`✅ Presentation successfully created: ${fileName}`);
  })
  .catch((err) => {
    console.error("❌ Failed to generate presentation:", err);
    process.exit(1);
  });
