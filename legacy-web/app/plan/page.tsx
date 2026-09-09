"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Dumbbell, Utensils, Zap, AlertTriangle, ArrowRight, Loader2, Download, Copy, Check, Leaf, Beef, Calendar, Activity, ChefHat } from "lucide-react";
import { askAI } from "@/lib/gemini";
import { auth, db } from "@/lib/firebase";

// ── Keep formatMarkdown IDENTICAL ──────────────────────────
function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="color:#a78bfa;font-size:1.05rem;font-weight:700;margin:18px 0 6px;font-family:\'DM Serif Display\',serif;border-bottom:1px solid rgba(167,139,250,0.15);padding-bottom:4px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#fff;font-size:1.1rem;font-weight:700;margin:14px 0 6px;font-family:\'DM Serif Display\',serif;">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;font-weight:600;">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em style="color:rgba(255,255,255,0.6);">$1</em>')
    .replace(/^[\*\-•]\s(.+)$/gm, '<li style="margin:2px 0;line-height:1.6;">$1</li>')
    .replace(/((?:<li[^>]*>[^<]*<\/li>\s*)+)/g, (m) => `<ul style="margin:4px 0 8px 18px;list-style:disc;">${m}</ul>`)
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:10px 0;"/>')
    .replace(/\n{2,}/g, '<br/>')
    .replace(/\n/g, ' ');
}

