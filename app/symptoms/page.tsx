"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { askAI } from "@/lib/gemini";
import { Stethoscope, AlertCircle, AlertTriangle, Eye, Home, LayoutDashboard, MessageCircle, User as UserIcon, LogOut, MapPin } from "lucide-react";
import { auth, db } from "@/lib/firebase";

// ── Types ─────────────────────────────────────────────────────────────────────
type UrgencyLevel = "emergency" | "soon" | "monitor" | "self-care";

type SymptomResult = {
  possibleCauses: string[];
  urgency: UrgencyLevel;
  urgencyReason: string;
  whatToMonitor: string[];
  doNow: string[];
  avoid: string[];
};

type Profile = {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  healthIssues: string;
  medications: string;
  allergies: string;
};

// ── Urgency config ────────────────────────────────────────────────────────────
const URGENCY_CONFIG: Record<UrgencyLevel, {
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}> = {
  emergency: {
    label:    "Go to Emergency Now",
    sublabel: "This requires immediate medical attention",
    color:    "#f87171",
    bg:       "rgba(248,113,113,0.12)",
    border:   "rgba(248,113,113,0.35)",
    icon:     <AlertCircle size={24} color="#f87171" strokeWidth={2} />,
  },
  soon: {
    label:    "See a Doctor Within 24–48 Hours",
    sublabel: "Don't delay — book an appointment today",
    color:    "#fb923c",
    bg:       "rgba(251,146,60,0.12)",
    border:   "rgba(251,146,60,0.35)",
    icon:     <AlertTriangle size={24} color="#fb923c" />,
  },
  monitor: {
    label:    "Monitor Closely",
    sublabel: "Watch for changes and see a doctor if it worsens",
    color:    "#facc15",
    bg:       "rgba(250,204,21,0.12)",
    border:   "rgba(250,204,21,0.35)",
    icon:     <Eye size={24} color="#facc15" />,
  },
  "self-care": {
    label:    "Self-Care at Home",
    sublabel: "Manageable at home — rest and monitor",
    color:    "#4ade80",
    bg:       "rgba(74,222,128,0.12)",
    border:   "rgba(74,222,128,0.35)",
    icon:     <Home size={24} color="#4ade80" />,
  },
};

// ── Common symptom chips ──────────────────────────────────────────────────────
const COMMON_SYMPTOMS = [
  "Headache", "Fever", "Chest pain", "Shortness of breath",
  "Nausea", "Fatigue", "Dizziness", "Back pain",
  "Sore throat", "Cough", "Abdominal pain", "Joint pain",
];

