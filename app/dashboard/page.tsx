"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { MessageCircle, User as UserIcon, LogOut, LayoutDashboard, Stethoscope, ClipboardList, MapPin } from "lucide-react";
import { Activity, Pill, AlertTriangle } from "lucide-react";
import { auth, db } from "@/lib/firebase";

type Profile = {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  healthIssues: string;
  medications: string;
  allergies: string;
  updatedAt?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcBMI(h: string, w: string): number | null {
  const height = parseFloat(h);
  const weight = parseFloat(w);
  if (!height || !weight) return null;
  return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
}

function bmiCategory(bmi: number): { label: string; color: string; bg: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa", bg: "rgba(96,165,250,0.15)" };
  if (bmi < 25)   return { label: "Healthy",     color: "#4ade80", bg: "rgba(74,222,128,0.15)" };
  if (bmi < 30)   return { label: "Overweight",  color: "#facc15", bg: "rgba(250,204,21,0.15)" };
  return             { label: "Obese",        color: "#f87171", bg: "rgba(248,113,113,0.15)" };
}

function calcHealthScore(profile: Profile): number {
  let score = 100;
  const bmi = calcBMI(profile.heightCm, profile.weightKg);

  // BMI penalty
  if (bmi !== null) {
    if (bmi < 18.5 || bmi >= 30) score -= 20;
    else if (bmi >= 25) score -= 10;
  }

  // Each health issue deducts points
  const issues = profile.healthIssues?.split(",").filter(Boolean) ?? [];
  score -= issues.length * 10;

  // Each medication deducts small points
  const meds = profile.medications?.split(",").filter(Boolean) ?? [];
  score -= meds.length * 5;

  // Each allergy deducts small points
  const allergies = profile.allergies?.split(",").filter(Boolean) ?? [];
  score -= allergies.length * 3;

  return Math.max(10, Math.min(100, score));
}

function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Good",      color: "#22c55e" };
  if (score >= 60) return { label: "Fair",       color: "#fb923c" };
  if (score >= 40) return { label: "At Risk",    color: "#f87171" };
  return                   { label: "Critical",  color: "#e879a0" };
}

