"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Stethoscope, AlertTriangle } from "lucide-react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ── KEY FIX: only redirect if user was ALREADY signed in before arriving ──
    // We use a flag so that sign-in actions we trigger ourselves don't get
    // caught by this listener and cause a double-redirect.
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!authChecked) {
                // First resolution — if user already has a session, send them home
                setAuthChecked(true);
                if (user) {
                    window.location.href = "./";
                }
            }
            // After the first check we ignore further state changes here.
            // Redirects after login are handled explicitly in the action handlers.
        });
        return () => unsub();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Redirect helper (called ONLY after a successful login action) ──────────
    const redirectAfterAuth = async (isNew = false) => {
        sessionStorage.setItem("medibud_just_authed", "true");
        sessionStorage.setItem("medibud_is_new", String(isNew));

        if (isNew) {
            // Check if they already filled the survey before
            const snap = await getDoc(doc(db, "profiles", auth.currentUser!.uid));
            if (snap.exists()) {
                // Profile already exists — skip survey
                window.location.href = "/";
            } else {
                // Brand new user — show survey
                window.location.href = "/survey";
            }
        } else {
            window.location.href = "/";
        }
    };

    // AFTER
    // AFTER
    const friendlyError = (code: string) => {
        const map: Record<string, string> = {
            "auth/invalid-email": "Please enter a valid email address.",
            "auth/user-not-found": "No account found with that email.",
            "auth/wrong-password": "...",
            "auth/email-already-in-use": "...",
            "auth/weak-password": "...",
            "auth/popup-closed-by-user": "...",
            "auth/too-many-requests": "...",
            "auth/invalid-credential": "Invalid credentials. Please check and try again.",
        };
        return map[code] || "Something went wrong. Please try again.";
    };

    // ── Email / password ───────────────────────────────────────────────────────
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
                redirectAfterAuth(false);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                redirectAfterAuth(true);
            }
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code ?? "";
            setError(friendlyError(code));
            setLoading(false);
        }
    };

    // ── Google ─────────────────────────────────────────────────────────────────
    const handleGoogle = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const isNew =
                result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
            redirectAfterAuth(isNew);
        }
        catch (err: unknown) {
            const code = (err as { code?: string })?.code ?? "";
            setError(friendlyError(code));
            setLoading(false);
        }
    };

    return (
        <>
            <title>Medi Bud AI — {mode === "login" ? "Sign In" : "Create Account"}</title>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Space+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --ink: #06060e; --surface: #0d0d1a; --surface2: #13121f;
          --violet: #7c3aed; --indigo: #4f46e5; --cyan: #2563eb; --rose: #e879a0;
          --text: rgba(255,255,255,0.88); --muted: rgba(255,255,255,0.4);
          --faint: rgba(255,255,255,0.06); --border: rgba(255,255,255,0.1);
        }

        body {
          background: var(--ink); color: var(--text);
          font-family: 'Sora', sans-serif; overflow-x: hidden;
          line-height: 1.6; min-height: 100vh;
          display: flex; flex-direction: column;
        }
        body::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.5;
        }

        .blobs { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.18; }
        .blob-1 { width: 700px; height: 700px; background: #7c3aed; top: -200px; left: -200px; animation: float1 18s ease-in-out infinite alternate; }
        .blob-2 { width: 500px; height: 500px; background: #2563eb; bottom: -150px; right: -150px; animation: float2 22s ease-in-out infinite alternate; }
        .blob-3 { width: 400px; height: 400px; background: #e879a0; top: 40%; left: 50%; animation: float3 15s ease-in-out infinite alternate; }
        @keyframes float1 { to { transform: translate(100px,80px); } }
        @keyframes float2 { to { transform: translate(-80px,-100px); } }
        @keyframes float3 { to { transform: translate(60px,-60px); } }
        
        /* Focus styles for keyboard navigation */
        *:focus-visible { outline: 2px solid rgba(124,58,237,0.8); outline-offset: 2px; }




        .page { position: relative; z-index: 1; flex: 1; display: flex; align-items: center; justify-content: center; padding: 100px 24px 60px; }

        .card {
          width: 100%; max-width: 440px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 28px; padding: 48px 40px 44px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          position: relative; overflow: hidden;
          opacity: 0; transform: translateY(24px);
          animation: fadeUp 0.65s 0.1s ease both;
        }
        .card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at top, rgba(124,58,237,0.07), transparent 65%); pointer-events: none; }

        .card-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); border-radius: 100px; font-size: 0.68rem; font-weight: 600; color: #a78bfa; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 28px; }
        .badge-dot { width: 5px; height: 5px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 5px #22c55e; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;}50%{opacity:0.3;} }

        .card-title { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 8px; }
        .card-title em { font-style: italic; background: linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-sub { font-size: 0.82rem; color: var(--muted); margin-bottom: 32px; line-height: 1.55; }

        .btn-google { min-height: 44px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 14px; color: rgba(255,255,255,0.8); font-family: 'Sora',sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.25s; margin-bottom: 24px; }
        .btn-google:hover:not(:disabled) { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #fff; }
        .btn-google:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-google svg { width: 18px; height: 18px; flex-shrink: 0; }

        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .divider::before,.divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .divider span { font-size: 0.7rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }

        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 8px; cursor: pointer; }
        .form-input { min-height: 44px; width: 100%; padding: 13px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; color: #fff; font-family: 'Sora',sans-serif; font-size: 0.88rem; outline: none; transition: all 0.2s; }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input:focus { border-color: rgba(124,58,237,0.55); background: rgba(124,58,237,0.05); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }

        .error-msg { display: flex; align-items: center; gap: 8px; padding: 11px 15px; background: rgba(232,121,160,0.1); border: 1px solid rgba(232,121,160,0.25); border-radius: 10px; font-size: 0.78rem; color: #f9a8d4; margin-bottom: 16px; animation: fadeUp 0.3s ease both; }

        .btn-primary { min-height: 44px; width: 100%; padding: 14px 20px; background: linear-gradient(135deg,var(--violet),var(--indigo)); border: none; border-radius: 14px; color: #fff; font-family: 'Sora',sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.25s; box-shadow: 0 6px 20px rgba(124,58,237,0.4); margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(124,58,237,0.55); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .toggle-row { text-align: center; margin-top: 24px; font-size: 0.8rem; color: var(--muted); }
        .toggle-btn { background: none; border: none; padding: 0; color: #a78bfa; font-family: 'Sora',sans-serif; font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline; transition: color 0.2s; }
        .toggle-btn:hover { color: #c4b5fd; }

        footer { position: relative; z-index: 1; padding: 24px 48px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-note { font-size: 0.68rem; color: rgba(255,255,255,0.2); }
        .footer-logo { font-family: 'DM Serif Display',serif; font-size: 1rem; color: rgba(255,255,255,0.4); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }

        @media (max-width: 480px) {
          .page { padding: 80px 16px 40px; }
          .card { padding: 32px 22px 30px; border-radius: 20px; }
          .card-title { font-size: 1.6rem; }
          footer { padding: 20px 16px; flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>

            <div className="blobs" aria-hidden="true">
                <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
            </div>



            <main className="page">
                <div className="card">
                    <div className="card-badge">
                        <span className="badge-dot" />
                        {mode === "login" ? "Welcome back" : "Get started free"}
                    </div>

                    <h1 className="card-title">
                        {mode === "login" ? <>Sign in to <em>Medi Bud</em></> : <>Create your <em>account</em></>}
                    </h1>
                    <p className="card-sub">
                        {mode === "login"
                            ? "Continue your health journey where you left off."
                            : "Join Medi Bud AI — your personalised health companion."}
                    </p>

                    {/* Google sign-in */}
                    <button className="btn-google" onClick={handleGoogle} disabled={loading}>
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="divider"><span>or</span></div>

                    {error && <div className="error-msg" role="alert" aria-live="polite"><span><AlertTriangle size={16} /></span> {error}</div>}

                    <form onSubmit={handleEmailAuth}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email-input">Email Address</label>
                            <input
                                id="email-input"
                                className="form-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password-input">Password</label>
                            <input
                                id="password-input"
                                className="form-input"
                                type="password"
                                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn-primary" type="submit" disabled={loading}>
                            {loading
                                ? <><span className="spinner" /> Please wait…</>
                                : mode === "login" ? "Sign In →" : "Create Account →"}
                        </button>
                    </form>

                    <div className="toggle-row">
                        {mode === "login" ? (
                            <>Don't have an account?{" "}
                                <button className="toggle-btn" onClick={() => { setMode("signup"); setError(""); }}>
                                    Sign up free
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{" "}
                                <button className="toggle-btn" onClick={() => { setMode("login"); setError(""); }}>
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <footer>
                <span className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Stethoscope size={16} /> Medi Bud AI</span>
                <p className="footer-note">For informational purposes only · Not a substitute for professional medical advice</p>
            </footer>
        </>
    );
}