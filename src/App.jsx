
import { useState, useEffect, useRef } from "react";

// ── SEED DATA ──────────────────────────────────────────────────────────────────
const SEED = [
  {
    id: "p1", name: "Re-Exam Automation System", type: "ai", status: "build",
    priority: "high", progress: 35, addedBy: "Ella", dueDate: "2026-03-28",
    goal: "Replace editable PDF re-exam process with a digital multi-step flow: patient questionnaire → CA review mirror → first exam data + current state form → auto-generated PDF report.",
    nextActions: [
      { text: "Build patient questionnaire page (based on existing PDF)", done: false },
      { text: "Build CA review mirror — shows patient answers, CA submits (not patient)", done: false },
      { text: "Add 5-star redirect logic → Google MBP review link", done: false },
      { text: "Build page 3: GHL first-exam data left / current state form right", done: false },
      { text: "PDF generation on final submit", done: false },
      { text: "Send draft to Dr. Dave + Averi for review", done: false },
      { text: "Test pilot with Arlington (Averi is test contact)", done: false },
    ],
    blocker: "", notes: "Averi aligned on flow. Arlington: posture scan only. RE exam = progress exam + X-rays. CA runs everything start to finish. 15-min blocks.",
    kpi: "Retention / Progress exam compliance", createdAt: "2026-03-01"
  },
  {
    id: "p2", name: "Treatment Plan Downstream Automations", type: "ghl", status: "build",
    priority: "high", progress: 20, addedBy: "Ella", dueDate: "2026-04-15",
    goal: "Compliance and education workflows for all treatment plan add-ons: spinal orthotics, corrective exercises, foot orthotics, supplements, PMF therapy.",
    nextActions: [
      { text: "Break spinal orthotic into 3 GHL options: cervical / thoracic / lumbar ($40 each)", done: false },
      { text: "Deploy orthotic workflows to ALL sub-accounts (currently only Loveland + Arlington)", done: false },
      { text: "Audit trigger links — flag videos still branded Gateway Family Chiro", done: false },
      { text: "Build corrective exercise workflow: doc follow-up 1 week after plan signed", done: false },
      { text: "Build foot orthotic break-in period email + monthly check-in", done: false },
      { text: "Build supplement workflows per product (dosing, timing, reorder nudge)", done: false },
      { text: "Design tag kill-switch logic: prescribed tag → add / refund tag → remove", done: false },
    ],
    blocker: "Need foot orthotic break-in period details from Miranda. Email vs SMS channel decision pending.",
    notes: "Rule agreed: explanatory info = email. Short reminders = SMS. Cancel care tag must be set manually in GHL until Genesis integration exists.",
    kpi: "Revenue per patient / Compliance", createdAt: "2026-03-01"
  },
  {
    id: "p3", name: "PI Automation Revamp", type: "ghl", status: "planned",
    priority: "medium", progress: 5, addedBy: "Ella", dueDate: "2026-05-01",
    goal: "Digitize full PI intake: insurance form, lien, assignment of benefits via GHL contracts. Add 30-day lien filing reminder (Colorado requirement).",
    nextActions: [
      { text: "Wait for Sky: digital signature OK for lien + AOB?", done: false },
      { text: "Get scanned insurance form from Shari", done: false },
      { text: "Audit current PI calendar + existing automations", done: false },
      { text: "Rebuild PI reminder sequence", done: false },
      { text: "If digital sig approved: combine 3 forms into 1 GHL contract flow", done: false },
      { text: "Build internal lien filing reminder task (before 30-day deadline)", done: false },
    ],
    blocker: "WAITING: Sky must confirm digital vs wet signature for lien + AOB. Do not build until confirmed.",
    notes: "Shari meeting complete. PI paperwork currently through Genesis only. Build with Chirocat migration in mind.",
    kpi: "PI conversion / Compliance", createdAt: "2026-03-01"
  },
  {
    id: "p4", name: "GHL Snapshot Cleanup & Scale Architecture", type: "ghl", status: "active",
    priority: "high", progress: 70, addedBy: "Ella", dueDate: "2026-03-20",
    goal: "Clean, standardized, deployment-ready sub-accounts. Hub + Satellite model. Divestiture-safe for 20–30 clinic scale.",
    nextActions: [
      { text: "Finalize Hub snapshot export", done: false },
      { text: "Complete Satellite snapshot per location", done: false },
      { text: "Remove test triggers, temp webhooks, duplicate flows", done: false },
      { text: "Document snapshot version in change log", done: false },
    ],
    blocker: "", notes: "30-day audit complete. Naming conventions standardized. Day 1 + Day 2 reminders rebuilt. Appointment origin tracking live.",
    kpi: "Scalability / Snapshot readiness", createdAt: "2026-02-01"
  },
  {
    id: "p5", name: "Reactivation Engine", type: "ghl", status: "active",
    priority: "high", progress: 30, addedBy: "Dr. Dave", dueDate: "2026-04-30",
    goal: "Automate reactivation across 90-day, 6-month, 12-month+ inactive segments. Target: 3–5% monthly return rate.",
    nextActions: [
      { text: "Complete TrackStat training with Angel (birthday campaigns)", done: false },
      { text: "Import full EHR databases per location into GHL", done: false },
      { text: "Build 90-day inactive sequence (warm → scarcity → personal touch)", done: false },
      { text: "Build 6-month + 12-month sequences", done: false },
      { text: "Coordinate Miranda + Sherry call re: re-engagement workflow design", done: false },
    ],
    blocker: "EHR database import not done — flows can't go live until patient data is in GHL.",
    notes: "Birthday campaigns currently manual in TrackStat. Miranda tracks reactivations manually today.",
    kpi: "Reactivation rate (target 3–5%/month)", createdAt: "2026-02-01"
  },
  {
    id: "p6", name: "Day 2 ROF Kiosk + AI Coaching", type: "ai", status: "build",
    priority: "high", progress: 45, addedBy: "Ella", dueDate: "2026-04-01",
    goal: "GHL-driven Day 2 Report of Findings kiosk. AI listens and generates doctor performance reports. Treatment plan page built.",
    nextActions: [
      { text: "Finalize treatment plan page (custom code + GHL hybrid)", done: true },
      { text: "Re-exam form and automation foundation", done: true },
      { text: "Test webhook integrations across all locations", done: false },
      { text: "Build AI coaching output → performance report to doctor", done: false },
      { text: "Killer Switch automation for cancel/refund suppression", done: true },
    ],
    blocker: "", notes: "Treatment plan page complete. 180+ supplement custom fields mapped. Killer Switch live.",
    kpi: "Show rate / Revenue per patient", createdAt: "2026-02-15"
  },
  {
    id: "p7", name: "Review Generation Automation", type: "ghl", status: "review",
    priority: "medium", progress: 60, addedBy: "Ella", dueDate: "2026-03-25",
    goal: "Automate Google review requests at ROF, 10th visit, graduation. Internal gate first — only 5-star → Google. Target: 10+ reviews/clinic/month.",
    nextActions: [
      { text: "Align with Angel: what does TrackStat already handle?", done: false },
      { text: "Build internal feedback form (1–5 stars)", done: false },
      { text: "Build 5-star → Google redirect branch", done: false },
      { text: "Tag contacts who reviewed + year for annual re-ask", done: false },
    ],
    blocker: "Need TrackStat audit call with Angel before building — avoid duplicate logic.",
    notes: "4-star and below → internal follow-up only. Tag reviewed contacts by year.",
    kpi: "Google reviews per clinic / Rating avg", createdAt: "2026-02-20"
  },
  {
    id: "p8", name: "AI Chatbot — Lead Capture & Scheduling", type: "ai", status: "planned",
    priority: "medium", progress: 0, addedBy: "Dr. Dave", dueDate: "2026-05-15",
    goal: "AI chatbot on WAC website. Answers FAQs, captures contact info, books appointments. Built inside GHL.",
    nextActions: [
      { text: "Train chatbot on office scripts + FAQs", done: false },
      { text: "Coordinate on website embed placement", done: false },
      { text: "Test lead capture → GHL pipeline entry", done: false },
    ],
    blocker: "", notes: "Quick win. Coordinate on website embed placement.",
    kpi: "Booking rate / Contact rate", createdAt: "2026-03-01"
  },
];