export default function PlannerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [diet, setDiet] = useState<"Vegetarian" | "Non-Vegetarian">("Vegetarian");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u); setAuthReady(true);
      if (u) {
        const snap = await getDoc(doc(db, "profiles", u.uid));
        if (snap.exists()) setProfile(snap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleGeneratePlan = async () => {
    if (!profile) return;
    setLoading(true); setPlan(null);
    const bmi = profile.heightCm && profile.weightKg
      ? (parseFloat(profile.weightKg) / Math.pow(parseFloat(profile.heightCm) / 100, 2)).toFixed(1)
      : "Unknown";
    const prompt = `You are Medi Bud AI. Act as an expert nutritionist and physical trainer for an Indian consumer. 
Generate a comprehensive 7-DAY Indian meal and workout plan for a ${profile.age || "unknown"}-year-old ${profile.gender || "person"}.
BMI: ${bmi}. 
Active Conditions: ${profile.healthIssues || "None"}. 
Dietary Preference: STRICTLY ${diet} Indian cuisine.
Allergies: ${profile.allergies || "None"}.

STRICT RULES:
- Format each day with a "### Day X: [Focus]" header.
- For each day, provide a brief Meals section and a Workout section.
- Suggest accessible, everyday Indian meals (e.g. Dalia, Khichdi, Roti/Sabzi, Sprouts).
- AVOID ALL ALLERGENS completely!
- Provide 1 actionable fitness tip at the very end.
- Use variety in food suggestions across the 7 days.
- Ensure the tone is empathetic but professional.`;
    try {
      const response = await askAI(prompt);
      setPlan(response);
    } catch {
      setPlan("**Error:** Could not generate plan. Please try again.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bmi = profile?.heightCm && profile?.weightKg
    ? (parseFloat(profile.weightKg) / Math.pow(parseFloat(profile.heightCm) / 100, 2)).toFixed(1)
    : null;

  if (!authReady) return (
    <div style={{ height: "100vh", background: "#070712", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(124,58,237,0.3)", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:0.4;} 50%{opacity:0.8;} }
        @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
        @keyframes gradMove { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }

        .plan-root {
          min-height: 100vh;
          background: #070712;
          font-family: 'Sora', sans-serif;
          color: rgba(255,255,255,0.88);
          padding-top: 72px;
          position: relative;
          overflow-x: hidden;
        }

        /* — decorative background blobs — */
        .plan-root::before {
          content: '';
          position: fixed;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .plan-root::after {
          content: '';
          position: fixed;
          bottom: -200px; right: -200px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── LAYOUT ── */
        .plan-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 0;
          min-height: calc(100vh - 72px);
        }

        /* ── LEFT PANEL ── */
        .plan-sidebar {
          position: sticky;
          top: 72px;
          height: calc(100vh - 72px);
          overflow-y: auto;
          overflow-x: hidden;
          padding: 32px 24px;
          border-right: 1px solid rgba(124,58,237,0.1);
          background: linear-gradient(180deg, #0d0c1e 0%, #08070f 100%);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .plan-sidebar::-webkit-scrollbar { width: 2px; }
        .plan-sidebar::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 2px; }

        .sidebar-header {
          text-align: center;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sidebar-icon-wrap {
          width: 54px; height: 54px;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15));
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.15);
        }
        .sidebar-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.65rem;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .sidebar-title em {
          font-style: italic;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200%;
          animation: gradMove 4s ease infinite;
        }
        .sidebar-sub {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.65;
        }

        /* Profile stats mini-cards */
        .profile-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .stat-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }
        .stat-icon { color: #a78bfa; flex-shrink: 0; }
        .stat-label { font-size: 0.66rem; color: rgba(255,255,255,0.3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; }
        .stat-value { font-size: 0.82rem; color: rgba(255,255,255,0.78); font-weight: 500; }

        /* Diet toggle */
        .diet-section {}
        .diet-section-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .diet-toggle {
          display: flex;
          background: rgba(255,255,255,0.03);
          padding: 5px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          gap: 4px;
        }
        .diet-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 0;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.4);
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          font-size: 0.8rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .diet-btn.veg.active { background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15)); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
        .diet-btn.nonveg.active { background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15)); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }
        .diet-btn:not(.active):hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }

        /* Allergy badge */
        .allergy-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 12px;
          font-size: 0.74rem;
          color: #fca5a5;
          line-height: 1.45;
        }

        /* Generate button */
        .btn-generate {
          width: 100%;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          background-size: 200%;
          border: none;
          border-radius: 14px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 6px 24px rgba(124,58,237,0.4);
          font-family: 'Sora', sans-serif;
          letter-spacing: 0.01em;
          text-decoration: none;
        }
        .btn-generate:hover:not(:disabled) {
          animation: gradMove 2s ease infinite;
          box-shadow: 0 10px 32px rgba(124,58,237,0.6);
          transform: translateY(-1px);
        }
        .btn-generate:disabled {
          opacity: 0.55; cursor: not-allowed; transform: none;
        }

        /* ── RIGHT PANEL ── */
        .plan-main {
          padding: 32px 36px 56px;
          min-height: calc(100vh - 72px);
        }

        /* Empty state */
        .plan-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 14px;
          text-align: center;
          padding: 40px;
        }
        .empty-visual {
          position: relative;
          width: 80px; height: 80px;
          margin-bottom: 8px;
        }
        .empty-ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          border: 1px dashed rgba(124,58,237,0.25);
          position: absolute;
          animation: pulse 3s ease-in-out infinite;
        }
        .empty-icon-inner {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(37,99,235,0.08));
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          position: absolute;
          top: 12px; left: 12px;
        }
        .empty-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem;
          color: rgba(255,255,255,0.55);
        }
        .empty-desc {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.22);
          max-width: 280px;
          line-height: 1.65;
        }

        /* Info chips row */
        .info-chips {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .info-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
        }

        /* Plan output card */
        .plan-output-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .plan-output-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.25rem;
          color: #fff;
        }
        .plan-output-title span { color: #a78bfa; }
        .plan-output-actions { display: flex; gap: 8px; }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          border: none;
        }
        .btn-action.copy {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .btn-action.copy:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-action.pdf {
          background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.1));
          color: #c4b5fd;
          border: 1px solid rgba(167,139,250,0.3);
        }
        .btn-action.pdf:hover { background: rgba(167,139,250,0.25); color: #fff; }

        .plan-card {
          background: linear-gradient(180deg, rgba(13,12,30,0.8) 0%, rgba(8,7,15,0.8) 100%);
          border: 1px solid rgba(124,58,237,0.12);
          border-radius: 20px;
          padding: 32px;
          animation: fadeUp 0.5s ease;
          line-height: 1.75;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }

        /* Loading skeleton */
        .plan-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 60px 24px;
          text-align: center;
        }
        .loading-spinner {
          width: 44px; height: 44px;
          border: 3px solid rgba(124,58,237,0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loading-text { font-size: 0.88rem; color: rgba(255,255,255,0.45); }
        .loading-sub { font-size: 0.74rem; color: rgba(255,255,255,0.2); margin-top: -12px; }
        .skeleton-lines { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .skel { height: 10px; border-radius: 6px; background: rgba(255,255,255,0.06); animation: shimmer 1.5s ease infinite; }
        .skel.w80 { width: 80%; }
        .skel.w60 { width: 60%; }
        .skel.w90 { width: 90%; }

        /* Day header styling inside plan-card */
        .plan-card h3 { color: #a78bfa; font-size:1.05rem; font-weight:700; margin:18px 0 6px; font-family:'DM Serif Display',serif; border-bottom:1px solid rgba(167,139,250,0.15); padding-bottom:4px; }
        .plan-card h2 { color:#fff; font-size:1.1rem; font-weight:700; margin:14px 0 6px; font-family:'DM Serif Display',serif; }
        .plan-card strong { color:#fff; font-weight:600; }
        .plan-card em { color:rgba(255,255,255,0.6); }
        .plan-card ul { margin:4px 0 8px 18px; list-style:disc; }
        .plan-card li { margin:2px 0; line-height:1.6; }

        /* Print styles */
        @media print {
          body { background:#fff !important; color:#000 !important; }
          .plan-root { background:#fff !important; padding:0 !important; }
          .plan-sidebar, .plan-output-actions, .info-chips, nav { display:none !important; }
          .plan-layout { grid-template-columns:1fr !important; }
          .plan-main { padding:0 !important; }
          .plan-card { border:none !important; background:#fff !important; color:#000 !important; padding:0 !important; box-shadow:none !important; }
          .plan-card strong { color:#000 !important; }
          .plan-card h3 { color:#5b21b6 !important; border-color:#c4b5fd !important; }
          .plan-card em { color:#555 !important; }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .plan-layout { grid-template-columns: 1fr; }
          .plan-sidebar { position: static; height: auto; border-right: none; border-bottom: 1px solid rgba(124,58,237,0.1); padding: 24px 20px; }
          .plan-main { padding: 24px 20px 48px; }
          .plan-root { padding-top: 52px; }
        }
      `}</style>

      <div className="plan-root">
        <div className="plan-layout">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="plan-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-icon-wrap">
                <Calendar size={26} color="#a78bfa" strokeWidth={1.5} />
              </div>
              <h1 className="sidebar-title">Tailored <em>7-Day</em> Roadmap</h1>
              <p className="sidebar-sub">A comprehensive week-long schedule of Indian meals and physical activities — built around your body.</p>
            </div>

            {/* Profile snapshot */}
            {profile && (
              <div className="profile-stats">
                <div className="stat-row">
                  <Activity size={14} strokeWidth={1.5} className="stat-icon" />
                  <div>
                    <div className="stat-label">Conditions</div>
                    <div className="stat-value">{profile.healthIssues || "None"}</div>
                  </div>
                </div>
                {bmi && (
                  <div className="stat-row">
                    <Dumbbell size={14} strokeWidth={1.5} className="stat-icon" />
                    <div>
                      <div className="stat-label">BMI</div>
                      <div className="stat-value">{bmi} — {parseFloat(bmi) < 18.5 ? "Underweight" : parseFloat(bmi) < 25 ? "Healthy" : parseFloat(bmi) < 30 ? "Overweight" : "Obese"}</div>
                    </div>
                  </div>
                )}
                <div className="stat-row">
                  <ChefHat size={14} strokeWidth={1.5} className="stat-icon" />
                  <div>
                    <div className="stat-label">Diet</div>
                    <div className="stat-value">{diet} Indian Cuisine</div>
                  </div>
                </div>
              </div>
            )}

            {/* Diet toggle */}
            {user && profile && (
              <div className="diet-section">
                <div className="diet-section-label">Dietary Preference</div>
                <div className="diet-toggle">
                  <button
                    className={`diet-btn veg ${diet === "Vegetarian" ? "active" : ""}`}
                    onClick={() => setDiet("Vegetarian")}
                  >
                    <Leaf size={13} /> Vegetarian
                  </button>
                  <button
                    className={`diet-btn nonveg ${diet === "Non-Vegetarian" ? "active" : ""}`}
                    onClick={() => setDiet("Non-Vegetarian")}
                  >
                    <Beef size={13} /> Non-Veg
                  </button>
                </div>
              </div>
            )}

            {/* Allergy warning */}
            {profile?.allergies && (
              <div className="allergy-badge">
                <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                <span><strong style={{ color: "#fca5a5" }}>Avoiding:</strong> {profile.allergies}</span>
              </div>
            )}

            {/* CTA */}
            {user && profile ? (
              <button className="btn-generate" onClick={handleGeneratePlan} disabled={loading}>
                {loading
                  ? <><Loader2 style={{ animation: "spin 0.8s linear infinite" }} size={18} /> Generating your plan…</>
                  : <><Zap size={17} /> Generate 7-Day Plan</>}
              </button>
            ) : user && !profile ? (
              <a href="/survey" className="btn-generate">
                Complete Profile <ArrowRight size={16} />
              </a>
            ) : (
              <a href="/login" className="btn-generate">
                Sign in to unlock <ArrowRight size={16} />
              </a>
            )}
          </aside>

          {/* ── RIGHT MAIN ── */}
          <main className="plan-main">

            {/* Loading state */}
            {loading && (
              <div className="plan-loading">
                <div className="loading-spinner" />
                <p className="loading-text">Crafting your personalised 7-day plan…</p>
                <p className="loading-sub">This may take 15–30 seconds</p>
                <div className="skeleton-lines">
                  <div className="skel w90" />
                  <div className="skel w80" />
                  <div className="skel w60" />
                  <div className="skel w90" />
                  <div className="skel w80" />
                </div>
              </div>
            )}

            {/* Plan output */}
            {plan && !loading && (
              <>
                <div className="plan-output-header">
                  <div className="plan-output-title">
                    Your <span>{diet === "Vegetarian" ? "🥗 Veg" : "🍗 Non-Veg"}</span> Plan
                  </div>
                  <div className="plan-output-actions">
                    <button className="btn-action copy" onClick={handleCopy}>
                      {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                    </button>
                    <button className="btn-action pdf" onClick={() => window.print()}>
                      <Download size={13} /> Export PDF
                    </button>
                  </div>
                </div>

                {/* Info chips */}
                <div className="info-chips">
                  <div className="info-chip"><Calendar size={11} /> 7 Days</div>
                  <div className="info-chip"><Utensils size={11} /> {diet}</div>
                  {bmi && <div className="info-chip"><Activity size={11} /> BMI {bmi}</div>}
                  {profile?.healthIssues && <div className="info-chip"><Zap size={11} /> {profile.healthIssues}</div>}
                </div>

                <div id="plan-print-area" className="plan-card" dangerouslySetInnerHTML={{ __html: formatMarkdown(plan) }} />
              </>
            )}

            {/* Empty state */}
            {!plan && !loading && (
              <div className="plan-empty">
                <div className="empty-visual">
                  <div className="empty-ring" />
                  <div className="empty-icon-inner">
                    <Utensils size={22} color="rgba(167,139,250,0.5)" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="empty-title">Ready when you are</p>
                <p className="empty-desc">
                  {user && profile
                    ? "Choose your diet preference and hit Generate to create your personalised 7-day Indian meal and workout plan."
                    : user
                    ? "Complete your health profile first to unlock the plan."
                    : "Sign in to generate your personalised health plan."}
                </p>
              </div>
            )}
          </main>

        </div>
      </div>
    </>
  );
}