// ── Parse AI response ─────────────────────────────────────────────────────────
function parseResult(raw: string): SymptomResult {
  const extract = (tag: string) => {
    const match = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].trim() : "";
  };

  const listItems = (tag: string): string[] => {
    const block = extract(tag);
    if (block) {
      return block
        .split("\n")
        .map(l => l.replace(/^[-•*\d.]\s*/, "").trim())
        .filter(Boolean);
    }
    return [];
  };

  const urgencyRaw = extract("urgency").toLowerCase().trim() as UrgencyLevel;
  const urgency: UrgencyLevel =
    ["emergency", "soon", "monitor", "self-care"].includes(urgencyRaw)
      ? urgencyRaw
      : "monitor";

  return {
    possibleCauses: listItems("causes"),
    urgency,
    urgencyReason:  extract("urgency_reason"),
    whatToMonitor:  listItems("monitor"),
    doNow:          listItems("do_now"),
    avoid:          listItems("avoid"),
  };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SymptomsPage() {
  const [user, setUser]           = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [symptoms, setSymptoms]   = useState("");
  const [duration, setDuration]   = useState("");
  const [severity, setSeverity]   = useState<1 | 2 | 3 | 4 | 5>(3);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<SymptomResult | null>(null);
  const [error, setError]         = useState("");

  const handleFindClinics = () => {
    window.location.href = "/nearby";
  };

  // ── Auth + profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthReady(true);
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "profiles", u.uid));
        if (snap.exists()) setProfile(snap.data() as Profile);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".user-menu")) setDropdownOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const getInitials = (u: User) => {
    if (u.displayName) {
      const parts = u.displayName.trim().split(" ");
      return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
    }
    return u.email?.[0]?.toUpperCase() ?? "?";
  };

  // ── Add symptom chip ────────────────────────────────────────────────────────
  const addChip = (chip: string) => {
    setSymptoms(prev =>
      prev ? (prev.includes(chip) ? prev : `${prev}, ${chip}`) : chip
    );
  };

  // ── Check symptoms ──────────────────────────────────────────────────────────
  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    const bmi = profile?.heightCm && profile?.weightKg
      ? (parseFloat(profile.weightKg) / Math.pow(parseFloat(profile.heightCm) / 100, 2)).toFixed(1)
      : "not calculated";

    const prompt = `You are CureMe, an expert AI medical triage assistant attuned to Indian healthcare realities. Analyse the symptoms and suggest practical, accessible remedies (e.g. ORS, Haldi, steam inhalation) alongside standard medical triage, especially for 'self-care' or 'monitor' urgencies. Return a structured response.

PATIENT PROFILE:
- Age: ${profile?.age || "not specified"}
- Gender: ${profile?.gender || "not specified"}
- BMI: ${bmi}
- Health conditions: ${profile?.healthIssues || "none"}
- Medications: ${profile?.medications || "none"}
- Allergies: ${profile?.allergies || "none"}

REPORTED SYMPTOMS: ${symptoms}
DURATION: ${duration || "not specified"}
SEVERITY (1-5): ${severity}/5

Return ONLY this exact XML structure, no other text:

<causes>
- possible cause 1
- possible cause 2
- possible cause 3
</causes>

<urgency>emergency|soon|monitor|self-care</urgency>

<urgency_reason>
One sentence explaining why this urgency level was chosen, referencing the patient's profile if relevant.
</urgency_reason>

<monitor>
- [symptom or sign to watch for]
- [symptom or sign to watch for]
- [symptom or sign to watch for]
</monitor>

<do_now>
- immediate action to take
- immediate action to take
- immediate action to take
</do_now>

<avoid>
- thing to avoid
- thing to avoid
</avoid>

URGENCY RULES:
- emergency: chest pain, difficulty breathing, stroke symptoms, severe allergic reaction, loss of consciousness, signs of heart attack
- soon: high fever (>103°F/39.4°C), severe pain, symptoms lasting >3 days, concerning for someone with their conditions/medications
- monitor: mild-moderate symptoms, no red flags, manageable at home but needs watching
- self-care: minor symptoms, no red flags, clearly manageable at home

IMPORTANT: Consider the patient's existing conditions and medications when determining urgency. A headache in someone with hypertension is more urgent than in a healthy person.

FORMATTING RULES:
- No square brackets around any text
- Write causes as plain medical terms e.g. "Tension headache" not "[Tension headache]"
- Be specific and concise — max 8 words per bullet point
- Do Now must always have 3 actionable steps
- Avoid must always have 2-3 specific things to avoid`;

    try {
      const raw = await askAI(prompt);
      console.log("RAW RESPONSE:", raw);
setResult(parseResult(raw));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const urgencyCfg = result ? URGENCY_CONFIG[result.urgency] : null;

  return (
    <>
      <title>CureMe AI — Symptom Checker</title>
        <link
      href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"
      rel="stylesheet"
    />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #06060e; color: rgba(255,255,255,0.88); font-family: 'Sora', sans-serif; overflow-x: hidden; line-height: 1.6; }
        body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; opacity: 0.5; }

        .blobs { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15; }
        .blob-1 { width: 600px; height: 600px; background: #7c3aed; top: -200px; left: -200px; animation: float1 18s ease-in-out infinite alternate; }
        .blob-2 { width: 400px; height: 400px; background: #2563eb; bottom: -100px; right: -100px; animation: float2 22s ease-in-out infinite alternate; }
        @keyframes float1 { to { transform: translate(80px,60px); } }
        @keyframes float2 { to { transform: translate(-60px,-80px); } }

        /* Focus styles for keyboard navigation */
        *:focus-visible { outline: 2px solid rgba(124,58,237,0.8); outline-offset: 2px; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(6,6,14,0.7); }
        .nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #fff; text-decoration: none; }
        .nav-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #7c3aed, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
        .nav-links { display: flex; align-items: center; gap: 24px; list-style: none; }
        .nav-links a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.82rem; font-weight: 500; letter-spacing: 0.04em; font-family: 'Sora', sans-serif; transition: color 0.2s; }
        .nav-links a:hover, .nav-links a.active { color: #fff; }

        .user-menu { position: relative; }
        .user-avatar-btn { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.8); font-size: 0.8rem; font-weight: 500; font-family: 'Sora', sans-serif; }
        .user-avatar-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(124,58,237,0.4); }
        .user-avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-photo { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .user-chevron { width: 14px; height: 14px; opacity: 0.5; transition: transform 0.2s; }
        .user-chevron.open { transform: rotate(180deg); }
        .user-dropdown { position: absolute; top: calc(100% + 10px); right: 0; min-width: 200px; background: #13121f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 8px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); animation: dropIn 0.18s ease both; z-index: 200; }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        .dropdown-header { padding: 10px 14px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 6px; }
        .dropdown-name { font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dropdown-email { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .dropdown-item { min-height: 44px; display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 14px; background: none; border: none; color: rgba(255,255,255,0.65); font-family: 'Sora', sans-serif; font-size: 0.8rem; border-radius: 10px; cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .dropdown-item.danger:hover { background: rgba(232,121,160,0.1); color: #f9a8d4; }

        .page { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 100px 24px 80px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        .fade-1 { animation: fadeUp 0.5s 0.05s ease both; }
        .fade-2 { animation: fadeUp 0.5s 0.15s ease both; }
        .fade-3 { animation: fadeUp 0.5s 0.25s ease both; }
        .fade-4 { animation: fadeUp 0.5s 0.35s ease both; }

        .page-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #a78bfa; margin-bottom: 8px; }
        .page-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 5vw, 2.8rem); color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 6px; }
        .page-title em { font-style: italic; background: linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .page-sub { font-size: 0.82rem; color: rgba(255,255,255,0.35); margin-bottom: 40px; }

        .card { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; margin-bottom: 20px; position: relative; overflow: hidden; }
        .card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 0% 0%, rgba(124,58,237,0.04), transparent 60%); pointer-events: none; }
        .card-label { display: block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 14px; }

        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .chip { min-height: 44px; padding: 8px 16px; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); border-radius: 100px; font-size: 0.8rem; color: #a78bfa; cursor: pointer; transition: all 0.2s; font-family: 'Sora', sans-serif; }
        .chip:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); color: #c4b5fd; transform: translateY(-1px); }

        .textarea {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: #fff;
          font-family: 'Sora', sans-serif; font-size: 0.88rem;
          outline: none; resize: none; min-height: 100px;
          line-height: 1.6; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .textarea:focus { border-color: rgba(124,58,237,0.5); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .textarea::placeholder { color: rgba(255,255,255,0.2); }

        .input { min-height: 44px; width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-family: 'Sora', sans-serif; font-size: 0.85rem; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: rgba(124,58,237,0.5); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .input::placeholder { color: rgba(255,255,255,0.2); }

        .severity-row { display: flex; gap: 10px; align-items: center; }
        .severity-btn { min-height: 44px; flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); font-family: 'Sora', sans-serif; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; text-align: center; }
        .severity-btn:hover { border-color: rgba(124,58,237,0.3); color: #fff; }
        .severity-btn.active { background: rgba(124,58,237,0.2); border-color: #7c3aed; color: #a78bfa; font-weight: 600; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .submit-btn { min-height: 44px; width: 100%; padding: 14px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: none; border-radius: 14px; color: #fff; font-family: 'Sora', sans-serif; font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: all 0.25s; box-shadow: 0 6px 20px rgba(124,58,237,0.4); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(124,58,237,0.55); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .urgency-banner { border-radius: 16px; padding: 20px 24px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 16px; animation: fadeUp 0.5s ease both; }
        .urgency-icon { font-size: 2rem; flex-shrink: 0; line-height: 1; }
        .urgency-label { font-family: 'DM Serif Display', serif; font-size: 1.3rem; font-weight: 700; line-height: 1.2; }
        .urgency-sublabel { font-size: 0.78rem; margin-top: 4px; opacity: 0.8; }
        .urgency-reason { font-size: 0.78rem; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); opacity: 0.75; line-height: 1.6; }

        .result-section { margin-bottom: 8px; }
        .result-section-title { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 12px; }
        .result-list { display: flex; flex-direction: column; gap: 8px; }
        .result-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.82rem; color: rgba(255,255,255,0.75); line-height: 1.55; }
        .result-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

        .disclaimer { text-align: center; font-size: 0.7rem; color: rgba(255,255,255,0.2); margin-top: 24px; line-height: 1.6; }

        .reset-btn { min-height: 44px; display: block; margin: 16px auto 0; padding: 10px 24px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.4); font-family: 'Sora', sans-serif; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
        .reset-btn:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        .profile-notice { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 12px; font-size: 0.75rem; color: #a78bfa; margin-bottom: 20px; }

        @media (max-width: 768px) {
          nav { padding: 14px 16px; }
          .nav-links { display: none; }
          .page { padding: 80px 14px 60px; }
          .two-col { grid-template-columns: 1fr; }
          .card { padding: 18px 16px; }
          .page-title { font-size: 1.75rem; }
          .chip { min-height: 40px; padding: 7px 13px; font-size: 0.76rem; }
          .severity-btn { min-height: 40px; font-size: 0.75rem; padding: 8px 4px; }
          .urgency-banner { padding: 16px; gap: 12px; }
          .urgency-label { font-size: 1.1rem; }
          .submit-btn { font-size: 0.85rem; }
        }
        @media (max-width: 480px) {
          .severity-row { gap: 6px; }
          .chips { gap: 6px; }
          .chip { padding: 6px 11px; font-size: 0.72rem; }
          .page-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="blobs" aria-hidden="true">
        <div className="blob blob-1"/><div className="blob blob-2"/>
      </div>


      <div className="page">
        {/* ── HEADER ── */}
        <div className="fade-1">
          <p className="page-label">Symptom Checker</p>
          <h1 className="page-title">What's <em>bothering</em> you?</h1>
          <p className="page-sub">Describe your symptoms and get an instant triage — including how urgently you need to act.</p>
        </div>

        {/* Profile notice */}
        {profile && (
          <div className="profile-notice fade-1">
            <span>✦</span>
            Your health profile is loaded — results will account for your {profile.healthIssues || "conditions"}, medications, and allergies.
          </div>
        )}

        {!result ? (
          <>
            {/* ── SYMPTOM INPUT ── */}
            <div className="card fade-2">
              <p className="card-label">Common Symptoms — tap to add</p>
              <div className="chips">
                {COMMON_SYMPTOMS.map((s) => (
                  <button key={s} className="chip" onClick={() => addChip(s)}>{s}</button>
                ))}
              </div>
              <textarea
                aria-label="Describe your symptoms in detail"
                className="textarea"
                placeholder="Describe your symptoms in detail… e.g. throbbing headache on the right side, started this morning, worse with light"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            {/* ── DURATION + SEVERITY ── */}
            <div className="card fade-3">
              <div className="two-col" style={{ marginBottom: 20 }}>
                <div>
                  <label className="card-label" htmlFor="duration-input">How long?</label>
                  <input
                    id="duration-input"
                    className="input"
                    type="text"
                    placeholder="e.g. 2 days, since this morning"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div>
                  <p className="card-label" id="severity-label">Severity</p>
                  <div className="severity-row" role="radiogroup" aria-labelledby="severity-label">
                    {[1,2,3,4,5].map((n) => (
                      <button
                        key={n}
                        role="radio"
                        aria-checked={severity === n}
                        className={`severity-btn ${severity === n ? "active" : ""}`}
                        onClick={() => setSeverity(n as 1|2|3|4|5)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
                    {["", "Very mild", "Mild", "Moderate", "Severe", "Unbearable"][severity]}
                  </p>
                </div>
              </div>

              {error && (
                <div role="alert" aria-live="polite" style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, fontSize: "0.78rem", color: "#fca5a5", marginBottom: 16 }}>
                  <AlertTriangle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }}/> {error}
                </div>
              )}

              <button
                className="submit-btn"
                onClick={handleCheck}
                disabled={loading || !symptoms.trim()}
              >
                {loading
                  ? <><span className="spinner"/> Analysing symptoms…</>
                  : "Check My Symptoms →"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ── URGENCY BANNER ── */}
            {urgencyCfg && (
              <div
                className="urgency-banner"
                style={{ background: urgencyCfg.bg, border: `1px solid ${urgencyCfg.border}` }}
              >
                <span className="urgency-icon">{urgencyCfg.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="urgency-label" style={{ color: urgencyCfg.color }}>
                    {urgencyCfg.label}
                  </div>
                  <div className="urgency-sublabel" style={{ color: urgencyCfg.color }}>
                    {urgencyCfg.sublabel}
                  </div>
                  {result.urgencyReason && (
                    <div className="urgency-reason">{result.urgencyReason}</div>
                  )}
                </div>
              </div>
            )}

            {/* ── RESULTS GRID ── */}
            <div className="card fade-2">
              <div className="two-col">
                {/* Possible causes */}
                <div className="result-section">
                  <p className="result-section-title">Possible Causes</p>
                  <div className="result-list">
                    {result.possibleCauses.map((c, i) => (
                      <div key={i} className="result-item">
                        <div className="result-dot" style={{ background: "#a78bfa" }}/>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                {/* What to monitor */}
                <div className="result-section">
                  <p className="result-section-title">Watch For</p>
                  <div className="result-list">
                    {result.whatToMonitor.map((m, i) => (
                      <div key={i} className="result-item">
                        <div className="result-dot" style={{ background: "#facc15" }}/>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card fade-3">
              <div className="two-col">
                {/* Do now */}
                <div className="result-section">
                  <p className="result-section-title">Do Now</p>
                  <div className="result-list">
                    {result.doNow.map((d, i) => (
                      <div key={i} className="result-item">
                        <div className="result-dot" style={{ background: "#4ade80" }}/>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avoid */}
                <div className="result-section">
                  <p className="result-section-title">Avoid</p>
                  <div className="result-list">
                    {result.avoid.map((a, i) => (
                      <div key={i} className="result-item">
                        <div className="result-dot" style={{ background: "#f87171" }}/>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
              <button 
                className="reset-btn" 
                style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, background: "rgba(248,113,113,0.15)", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.3)" }} 
                onClick={handleFindClinics}
              >
                <MapPin size={16} strokeWidth={1.5} /> Find Nearby Care
              </button>

              <button className="reset-btn" style={{ margin: 0 }} onClick={() => {
                setResult(null);
                setSymptoms("");
                setDuration("");
                setSeverity(3);
              }}>
                ← Check different symptoms
              </button>
            </div>

            <p className="disclaimer">
              This is AI-generated triage guidance, not a medical diagnosis.<br/>
              Always consult a qualified healthcare provider for personalised medical advice.
            </p>
          </>
        )}
      </div>
    </>
  );
}