// ── BMI Gauge (SVG arc) ───────────────────────────────────────────────────────
function BMIGauge({ bmi }: { bmi: number | null }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const cat = bmi !== null ? bmiCategory(bmi) : null;

  const R = 80;
  const cx = 140;
  const cy = 120;

  const toRad = (d: number) => (d * Math.PI) / 180;

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const bmiClamped = bmi !== null ? Math.max(10, Math.min(40, bmi)) : 10;
  const dotAngle = -180 + ((bmiClamped - 10) / 30) * 180;
  const dotX = cx + R * Math.cos(toRad(dotAngle));
  const dotY = cy + R * Math.sin(toRad(dotAngle));

  // Seamless segments — no gaps, exact BMI breakpoints
  // BMI 10→18.5 = -180 to -129, 18.5→25 = -129 to -90, 25→30 = -90 to -60, 30→40 = -60 to 0
  const segments = [
    { start: -180, end: -129, color: "#60a5fa" }, // Underweight
    { start: -129, end:  -90, color: "#4ade80" }, // Normal
    { start:  -90, end:  -60, color: "#facc15" }, // Overweight
    { start:  -60, end:    0, color: "#f87171" }, // Obese
  ];

  return (
    <svg viewBox="0 0 280 155" style={{ width: "100%", maxWidth: 300 }}>

      {/* Background track */}
      <path
        d={arcPath(-180, 0, R)}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="16"
      />

      {/* Dim colour segments — full track width */}
      {segments.map((seg, i) => (
        <path
          key={i}
          d={arcPath(seg.start, seg.end, R)}
          fill="none"
          stroke={seg.color}
          strokeWidth="16"
          opacity="0.3"
        />
      ))}

      {/* Active arc — slightly thinner so segments show as border */}
      {bmi !== null && cat && (
        <path
          d={arcPath(-180, animated ? dotAngle : -180, R)}
          fill="none"
          stroke={cat.color}
          strokeWidth="15"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${cat.color}99)`,
            transition: "all 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      )}

      {/* Dot indicator */}
      {bmi !== null && cat && (
        <>
          <circle
            cx={animated ? dotX : cx - R}
            cy={animated ? dotY : cy}
            r="11" fill={`${cat.color}22`}
            style={{ transition: "all 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
          <circle
            cx={animated ? dotX : cx - R}
            cy={animated ? dotY : cy}
            r="7" fill="#0d0d1a" stroke="#fff" strokeWidth="2"
            style={{ transition: "all 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
          <circle
            cx={animated ? dotX : cx - R}
            cy={animated ? dotY : cy}
            r="3.5" fill={cat.color}
            style={{
              transition: "all 1.4s cubic-bezier(0.34,1.56,0.64,1)",
              filter: `drop-shadow(0 0 4px ${cat.color})`,
            }}
          />
        </>
      )}

  {/* BMI value */}
<text x={cx} y={cy -14}
  fill="#fff" fontSize="30" fontWeight="700"
  textAnchor="middle" fontFamily="DM Serif Display, serif">
  {bmi}
</text>
<text x={cx} y={cy + 5}
  fill={cat?.color} fontSize="8" textAnchor="middle"
  fontWeight="700" letterSpacing="0.12em">
  {cat?.label?.toUpperCase()}
</text>



    </svg>
  );
}

// ── Health Score Ring ─────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(t);
  }, []);

  const { label, color } = scoreLabel(score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = animated ? circ * (score / 100) : 0;

  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", fontFamily: "DM Serif Display, serif", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: "0.65rem", color, fontWeight: 600, marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser]           = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthReady(true);
      if (!u) { window.location.href = "/login"; return; }
      setUser(u);
      const snap = await getDoc(doc(db, "profiles", u.uid));
      if (snap.exists()) setProfile(snap.data() as Profile);
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

  const handleFindClinics = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        window.open(`https://www.google.com/maps/search/clinics+hospitals+medical+stores+chemist+near+me/@${latitude},${longitude},14z`, "_blank");
      },
      () => {
        alert("Unable to retrieve your location. Please check your browser permissions.");
      }
    );
  };

  const getInitials = (u: User) => {
    if (u.displayName) {
      const parts = u.displayName.trim().split(" ");
      return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
    }
    return u.email?.[0]?.toUpperCase() ?? "?";
  };

  const bmi     = profile ? calcBMI(profile.heightCm, profile.weightKg) : null;
  const score   = profile ? calcHealthScore(profile) : 0;
  const cat     = bmi !== null ? bmiCategory(bmi) : null;
  const issues  = profile?.healthIssues?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
  const meds    = profile?.medications?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
  const allergies = profile?.allergies?.split(",").map(s => s.trim()).filter(Boolean) ?? [];

  if (!authReady) {
    return (
      <div style={{ minHeight: "100vh", background: "#06060e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "2px solid rgba(124,58,237,0.3)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <title>Medi Bud AI — Health Dashboard</title>
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

        /* NAV */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(6,6,14,0.7); }
        .nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #fff; text-decoration: none; }
        .nav-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #7c3aed, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
        .nav-links { display: flex; align-items: center; gap: 24px; list-style: none; }
        .nav-links a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.8rem; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover, .nav-links a.active { color: #fff; }
        .nav-cta { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 8px 20px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 10px; color: #fff !important; font-weight: 600 !important; font-size: 0.78rem !important; box-shadow: 0 4px 14px rgba(124,58,237,0.4); transition: all 0.2s !important; }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.55) !important; }

        /* USER MENU */
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
        .dropdown-email { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dropdown-item { min-height: 44px; display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 14px; background: none; border: none; color: rgba(255,255,255,0.65); font-family: 'Sora', sans-serif; font-size: 0.8rem; border-radius: 10px; cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .dropdown-item.danger:hover { background: rgba(232,121,160,0.1); color: #f9a8d4; }

        /* PAGE */
        .page { position: relative; z-index: 1; padding: 100px 48px 60px; max-width: 1100px; margin: 0 auto; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.6s 0.4s ease both; }

        /* PAGE HEADER */
        .page-header { margin-bottom: 40px; }
        .page-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #a78bfa; margin-bottom: 8px; }
        .page-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 4vw, 2.8rem); color: #fff; letter-spacing: -0.02em; line-height: 1.1; }
        .page-title em { font-style: italic; background: linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .page-sub { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin-top: 8px; }

        /* GRID */
        .dash-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }

        /* CARDS */
        .dash-card { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; position: relative; overflow: hidden; transition: border-color 0.3s; }
        .dash-card:hover { border-color: rgba(124,58,237,0.25); }
        .dash-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 0% 0%, rgba(124,58,237,0.05), transparent 60%); pointer-events: none; }
        .dash-card-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; }

        /* SPAN HELPERS */
        .col-4 { grid-column: span 4; }
        .col-5 { grid-column: span 5; }
        .col-6 { grid-column: span 6; }
        .col-7 { grid-column: span 7; }
        .col-8 { grid-column: span 8; }
        .col-12 { grid-column: span 12; }

        /* STAT PILLS */
        .stat-row { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
        .stat-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px; }
        .stat-pill-val { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: #fff; line-height: 1; }
        .stat-pill-label { font-size: 0.68rem; color: rgba(255,255,255,0.35); margin-top: 4px; font-weight: 500; }

        /* TAGS */
        .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .tag { padding: 5px 12px; border-radius: 100px; font-size: 0.72rem; font-weight: 500; }
        .tag-red    { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.25); color: #fca5a5; }
        .tag-purple { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.25); color: #c4b5fd; }
        .tag-blue   { background: rgba(96,165,250,0.12);  border: 1px solid rgba(96,165,250,0.25);  color: #93c5fd; }
        .tag-empty  { font-size: 0.75rem; color: rgba(255,255,255,0.2); font-style: italic; }

        /* PROFILE INFO ROWS */
        .info-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .info-row:last-child { border-bottom: none; }
        .info-key { font-size: 0.75rem; color: rgba(255,255,255,0.35); font-weight: 500; }
        .info-val { font-size: 0.82rem; color: rgba(255,255,255,0.85); font-weight: 600; }

        /* SCORE CONTEXT */
        .score-breakdown { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
        .score-row { display: flex; align-items: center; gap: 10px; }
        .score-row-label { font-size: 0.72rem; color: rgba(255,255,255,0.4); flex: 1; }
        .score-bar-track { flex: 2; height: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 4px; transition: width 1.2s cubic-bezier(0.34,1.56,0.64,1); }
        .score-row-val { font-size: 0.7rem; color: rgba(255,255,255,0.5); width: 28px; text-align: right; }

        /* EDIT PROFILE BTN */
        .edit-btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; padding: 10px 20px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); border-radius: 12px; color: #a78bfa; font-family: 'Sora', sans-serif; font-size: 0.8rem; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; }
        .edit-btn:hover { background: rgba(124,58,237,0.25); border-color: rgba(124,58,237,0.5); color: #c4b5fd; transform: translateY(-1px); }

        /* NO PROFILE */
        .no-profile { text-align: center; padding: 60px 20px; }
        .no-profile h2 { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: #fff; margin-bottom: 10px; }
        .no-profile p { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin-bottom: 24px; }

        @media (max-width: 768px) {
          nav { padding: 14px 16px; }
          .nav-links { display: none; }
          .page { padding: 80px 16px 40px; }
          .col-4, .col-5, .col-6, .col-7, .col-8 { grid-column: span 12; }
          .user-avatar-btn span.user-name { display: none; }
        }
        @media (max-width: 480px) {
          .stat-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="blobs" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>


      <div className="page">
        {/* ── PAGE HEADER ── */}
        <div className="page-header fade-up">
          <p className="page-label">Health Overview</p>
          <h1 className="page-title">
            {user?.displayName ? `${user.displayName.split(" ")[0]}'s` : "Your"} <em>Dashboard</em>
          </h1>
          <p className="page-sub">
            {profile
              ? `Last updated ${profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "recently"}`
              : "Complete your health profile to see your dashboard"}
          </p>
        </div>

        {!profile ? (
          /* ── NO PROFILE STATE ── */
          <div className="dash-card no-profile fade-up-1">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <ClipboardList size={48} color="rgba(255,255,255,0.4)" />
            </div>
            <h2>No profile found</h2>
            <p>Complete your health survey to unlock your personalised dashboard.</p>
            <a href="/survey" className="edit-btn">Complete Survey →</a>
          </div>
        ) : (
          /* ── DASHBOARD GRID ── */
          <div className="dash-grid">

            {/* ── BMI GAUGE ── */}
            <div className="dash-card col-4 fade-up-1" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="dash-card-label">BMI Gauge</div>
              <BMIGauge bmi={bmi} />
              {bmi !== null && cat && (
                <div style={{ marginTop: 12, padding: "6px 16px", background: cat.bg, border: `1px solid ${cat.color}40`, borderRadius: 100, fontSize: "0.75rem", fontWeight: 600, color: cat.color }}>
                  BMI {bmi} · {cat.label}
                </div>
              )}
            </div>

            {/* ── HEALTH SCORE ── */}
            <div className="dash-card col-4 fade-up-2" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="dash-card-label">Health Score</div>
              <ScoreRing score={score} />
              <div className="score-breakdown" style={{ width: "100%" }}>
                {[
                  { label: "BMI",        val: bmi !== null ? (bmi >= 18.5 && bmi < 25 ? 100 : bmi < 30 ? 60 : 30) : 50, color: "#60a5fa" },
                  { label: "Conditions", val: Math.max(0, 100 - issues.length * 25),  color: "#a78bfa" },
                  { label: "Medications",val: Math.max(0, 100 - meds.length * 15),    color: "#f472b6" },
                ].map((item) => (
                  <div key={item.label} className="score-row">
                    <span className="score-row-label">{item.label}</span>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${item.val}%`, background: item.color }} />
                    </div>
                    <span className="score-row-val">{item.val}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── BODY METRICS ── */}
            <div className="dash-card col-4 fade-up-3">
              <div className="dash-card-label">Body Metrics</div>
              <div className="stat-row">
                <div className="stat-pill">
                  <div className="stat-pill-val">{profile.age || "—"}</div>
                  <div className="stat-pill-label">Age (years)</div>
                </div>
                <div className="stat-pill">
                  <div className="stat-pill-val">{profile.gender || "—"}</div>
                  <div className="stat-pill-label">Gender</div>
                </div>
                <div className="stat-pill">
                  <div className="stat-pill-val">{profile.heightCm ? `${profile.heightCm}` : "—"}</div>
                  <div className="stat-pill-label">Height (cm)</div>
                </div>
                <div className="stat-pill">
                  <div className="stat-pill-val">{profile.weightKg ? `${profile.weightKg}` : "—"}</div>
                  <div className="stat-pill-label">Weight (kg)</div>
                </div>
              </div>
            </div>

            {/* ── CONDITIONS ── */}
            <div className="dash-card col-6 fade-up-2">
              <div className="dash-card-label">Active Conditions</div>
              {issues.length > 0 ? (
                <div className="tag-list">
                 {issues.map((issue, i) => (
  <span key={i} className="tag tag-red">{issue}</span>
))}
                </div>
              ) : (
                <span className="tag-empty">No conditions listed</span>
              )}

              <div className="dash-card-label" style={{ marginTop: 20 }}>Current Medications</div>
              {meds.length > 0 ? (
                <div className="tag-list">
                 {meds.map((med, i) => (
  <span key={i} className="tag tag-purple">{med}</span>
))}
                </div>
              ) : (
                <span className="tag-empty">No medications listed</span>
              )}
            </div>

            {/* ── ALLERGIES + QUICK ACTIONS ── */}
            <div className="dash-card col-6 fade-up-3">
              <div className="dash-card-label">Allergies</div>
              {allergies.length > 0 ? (
                <div className="tag-list">
                 {allergies.map((a, i) => (
  <span key={i} className="tag tag-blue">{a}</span>
))}
                </div>
              ) : (
                <span className="tag-empty">No allergies listed</span>
              )}

              <div className="dash-card-label" style={{ marginTop: 20 }}>Quick Actions</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="/chat" className="edit-btn" style={{ marginTop: 0 }}>
  <MessageCircle size={14} strokeWidth={1.5} /> Ask Medi Bud
</a>
<a href="/survey" className="edit-btn" style={{ marginTop: 0 }}>
  <UserIcon size={14} strokeWidth={1.5} /> Edit Profile
</a>
<button className="edit-btn danger" style={{ marginTop: 0, border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5", background: "rgba(248,113,113,0.1)" }} onClick={handleFindClinics}>
  <MapPin size={14} strokeWidth={1.5} /> Find Nearby Care
</button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}