const BACKLOG_SEED = [
  { id: "b1", name: "GHL Product Store (Supplement Reorders)", type: "ghl", priority: "future", addedBy: "Ella", desc: "GHL-native store for supplement reorders. Blocked by supplement workflow build." },
  { id: "b2", name: "Corporate Marketing Nurture", type: "ghl", priority: "future", addedBy: "Dr. Dave", desc: "Stay top-of-mind with businesses where health talks were done. Rebook every 6–12 months." },
  { id: "b3", name: "Medical Provider Referral Pipeline", type: "ghl", priority: "future", addedBy: "Dr. Dave", desc: "MD/DO referral page, form, provider database, ongoing nurture. Business card scanning at events." },
  { id: "b4", name: "Day 1 AI QA Coaching System", type: "ai", priority: "future", addedBy: "Dr. Dave", desc: "AI listens to Day 1 visit, grades staff performance 0–100 across 6 categories. Produces employee report card + management summary." },
  { id: "b5", name: "SoftWave / Shockwave Therapy Launch", type: "ghl", priority: "future", addedBy: "Dr. Dave", desc: "Landing page + location scheduling + campaigns. After machine arrives + training complete." },
  { id: "b6", name: "Routing Forms Digitization", type: "ai", priority: "future", addedBy: "Averi", desc: "All CA routing forms go digital inside GHL. Checklist/digital flow. CA internal use only." },
  { id: "b7", name: "Functional Medicine / Lifestyle Report Business", type: "ai", priority: "future", addedBy: "Dr. Dave", desc: "Separate telemedicine company. Patient uploads labs → AI evaluates → report → provider sign-off." },
  { id: "b8", name: "Patient-Facing Video Rebranding", type: "ops", priority: "future", addedBy: "Ella", desc: "All videos still branded Gateway Family Chiro. Day 1, Day 2, all orthotic instructional videos need rebranding." },
  { id: "b9", name: "Mattress Business Project", type: "other", priority: "future", addedBy: "Dr. Dave", desc: "Future business project. Details in PDF (review when prioritized)." },
  { id: "b10", name: "Long-Term Nurture Flows", type: "ghl", priority: "future", addedBy: "Dr. Dave", desc: "30-day lead nurture, 90-day drip, monthly newsletter, seasonal campaigns, event invites." },
];

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const STATUS_META = {
  active:  { label: "Live",       color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  build:   { label: "In Build",   color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  review:  { label: "In Review",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  blocked: { label: "Blocked",    color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  planned: { label: "Planned",    color: "#A855F7", bg: "rgba(168,85,247,0.1)" },
};

const PRIORITY_META = {
  high:   { label: "High",           color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  medium: { label: "Medium",         color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  low:    { label: "Low",            color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  future: { label: "Future Project", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
};

const TYPE_LABEL = { ghl: "⚙ GHL", ai: "🤖 AI Build", ops: "📋 Ops", other: "📦 Other" };

const TEAM = ["Ella", "Dr. Dave", "Dr. Mike", "Francio", "Sky", "Miranda", "Shari", "Averi", "Angel", "Other"];

// ── HELPERS ────────────────────────────────────────────────────────────────────
function uid() { return "p" + Date.now() + Math.random().toString(36).slice(2, 7); }

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
}

function daysUntil(dueDate) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  return diff;
}

// ── COMPONENTS ─────────────────────────────────────────────────────────────────

function Pill({ label, color, bg, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg, color,
      borderRadius: 99, padding: small ? "2px 8px" : "3px 10px",
      fontSize: small ? 10 : 11, fontWeight: 600,
      letterSpacing: "0.04em", fontFamily: "'DM Mono', monospace",
      whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function ProgressBar({ value, color = "#C5A25D" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "#2A2F3E", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "'DM Mono', monospace", minWidth: 28 }}>{value}%</span>
    </div>
  );
}

function Tag({ children }) {
  return <span style={{ background: "#1E2433", color: "#6B7280", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{children}</span>;
}

// ── ADD PROJECT MODAL ──────────────────────────────────────────────────────────
function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", type: "ghl", status: "planned", priority: "medium",
    addedBy: "Ella", addedByOther: "", dueDate: "", goal: "", blocker: "", notes: "",
    nextActions: "", kpi: ""
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function readPdf() {
    if (!pdfFile) return;
    setAiLoading(true);
    setAiDone(false);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Read failed"));
        r.readAsDataURL(pdfFile);
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              { type: "text", text: `Extract project info from this document and return ONLY valid JSON (no markdown, no backticks):
{
  "name": "concise project name",
  "goal": "one sentence goal",
  "notes": "key context, decisions, or background from the document",
  "nextActions": "first action\\nsecond action\\nthird action",
  "kpi": "main success metric"
}` }
            ]
          }]
        })
      });

      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setForm(f => ({
        ...f,
        name: parsed.name || f.name,
        goal: parsed.goal || f.goal,
        notes: parsed.notes || f.notes,
        nextActions: parsed.nextActions || f.nextActions,
        kpi: parsed.kpi || f.kpi,
      }));
      setAiDone(true);
    } catch (e) {
      alert("Could not parse PDF. Fill in manually.");
    }
    setAiLoading(false);
  }

  function handleSave() {
    if (!form.name.trim()) { alert("Project name required."); return; }
    const resolvedAddedBy = form.addedBy === "Other" ? (form.addedByOther.trim() || "Other") : form.addedBy;
    const tasks = form.nextActions.split("\n").filter(Boolean).map(t => ({ text: t.trim(), done: false }));
    onSave({
      id: uid(), ...form,
      addedBy: resolvedAddedBy,
      nextActions: tasks.length ? tasks : [{ text: "Define first steps", done: false }],
      progress: 0, createdAt: new Date().toISOString().slice(0, 10)
    });
    onClose();
  }

  const inputStyle = {
    width: "100%", background: "#1A1F2E", border: "1px solid #2A3147",
    borderRadius: 8, padding: "9px 12px", color: "#E2E8F0",
    fontSize: 13, fontFamily: "inherit", outline: "none",
    transition: "border-color 0.15s"
  };
  const labelStyle = { fontSize: 11, color: "#6B7280", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 16, width: "100%", maxWidth: 760, maxHeight: "90vh", overflowY: "auto", padding: 32 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#F1F5F9" }}>Add New Project</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>Select who's adding to see the right fields</div>
          </div>
          <button onClick={onClose} style={{ background: "#1F2937", border: "none", color: "#9CA3AF", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* ── ADDED BY — always first, drives what shows below ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Who's adding this?</label>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.addedBy} onChange={e => set("addedBy", e.target.value)}>
                {TEAM.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {form.addedBy === "Other" && (
                <input style={{ ...inputStyle, marginTop: 6 }} value={form.addedByOther}
                  onChange={e => set("addedByOther", e.target.value)} placeholder="Enter name…" autoFocus />
              )}
            </div>

          </div>
        </div>

        {/* ── FIELDS VISIBLE TO EVERYONE ── */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Project Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Orthotic Compliance Workflow" />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.goal}
            onChange={e => set("goal", e.target.value)} placeholder="What is this project? What does it accomplish?" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: ["Ella", "Dr. Dave"].includes(form.addedBy) ? 14 : 24 }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.priority} onChange={e => set("priority", e.target.value)}>
              {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" style={inputStyle} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
          </div>
        </div>

        {/* ── ELLA + DR. DAVE FULL ACCESS FIELDS ── */}
        {["Ella", "Dr. Dave"].includes(form.addedBy) && (
          <>
            {/* PDF Upload */}
            <div onClick={() => fileRef.current.click()} style={{
              border: `2px dashed ${pdfFile ? "#C5A25D" : "#2A3147"}`, borderRadius: 10,
              padding: "18px", textAlign: "center", cursor: "pointer",
              background: pdfFile ? "rgba(197,162,93,0.05)" : "#0D1117", marginBottom: 16, transition: "all 0.2s"
            }}>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
                onChange={e => { setPdfFile(e.target.files[0]); setAiDone(false); }} />
              <div style={{ fontSize: 20, marginBottom: 6 }}>📄</div>
              <div style={{ fontSize: 13, color: pdfFile ? "#C5A25D" : "#6B7280" }}>
                {pdfFile ? pdfFile.name : "Upload a PDF — AI will fill the details"}
              </div>
              {pdfFile && !aiDone && (
                <button onClick={e => { e.stopPropagation(); readPdf(); }} disabled={aiLoading}
                  style={{ marginTop: 10, background: "#C5A25D", color: "#000", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 13, cursor: aiLoading ? "wait" : "pointer", fontWeight: 600, opacity: aiLoading ? 0.7 : 1 }}>
                  {aiLoading ? "Reading PDF…" : "✨ Read with AI"}
                </button>
              )}
              {aiDone && <div style={{ marginTop: 8, color: "#22C55E", fontSize: 12 }}>✓ Form filled from PDF — review below</div>}
            </div>

            {/* Type + Status + KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.type} onChange={e => set("type", e.target.value)}>
                  {["ghl", "ai", "ops", "other"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.status} onChange={e => set("status", e.target.value)}>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>KPI / Success Metric</label>
                <input style={inputStyle} value={form.kpi} onChange={e => set("kpi", e.target.value)} placeholder="e.g. Booking rate" />
              </div>
            </div>

            {/* Next Actions */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Next Actions (one per line)</label>
              <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.nextActions}
                onChange={e => set("nextActions", e.target.value)}
                placeholder={"Build the form\nTest with Arlington\nSend to Dr. Dave for review"} />
            </div>

            {/* Blocker + Notes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
              <div>
                <label style={labelStyle}>Blocker (if any)</label>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.blocker}
                  onChange={e => set("blocker", e.target.value)} placeholder="What's blocking this?" />
              </div>
              <div>
                <label style={labelStyle}>Notes & Context</label>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.notes}
                  onChange={e => set("notes", e.target.value)} placeholder="Decisions, links, background info..." />
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={handleSave} style={{ background: "#C5A25D", color: "#000", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Save Project
          </button>
          <button onClick={onClose} style={{ background: "transparent", color: "#6B7280", border: "1px solid #2A3147", borderRadius: 8, padding: "11px 20px", fontSize: 14, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PROJECT CARD ───────────────────────────────────────────────────────────────
function ProjectCard({ project, onToggleTask, onUpdateProgress, onDelete, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_META[project.status] || STATUS_META.planned;
  const p = PRIORITY_META[project.priority] || PRIORITY_META.medium;
  const days = daysUntil(project.dueDate);
  const overdue = isOverdue(project.dueDate);
  const typeColor = project.type === "ghl" ? "#3B82F6" : project.type === "ai" ? "#A855F7" : "#6B7280";

  return (
    <div style={{
      background: "#111827", border: `1px solid ${expanded ? "#2A3147" : "#1F2937"}`,
      borderRadius: 12, overflow: "hidden", transition: "all 0.2s",
      boxShadow: expanded ? "0 4px 24px rgba(0,0,0,0.3)" : "none"
    }}>
      {/* Card Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        {/* Color stripe */}
        <div style={{ width: 3, height: 40, background: typeColor, borderRadius: 2, flexShrink: 0 }} />

        {/* Meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>{project.name}</span>
            {project.blocker && <span style={{ fontSize: 10, color: "#EF4444" }}>⚠ Blocked</span>}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.goal?.substring(0, 80)}{project.goal?.length > 80 ? "…" : ""}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Pill label={p.label} color={p.color} bg={p.bg} small />
          <Pill label={s.label} color={s.color} bg={s.bg} small />
          {project.dueDate && (
            <span style={{ fontSize: 11, color: overdue ? "#EF4444" : days <= 3 ? "#F59E0B" : "#6B7280", fontFamily: "'DM Mono', monospace" }}>
              {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `${days}d`}
            </span>
          )}
          <div style={{ width: 70 }}><ProgressBar value={project.progress} color={s.color} /></div>
          <span style={{ color: "#4B5563", fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(90deg)" : "none" }}>▶</span>
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div style={{ borderTop: "1px solid #1F2937", padding: "20px 20px 16px", background: "#0D1117" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 16 }}>

            {/* Goal + meta */}
            <div>
              <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Goal</div>
              <div style={{ fontSize: 13, color: "#D1D5DB", lineHeight: 1.6, marginBottom: 12 }}>{project.goal}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <Tag>👤 {project.addedBy}</Tag>
                {project.kpi && <Tag>📊 {project.kpi}</Tag>}
                {project.dueDate && <Tag style={{ color: overdue ? "#EF4444" : undefined }}>📅 {project.dueDate}</Tag>}
                <Tag>{TYPE_LABEL[project.type] || project.type}</Tag>
              </div>
            </div>

            {/* Tasks */}
            <div>
              <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Next Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {project.nextActions.map((t, i) => (
                  <label key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}>
                    <input type="checkbox" checked={t.done} onChange={() => onToggleTask(project.id, i)}
                      style={{ marginTop: 2, accentColor: "#C5A25D", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: t.done ? "#4B5563" : "#D1D5DB", textDecoration: t.done ? "line-through" : "none", lineHeight: 1.5 }}>{t.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes + Blocker */}
            <div>
              <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Context</div>
              {project.blocker && (
                <div style={{ background: "rgba(239,68,68,0.07)", borderLeft: "3px solid #EF4444", borderRadius: "0 6px 6px 0", padding: "10px 12px", fontSize: 12, color: "#FCA5A5", marginBottom: 10, lineHeight: 1.6 }}>
                  ⚠ {project.blocker}
                </div>
              )}
              {project.notes && (
                <div style={{ background: "rgba(197,162,93,0.07)", borderLeft: "3px solid #C5A25D", borderRadius: "0 6px 6px 0", padding: "10px 12px", fontSize: 12, color: "#D1D5DB", lineHeight: 1.6 }}>
                  📌 {project.notes}
                </div>
              )}
            </div>
          </div>

          {/* Footer controls */}
          <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #1F2937", flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={project.status}
              onChange={e => onUpdateStatus(project.id, e.target.value)}
              style={{ background: "#1A1F2E", border: "1px solid #2A3147", borderRadius: 6, padding: "6px 10px", color: "#9CA3AF", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button
              onClick={() => { const v = prompt("Update progress (0–100):", project.progress); if (v !== null && !isNaN(+v)) onUpdateProgress(project.id, Math.min(100, Math.max(0, +v))); }}
              style={{ background: "#1A1F2E", border: "1px solid #2A3147", color: "#9CA3AF", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
              Update %
            </button>
            <button
              onClick={() => { if (confirm("Remove this project?")) onDelete(project.id); }}
              style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState([]);
  const [backlog, setBacklog]   = useState([]);
  const [loaded, setLoaded]     = useState(false);
  const [view, setView]         = useState("dashboard");
  const [showAdd, setShowAdd]   = useState(false);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");

  // ── STORAGE ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const pr = await window.storage.get("wac-projects", true);
        const bl = await window.storage.get("wac-backlog", true);
        setProjects(pr ? JSON.parse(pr.value) : SEED);
        setBacklog(bl ? JSON.parse(bl.value) : BACKLOG_SEED);
      } catch {
        setProjects(SEED);
        setBacklog(BACKLOG_SEED);
      }
      setLoaded(true);
    }
    load();
  }, []);

  async function saveProjects(p) { setProjects(p); try { await window.storage.set("wac-projects", JSON.stringify(p), true); } catch {} }
  async function saveBacklog(b)  { setBacklog(b);  try { await window.storage.set("wac-backlog",  JSON.stringify(b), true); } catch {} }

  // ── PROJECT ACTIONS ────────────────────────────────────────────────────────
  function addProject(p) { saveProjects([p, ...projects]); }

  function toggleTask(pid, idx) {
    const updated = projects.map(p => {
      if (p.id !== pid) return p;
      const actions = p.nextActions.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
      const done = actions.filter(t => t.done).length;
      return { ...p, nextActions: actions, progress: Math.round((done / actions.length) * 100) };
    });
    saveProjects(updated);
  }

  function updateProgress(pid, val) { saveProjects(projects.map(p => p.id === pid ? { ...p, progress: val } : p)); }
  function updateStatus(pid, val)   { saveProjects(projects.map(p => p.id === pid ? { ...p, status: val }   : p)); }
  function deleteProject(pid)       { saveProjects(projects.filter(p => p.id !== pid)); }
  function deleteBacklog(bid)       { saveBacklog(backlog.filter(b => b.id !== bid)); }

  function promoteToActive(bid) {
    const b = backlog.find(x => x.id === bid);
    if (!b) return;
    addProject({ id: uid(), name: b.name, type: b.type, status: "planned", priority: b.priority === "future" ? "low" : b.priority, progress: 0, addedBy: b.addedBy || "Ella", dueDate: "", goal: b.desc, nextActions: [{ text: "Define scope and first steps", done: false }], blocker: "", notes: "", kpi: "TBD", createdAt: new Date().toISOString().slice(0, 10) });
    saveBacklog(backlog.filter(x => x.id !== bid));
    setView("active");
  }

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const filtered = projects.filter(p => {
    if (filter !== "all" && p.type !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeProjects  = filtered.filter(p => ["active", "build", "review"].includes(p.status));
  const blockedProjects = filtered.filter(p => p.status === "blocked" || (p.blocker && p.blocker.length > 2));
  const plannedProjects = filtered.filter(p => p.status === "planned");
  const avgProgress     = projects.length ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length) : 0;
  const overdueCount    = projects.filter(p => isOverdue(p.dueDate)).length;

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#080C14", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C5A25D", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>Loading…</div>
    </div>
  );

  // ── STYLES ─────────────────────────────────────────────────────────────────
  const S = {
    app:   { minHeight: "100vh", background: "#080C14", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif", display: "flex" },
    side:  { width: 220, minWidth: 220, background: "#0D1117", borderRight: "1px solid #1F2937", padding: "24px 12px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden" },
    main:  { flex: 1, padding: "36px 44px", overflowX: "hidden", maxWidth: 1100 },
    navItem: (active) => ({
      display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
      borderRadius: 8, cursor: "pointer", fontSize: 13,
      color: active ? "#C5A25D" : "#6B7280", fontWeight: active ? 500 : 400,
      background: active ? "rgba(197,162,93,0.1)" : "transparent",
      transition: "all 0.15s", marginBottom: 2,
      border: "none", width: "100%", textAlign: "left", fontFamily: "inherit"
    }),
    statCard: { background: "#111827", border: "1px solid #1F2937", borderRadius: 12, padding: "18px 20px", flex: 1 },
    sectionTitle: { fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#F1F5F9", marginBottom: 4 },
    sectionSub:   { fontSize: 12, color: "#4B5563", marginBottom: 20 },
    input: { background: "#111827", border: "1px solid #1F2937", borderRadius: 8, padding: "9px 14px", color: "#E2E8F0", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" },
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard",     icon: "▦" },
    { id: "active",    label: "Active Projects", icon: "◉", count: activeProjects.length },
    { id: "planned",   label: "Planned",        icon: "◌", count: plannedProjects.length },
    { id: "backlog",   label: "Backlog",        icon: "⋯", count: backlog.length },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px } ::-webkit-scrollbar-track { background: #0D1117 } ::-webkit-scrollbar-thumb { background: #1F2937; border-radius: 10px } select option { background: #111827 }`}</style>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={addProject} />}

      <div style={S.app}>
        {/* SIDEBAR */}
        <nav style={S.side}>
          <div style={{ marginBottom: 28, paddingLeft: 12 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: "#F1F5F9" }}>WAC · Project Hub</div>
            <div style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", marginTop: 3 }}>WELL ADJUSTED CHIRO</div>
          </div>

          {NAV.map(n => (
            <button key={n.id} style={S.navItem(view === n.id)} onClick={() => setView(n.id)}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.count !== undefined && (
                <span style={{ background: view === n.id ? "rgba(197,162,93,0.2)" : "#1F2937", color: view === n.id ? "#C5A25D" : "#4B5563", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  {n.count}
                </span>
              )}
            </button>
          ))}

          <div style={{ marginTop: 16, borderTop: "1px solid #1F2937", paddingTop: 16 }}>
            <div style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", marginBottom: 8, paddingLeft: 12 }}>FILTER TYPE</div>
            {[["all","All"],["ghl","GHL"],["ai","AI Build"]].map(([k,l]) => (
              <button key={k} style={S.navItem(filter === k && view !== "dashboard")} onClick={() => { setFilter(k); setView("active"); }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: k === "ghl" ? "#3B82F6" : k === "ai" ? "#A855F7" : "#C5A25D", display: "inline-block", flexShrink: 0 }} />
                {l}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #1F2937" }}>
            <button
              onClick={() => setShowAdd(true)}
              style={{ width: "100%", background: "#C5A25D", color: "#000", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              + New Project
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <main style={S.main}>

          {/* ── DASHBOARD ── */}
          {view === "dashboard" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#F1F5F9" }}>Good morning, Ella.</div>
                  <div style={{ fontSize: 12, color: "#4B5563", marginTop: 4 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
                <button onClick={() => setShowAdd(true)} style={{ background: "#C5A25D", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  + New Project
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 14, marginBottom: 32 }}>
                {[
                  { label: "Active / In Build", value: activeProjects.length, sub: "projects running" },
                  { label: "Blocked", value: blockedProjects.length, sub: "need attention", color: blockedProjects.length > 0 ? "#EF4444" : undefined },
                  { label: "Backlog", value: backlog.length, sub: "parked ideas" },
                  { label: "Avg Progress", value: avgProgress + "%", sub: "across all projects" },
                  ...(overdueCount > 0 ? [{ label: "Overdue", value: overdueCount, sub: "past due date", color: "#EF4444" }] : []),
                ].map((s, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={{ fontSize: 10, color: "#4B5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: s.color || "#F1F5F9", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#4B5563", marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Active */}
              <div style={{ marginBottom: 32 }}>
                <div style={S.sectionTitle}>In Progress</div>
                <div style={{ ...S.sectionSub, marginBottom: 16 }}>Active and in-build projects</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeProjects.length === 0 && <div style={{ color: "#4B5563", fontSize: 13 }}>Nothing active right now.</div>}
                  {activeProjects.map(p => <ProjectCard key={p.id} project={p} onToggleTask={toggleTask} onUpdateProgress={updateProgress} onDelete={deleteProject} onUpdateStatus={updateStatus} />)}
                </div>
              </div>

              {/* Blocked */}
              {blockedProjects.length > 0 && (
                <div>
                  <div style={{ ...S.sectionTitle, color: "#FCA5A5" }}>Blocked / Needs Attention</div>
                  <div style={{ ...S.sectionSub, marginBottom: 16 }}>Resolve these to unblock progress</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {blockedProjects.map(p => <ProjectCard key={p.id} project={p} onToggleTask={toggleTask} onUpdateProgress={updateProgress} onDelete={deleteProject} onUpdateStatus={updateStatus} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVE ── */}
          {view === "active" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#F1F5F9", flex: 1 }}>All Projects</div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ ...S.input, width: 200, padding: "8px 12px" }} />
                <button onClick={() => setShowAdd(true)} style={{ background: "#C5A25D", color: "#000", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                  + New Project
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.length === 0 && <div style={{ color: "#4B5563", fontSize: 13 }}>No projects match.</div>}
                {filtered.map(p => <ProjectCard key={p.id} project={p} onToggleTask={toggleTask} onUpdateProgress={updateProgress} onDelete={deleteProject} onUpdateStatus={updateStatus} />)}
              </div>
            </div>
          )}

          {/* ── PLANNED ── */}
          {view === "planned" && (
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#F1F5F9", marginBottom: 20 }}>Planned Projects</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plannedProjects.length === 0 && <div style={{ color: "#4B5563", fontSize: 13 }}>No planned projects.</div>}
                {plannedProjects.map(p => <ProjectCard key={p.id} project={p} onToggleTask={toggleTask} onUpdateProgress={updateProgress} onDelete={deleteProject} onUpdateStatus={updateStatus} />)}
              </div>
            </div>
          )}

          {/* ── BACKLOG ── */}
          {view === "backlog" && (
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#F1F5F9", marginBottom: 6 }}>Backlog & Future Projects</div>
              <div style={{ fontSize: 12, color: "#4B5563", marginBottom: 24 }}>Nothing gets lost. Promote to active when ready.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {backlog.map(b => {
                  const pm = PRIORITY_META[b.priority] || PRIORITY_META.future;
                  return (
                    <div key={b.id} style={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.3, flex: 1, paddingRight: 10 }}>{b.name}</div>
                        <Pill label={pm.label} color={pm.color} bg={pm.bg} small />
                      </div>
                      <div style={{ fontSize: 11, marginBottom: 10 }}><Tag>{TYPE_LABEL[b.type] || b.type}</Tag>{b.addedBy && <Tag style={{ marginLeft: 6 }}>👤 {b.addedBy}</Tag>}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.65, marginBottom: 14 }}>{b.desc}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => promoteToActive(b.id)} style={{ background: "rgba(197,162,93,0.1)", color: "#C5A25D", border: "1px solid rgba(197,162,93,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          Promote →
                        </button>
                        <button onClick={() => deleteBacklog(b.id)} style={{ background: "transparent", color: "#4B5563", border: "1px solid #1F2937", borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
