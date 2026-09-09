"use client";


import { useEffect, useState, Fragment } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { auth, db } from "@/lib/firebase";

type SurveyData = {
    age: string;
    gender: string;
    heightCm: string;
    weightKg: string;
    healthIssues: string;
    medications: string;
    allergies: string;
};

const STEPS = ["Personal", "Body", "Health"];

export default function SurveyPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState<SurveyData>({
        age: "", gender: "", heightCm: "", weightKg: "",
        healthIssues: "", medications: "", allergies: "",
    });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (!u) { router.push("/login"); return; }
            setUser(u);
            setAuthReady(true);
            // Check if profile already exists
            const snap = await getDoc(doc(db, "profiles", u.uid));
            if (snap.exists()) {
                const data = snap.data() as SurveyData;
                setForm(data);
                setIsEdit(true);
            }
        });
        return () => unsub();
    }, [router]);

    const set = (field: keyof SurveyData, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        if (!user) return;
        setSaving(true);
        await setDoc(doc(db, "profiles", user.uid), {
            ...form,
            updatedAt: new Date().toISOString(),
        });
        setSaving(false);
        router.push("/chat");
    };

    if (!authReady) {
        return (
            <div style={{ minHeight: "100vh", background: "#06060e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 40, height: 40, border: "2px solid rgba(124,58,237,0.3)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
        );
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060e; font-family: 'Sora', sans-serif; color: rgba(255,255,255,0.88); }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Focus styles for keyboard navigation */
        *:focus-visible { outline: 2px solid rgba(124,58,237,0.8); outline-offset: 2px; }

        .sv-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          position: relative; overflow: hidden;
        }

        .sv-blob {
          position: fixed; border-radius: 50%; filter: blur(100px);
          opacity: 0.15; pointer-events: none; z-index: 0;
        }
        .sv-blob-1 { width: 600px; height: 600px; background: #7c3aed; top: -200px; left: -200px; }
        .sv-blob-2 { width: 400px; height: 400px; background: #2563eb; bottom: -100px; right: -100px; }

        .sv-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 520px;
          background: #0d0d1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 28px;
          padding: 40px 40px 36px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
          animation: fadeUp 0.5s ease both;
        }

        .sv-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem; color: #fff;
          margin-bottom: 32px;
        }
        .sv-logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(124,58,237,0.4);
        }

        /* PROGRESS */
        .sv-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
        .sv-step {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 600;
          color: rgba(255,255,255,0.3);
          transition: color 0.3s;
        }
        .sv-step.active { color: #a78bfa; }
        .sv-step.done { color: #22c55e; }
        .sv-step-num {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s;
        }
        .sv-step.active .sv-step-num { background: rgba(124,58,237,0.3); border-color: #7c3aed; color: #a78bfa; }
        .sv-step.done .sv-step-num { background: rgba(34,197,94,0.2); border-color: #22c55e; color: #22c55e; }
        .sv-step-divider { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }

        .sv-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.6rem; color: #fff;
          letter-spacing: -0.02em; line-height: 1.2;
          margin-bottom: 6px;
        }
        .sv-sub { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 28px; }

        /* FIELDS */
        .sv-field { margin-bottom: 18px; }
        .sv-label {
          display: block; font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-bottom: 8px; cursor: pointer;
        }
        .sv-input, .sv-select, .sv-textarea {
          min-height: 44px;
          width: 100%; padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #fff;
          font-family: 'Sora', sans-serif; font-size: 0.85rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .sv-input:focus, .sv-select:focus, .sv-textarea:focus {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .sv-input::placeholder, .sv-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .sv-select option { background: #13121f; color: #fff; }
        .sv-textarea { resize: none; min-height: 80px; line-height: 1.6; }

        .sv-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* GENDER PILLS */
        .sv-gender-row { display: flex; gap: 10px; }
        .sv-gender-pill {
          min-height: 44px;
          flex: 1; padding: 10px; text-align: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: rgba(255,255,255,0.5);
          font-family: 'Sora', sans-serif; font-size: 0.82rem;
          font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .sv-gender-pill:hover { border-color: rgba(124,58,237,0.3); color: #fff; }
        .sv-gender-pill.selected {
          background: rgba(124,58,237,0.2);
          border-color: #7c3aed; color: #a78bfa;
        }

        /* BUTTONS */
        .sv-actions { display: flex; gap: 12px; margin-top: 28px; }
        .sv-btn-primary {
          min-height: 44px;
          flex: 1; padding: 13px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none; border-radius: 14px;
          color: #fff; font-family: 'Sora', sans-serif;
          font-size: 0.88rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
        }
        .sv-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,58,237,0.55); }
        .sv-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .sv-btn-ghost {
          min-height: 44px;
          padding: 13px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: rgba(255,255,255,0.5);
          font-family: 'Sora', sans-serif; font-size: 0.88rem;
          cursor: pointer; transition: all 0.2s;
        }
        .sv-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        .sv-skip {
          text-align: center; margin-top: 16px;
          font-size: 0.72rem; color: rgba(255,255,255,0.25);
        }
        .sv-skip a { color: rgba(255,255,255,0.4); cursor: pointer; text-decoration: underline; }
        .sv-skip a:hover { color: #fff; }

        @media (max-width: 560px) {
          .sv-card { padding: 28px 20px 24px; border-radius: 20px; }
          .sv-row { grid-template-columns: 1fr; gap: 0; }
          .sv-title { font-size: 1.3rem; }
        }
      `}</style>

            <div className="sv-root">
                <div className="sv-blob sv-blob-1" aria-hidden="true" />
                <div className="sv-blob sv-blob-2" aria-hidden="true" />

                <div className="sv-card">
                    {/* Logo */}
                    <div className="sv-logo">
                        <div className="sv-logo-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2z" />
                            </svg>
                        </div>
                        Medi Bud AI
                    </div>

                    {/* Progress */}
                    <div className="sv-progress">
                        {STEPS.map((s, i) => (
                            <Fragment key={s}>
                                <div className={`sv-step ${i === step ? "active" : i < step ? "done" : ""}`}>
                                    <div className="sv-step-num">{i < step ? <Check size={12} strokeWidth={3} /> : i + 1}</div>
                                    {s}
                                </div>
                                {i < STEPS.length - 1 && <div className="sv-step-divider" />}
                            </Fragment>
                        ))}
                    </div>

                    {/* ── STEP 0: Personal ── */}
                    {step === 0 && (
                        <>
                            <h2 className="sv-title">{isEdit ? "Update your profile" : "Tell us about yourself"}</h2>
                            <p className="sv-sub">This helps us personalise your health guidance.</p>

                            <div className="sv-field">
                                <label className="sv-label" htmlFor="age-input">Age</label>
                                <input id="age-input" className="sv-input" type="number" placeholder="e.g. 28" value={form.age} onChange={(e) => set("age", e.target.value)} />
                            </div>

                            <div className="sv-field">
                                <label className="sv-label">Gender</label>
                                <div className="sv-gender-row">
                                    {["Male", "Female", "Other"].map((g) => (
                                        <button key={g} className={`sv-gender-pill ${form.gender === g ? "selected" : ""}`} onClick={() => set("gender", g)}>{g}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="sv-actions">
                                <button className="sv-btn-primary" onClick={() => setStep(1)}>Continue →</button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 1: Body ── */}
                    {step === 1 && (
                        <>
                            <h2 className="sv-title">Your body metrics</h2>
                            <p className="sv-sub">Used to calculate BMI and tailor dietary advice.</p>

                            <div className="sv-row">
                                <div className="sv-field">
                                    <label className="sv-label" htmlFor="height-input">Height (cm)</label>
                                    <input id="height-input" className="sv-input" type="number" placeholder="e.g. 170" value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} />
                                </div>
                                <div className="sv-field">
                                    <label className="sv-label" htmlFor="weight-input">Weight (kg)</label>
                                    <input id="weight-input" className="sv-input" type="number" placeholder="e.g. 65" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} />
                                </div>
                            </div>

                            <div className="sv-actions">
                                <button className="sv-btn-ghost" onClick={() => setStep(0)}>← Back</button>
                                <button className="sv-btn-primary" onClick={() => setStep(2)}>Continue →</button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 2: Health ── */}
                    {step === 2 && (
                        <>
                            <h2 className="sv-title">Your health profile</h2>
                            <p className="sv-sub">Be as specific or brief as you like. You can update this anytime.</p>

                            <div className="sv-field">
                                <label className="sv-label" htmlFor="health-issues">Prevailing Health Issues</label>
                                <textarea id="health-issues" className="sv-textarea" placeholder="e.g. Type 2 Diabetes, PCOS, Hypertension..." value={form.healthIssues} onChange={(e) => set("healthIssues", e.target.value)} />
                            </div>

                            <div className="sv-field">
                                <label className="sv-label" htmlFor="medications">Current Medications</label>
                                <textarea id="medications" className="sv-textarea" placeholder="e.g. Metformin 500mg, Lisinopril..." value={form.medications} onChange={(e) => set("medications", e.target.value)} />
                            </div>

                            <div className="sv-field">
                                <label className="sv-label" htmlFor="allergies">Allergies</label>
                                <input id="allergies" className="sv-input" type="text" placeholder="e.g. Penicillin, Peanuts, Latex..." value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
                            </div>

                            <div className="sv-actions">
                                <button className="sv-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                                <button className="sv-btn-primary" disabled={saving} onClick={handleSubmit}>
                                    {saving ? "Saving..." : isEdit ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Save Changes <Check size={16} strokeWidth={2.5} /></span> : "Complete Setup →"}
                                </button>
                            </div>
                        </>
                    )}

                    {!isEdit && (
                        <p className="sv-skip">
                            <a href="#" aria-label="Skip filling profile and go to chat" onClick={(e) => { e.preventDefault(); router.push("/chat"); }}>Skip for now</a> — you can fill this in later from settings
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}