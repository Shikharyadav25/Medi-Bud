"use client";
import { useEffect, useState } from "react";
import { Droplets, Flower2, Heart, Scale, Sparkles, Brain, MessageCircle, Shield, Zap, Stethoscope, Search, LogOut, CheckCircle, Info, Mic, Camera, Calendar, MapPin } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u && sessionStorage.getItem("cureme_just_authed")) {
        const isNew = sessionStorage.getItem("cureme_is_new") === "true";
        setToast({
          type: "success",
          message: isNew
            ? `Welcome to CureMe, ${u.displayName || u.email}!`
            : `Welcome back, ${u.displayName?.split(" ")[0] || u.email?.split("@")[0]}!`,
        });
        sessionStorage.removeItem("cureme_just_authed");
        sessionStorage.removeItem("cureme_is_new");
        setTimeout(() => setToast(null), 4000);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
    setDropdownOpen(false);
    setToast({ type: "info", message: "You've been signed out." });
    setTimeout(() => setToast(null), 3000);
  };

  const getInitials = (u: User) => {
    if (u.displayName) {
      const parts = u.displayName.trim().split(" ");
      return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
    }
    return u.email?.[0]?.toUpperCase() ?? "?";
  };


  return (
    <>
      <title>{`CureMe AI — Your AI Health Companion`}</title>
      <style>{`
  :root {
    --ink: #06060e; --surface: #0d0d1a; --surface2: #13121f;
    --violet: #7c3aed; --indigo: #4f46e5; --cyan: #2563eb; --rose: #e879a0;
    --text: rgba(255,255,255,0.88); --muted: rgba(255,255,255,0.4);
    --faint: rgba(255,255,255,0.06); --border: rgba(255,255,255,0.1);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: var(--ink); color: var(--text); font-family: 'Sora', sans-serif; overflow-x: hidden; line-height: 1.6; }
  body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; opacity: 0.5; }

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

  /* NAV */
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); background: rgba(6,6,14,0.6); }
  .nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: #fff; text-decoration: none; }
  .nav-logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, var(--violet), var(--cyan)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
  .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .nav-links a { color: var(--muted); text-decoration: none; font-size: 0.82rem; font-weight: 500; letter-spacing: 0.04em; transition: color 0.2s; }
  .nav-links a:hover { color: #fff; }
  .nav-cta { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 9px 22px; background: linear-gradient(135deg, var(--violet), var(--indigo)); border-radius: 10px; color: #fff !important; font-weight: 600 !important; font-size: 0.8rem !important; box-shadow: 0 4px 14px rgba(124,58,237,0.4); transition: all 0.2s !important; text-decoration: none; }
  .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.55) !important; }
  .nav-login-ghost { min-height: 44px; display: inline-flex; align-items: center; padding: 9px 18px; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: rgba(255,255,255,0.65) !important; font-size: 0.8rem !important; font-weight: 500 !important; text-decoration: none; transition: all 0.2s; }
  .nav-login-ghost:hover { border-color: rgba(255,255,255,0.3) !important; color: #fff !important; background: rgba(255,255,255,0.04); }

  /* mobile auth slot — hidden on desktop, shown on mobile */
  .mobile-nav-auth { display: none; }

  /* AUTH SKELETON */
  .nav-auth-placeholder { width: 130px; height: 36px; background: rgba(255,255,255,0.04); border-radius: 100px; animation: shimmer 1.5s ease infinite; }
  @keyframes shimmer { 0%,100%{opacity:0.4;} 50%{opacity:0.8;} }

  /* USER MENU */
  .user-menu { position: relative; }
  .user-avatar-btn { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; background: rgba(255,255,255,0.06); border: 1px solid var(--border); border-radius: 100px; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.8); font-size: 0.8rem; font-weight: 500; font-family: 'Sora', sans-serif; }
  .user-avatar-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(124,58,237,0.4); }
  .user-avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--violet), var(--cyan)); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0; }
  .user-photo { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .user-chevron { width: 14px; height: 14px; opacity: 0.5; transition: transform 0.2s; }
  .user-chevron.open { transform: rotate(180deg); }

  /* DROPDOWN */
  .user-dropdown { position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px; background: var(--surface2); border: 1px solid var(--border); border-radius: 16px; padding: 8px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); animation: dropIn 0.18s ease both; z-index: 200; }
  @keyframes dropIn { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
  .dropdown-header { padding: 12px 14px 10px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
  .dropdown-name { font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dropdown-email { font-size: 0.7rem; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dropdown-item { min-height: 44px; display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 14px; background: none; border: none; color: rgba(255,255,255,0.65); font-family: 'Sora', sans-serif; font-size: 0.8rem; border-radius: 10px; cursor: pointer; transition: all 0.15s; text-decoration: none; }
  .dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .dropdown-item.danger:hover { background: rgba(232,121,160,0.1); color: #f9a8d4; }
  .dropdown-item-icon { font-size: 14px; opacity: 0.7; }

  /* TOAST */
  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 999; display: flex; align-items: center; gap: 10px; padding: 13px 22px; border-radius: 100px; font-size: 0.82rem; font-weight: 500; box-shadow: 0 12px 40px rgba(0,0,0,0.5); white-space: nowrap; animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
  .toast.success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }
  .toast.info { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: #c4b5fd; }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(16px);}to{opacity:1;transform:translateX(-50%) translateY(0);} }

  /* HERO USER PILL */
  .hero-user-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px 6px 8px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); border-radius: 100px; font-size: 0.72rem; font-weight: 600; color: #86efac; margin-bottom: 20px; animation: fadeUp 0.6s 0.05s ease both; }
  .hero-user-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 6px #22c55e; animation: pulse-dot 2s ease-in-out infinite; }

  section { position: relative; z-index: 1; }
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 80px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.35); border-radius: 100px; font-size: 0.72rem; font-weight: 600; color: #a78bfa; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 32px; animation: fadeUp 0.6s ease both; }
  .hero-badge-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 6px #22c55e; animation: pulse-dot 2s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100%{opacity:1;}50%{opacity:0.3;} }
  .hero-title { font-family: 'DM Serif Display', serif; font-size: clamp(3rem,8vw,6.5rem); line-height: 1.05; letter-spacing: -0.02em; color: #fff; animation: fadeUp 0.7s 0.1s ease both; }
  .hero-title em { font-style: italic; background: linear-gradient(135deg,#a78bfa,#60a5fa,#f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { max-width: 520px; margin: 24px auto 48px; font-size: 1rem; color: var(--muted); font-weight: 400; line-height: 1.7; animation: fadeUp 0.7s 0.2s ease both; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; animation: fadeUp 0.7s 0.3s ease both; }
  .btn-primary { min-height: 44px; display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: linear-gradient(135deg,var(--violet),var(--indigo)); border-radius: 14px; color: #fff; font-family: 'Sora',sans-serif; font-size: 0.9rem; font-weight: 600; text-decoration: none; box-shadow: 0 6px 24px rgba(124,58,237,0.45); transition: all 0.25s; cursor: pointer; border: none; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124,58,237,0.6); }
  .btn-ghost { min-height: 44px; display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: transparent; border: 1px solid var(--border); border-radius: 14px; color: rgba(255,255,255,0.7); font-family: 'Sora',sans-serif; font-size: 0.9rem; font-weight: 500; text-decoration: none; transition: all 0.25s; cursor: pointer; }
  .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; background: rgba(255,255,255,0.04); }
  .hero-visual { margin-top: 80px; width: 100%; max-width: 700px; background: var(--surface); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05); animation: fadeUp 0.8s 0.4s ease both; }
  .hero-visual-bar { display: flex; align-items: center; gap: 8px; padding: 14px 20px; border-bottom: 1px solid var(--faint); background: rgba(255,255,255,0.02); }
  .hv-dot { width: 10px; height: 10px; border-radius: 50%; }
  .hv-dot:nth-child(1){background:#ff5f57;} .hv-dot:nth-child(2){background:#ffbd2e;} .hv-dot:nth-child(3){background:#28c840;}
  .hv-label { margin-left: auto; font-size: 0.7rem; color: var(--muted); font-family: 'Space Mono',monospace; }
  .hero-visual-chat { padding: 24px 24px 32px; display: flex; flex-direction: column; gap: 14px; }
  .hv-msg { display: flex; gap: 10px; align-items: flex-end; opacity: 0; animation: fadeUp 0.5s ease both; }
  .hv-msg.user { flex-direction: row-reverse; }
  .hv-msg:nth-child(1){animation-delay:1s;} .hv-msg:nth-child(2){animation-delay:1.6s;} .hv-msg:nth-child(3){animation-delay:2.2s;} .hv-msg:nth-child(4){animation-delay:2.8s;}
  .hv-avatar { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .hv-avatar.ai { background: linear-gradient(135deg,var(--violet),var(--cyan)); }
  .hv-avatar.user { background: rgba(255,255,255,0.1); }
  .hv-bubble { padding: 10px 15px; border-radius: 16px; font-size: 0.8rem; line-height: 1.55; max-width: 75%; }
  .hv-bubble.ai { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); border-bottom-left-radius: 4px; text-align: left; }
  .hv-bubble.user { background: linear-gradient(135deg,var(--violet),var(--indigo)); color: #fff; border-bottom-right-radius: 4px; text-align: left; }

  .features { padding: 100px 24px; }
  .section-label { text-align: center; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #a78bfa; margin-bottom: 16px; }
  .section-title { text-align: center; font-family: 'DM Serif Display',serif; font-size: clamp(2rem,5vw,3.2rem); color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 60px; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
  .feature-card { padding: 32px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; transition: all 0.3s; position: relative; overflow: hidden; }
  .feature-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%,rgba(124,58,237,0.08),transparent 70%); opacity: 0; transition: opacity 0.3s; }
  .feature-card:hover { transform: translateY(-4px); border-color: rgba(124,58,237,0.3); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
  .feature-icon.violet{background:rgba(124,58,237,0.2);} .feature-icon.cyan{background:rgba(37,99,235,0.2);} .feature-icon.rose{background:rgba(232,121,160,0.2);} .feature-icon.green{background:rgba(34,197,94,0.2);}
  .feature-title { font-family: 'DM Serif Display',serif; font-size: 1.15rem; color: #fff; margin-bottom: 10px; }
  .feature-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.7; }
  .conditions { padding: 80px 24px; background: linear-gradient(180deg,transparent,rgba(124,58,237,0.04) 50%,transparent); }
  .conditions-grid { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; max-width: 700px; margin: 0 auto; }
  .condition-pill { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 14px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 100px; font-size: 0.88rem; font-weight: 500; color: rgba(255,255,255,0.75); cursor: pointer; transition: all 0.2s; }
.condition-pill:hover { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.4); color: #fff; transform: scale(1.04); }
  .how { padding: 100px 24px; }
  .how-steps { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 0; max-width: 900px; margin: 0 auto; position: relative; }
  .how-steps::before { content: ''; position: absolute; top: 32px; left: calc(16.6% + 24px); right: calc(16.6% + 24px); height: 1px; background: linear-gradient(90deg,transparent,rgba(124,58,237,0.4),rgba(37,99,235,0.4),transparent); }
  .how-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 24px; gap: 16px; }
  .how-step-num { width: 64px; height: 64px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; font-family: 'Space Mono',monospace; font-size: 1.1rem; color: #a78bfa; position: relative; z-index: 1; }
  .how-step-title { font-family: 'DM Serif Display',serif; font-size: 1rem; color: #fff; }
  .how-step-desc { font-size: 0.78rem; color: var(--muted); line-height: 1.65; }
  .stats { padding: 80px 24px; display: flex; justify-content: center; }
  .stats-inner { display: flex; flex-wrap: wrap; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; max-width: 800px; width: 100%; }
  .stat { flex: 1; min-width: 160px; padding: 40px 32px; background: var(--surface); text-align: center; }
  .stat-num { font-family: 'DM Serif Display',serif; font-size: 2.6rem; color: #fff; line-height: 1; background: linear-gradient(135deg,#a78bfa,#60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .stat-label { font-size: 0.75rem; color: var(--muted); margin-top: 8px; font-weight: 500; }
  .cta-section { padding: 100px 24px 120px; text-align: center; position: relative; }
  .cta-section::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 400px; background: radial-gradient(ellipse,rgba(124,58,237,0.15) 0%,transparent 70%); pointer-events: none; }
  .cta-card { max-width: 620px; margin: 0 auto; padding: 60px 48px; background: var(--surface); border: 1px solid var(--border); border-radius: 28px; position: relative; overflow: hidden; }
  .cta-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(124,58,237,0.06),rgba(37,99,235,0.06)); }
  .cta-card h2 { font-family: 'DM Serif Display',serif; font-size: clamp(1.8rem,4vw,2.8rem); color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 16px; position: relative; }
  .cta-card p { font-size: 0.9rem; color: var(--muted); margin-bottom: 36px; position: relative; }
  .cta-card .btn-primary { position: relative; font-size: 1rem; padding: 16px 40px; }
  footer { padding: 40px 48px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; position: relative; z-index: 1; }
  .footer-logo { display: flex; align-items: center; gap: 10px; font-family: 'DM Serif Display',serif; font-size: 1.1rem; color: rgba(255,255,255,0.6); }
  .footer-note { font-size: 0.72rem; color: rgba(255,255,255,0.2); letter-spacing: 0.02em; }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 0.75rem; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: #fff; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease,transform 0.6s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }

 @media (max-width: 768px) {
  /* NAV */
  nav { padding: 12px 16px; }
  .nav-links { display: none !important; }
  .mobile-nav-auth { display: flex !important; align-items: center; gap: 8px; }
  .nav-cta { padding: 8px 14px; font-size: 0.75rem !important; }
  .nav-login-ghost { padding: 8px 12px; font-size: 0.75rem !important; }

  /* HERO */
  .hero { min-height: 100svh; padding: 110px 20px 60px; text-align: center; }
  .hero-user-pill { font-size: 0.68rem; padding: 5px 12px 5px 8px; }
  .hero-badge { font-size: 0.65rem; padding: 5px 12px; }
  .hero-title { font-size: clamp(2.2rem, 10vw, 3rem); line-height: 1.08; }
  .hero-sub { font-size: 0.85rem; margin: 16px auto 28px; max-width: 100%; }
  .hero-actions { flex-direction: column; align-items: center; width: 100%; gap: 12px; }
  .btn-primary, .btn-ghost, .btn-symptom { width: 100%; justify-content: center; padding: 14px 24px !important; font-size: 0.88rem !important; border-radius: 12px; box-sizing: border-box; }
  .hero-visual { display: block; margin-top: 40px; border-radius: 16px; }
  .hero-visual-chat { padding: 16px 14px 20px; gap: 12px; }
  .hv-msg { gap: 8px; }
  .hv-bubble { font-size: 0.72rem; max-width: 82%; padding: 10px 14px; line-height: 1.5; }
  .hv-avatar { width: 22px; height: 22px; }
  .hv-avatar svg { width: 11px; height: 11px; }
  /* FEATURES */
  .features { padding: 60px 16px; }
  .features-grid { grid-template-columns: 1fr; gap: 12px; }
  .feature-card { padding: 20px 18px; }
  .feature-icon { width: 40px; height: 40px; border-radius: 12px; margin-bottom: 14px; }
  .section-label { font-size: 0.6rem; }
  .section-title { font-size: clamp(1.5rem, 7vw, 2rem); margin-bottom: 32px; }

  /* CONDITIONS */
  .conditions { padding: 50px 16px; }
  .conditions-grid { gap: 10px; }
  .condition-pill { padding: 10px 16px; font-size: 0.8rem; }

  /* HOW */
  .how { padding: 60px 16px; }
  .how-steps { grid-template-columns: 1fr; gap: 28px; }
  .how-steps::before { display: none; }
  .how-step { padding: 0 16px; }

  /* STATS */
  .stats { padding: 40px 16px; }
  .stats-inner { flex-direction: column; gap: 1px; }
  .stat { min-width: unset; width: 100%; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; text-align: left; }
  .stat-num { font-size: 1.8rem; }
  .stat-label { margin-top: 0; margin-left: 12px; font-size: 0.78rem; }

  /* CTA */
  .cta-section { padding: 60px 16px 80px; }
  .cta-section::before { width: 300px; height: 200px; }
  .cta-card { padding: 36px 20px; border-radius: 20px; }
  .cta-card h2 { font-size: clamp(1.5rem, 6vw, 2rem); }
  .cta-card .btn-primary { width: 100%; justify-content: center; }

  /* FOOTER */
  footer { flex-direction: column; align-items: center; text-align: center; padding: 28px 16px; gap: 12px; }
  .footer-links { justify-content: center; flex-wrap: wrap; gap: 16px; }
  .footer-note { font-size: 0.68rem; }

  /* AUTH */
  .user-avatar-btn .user-name { display: none; }
  .user-dropdown { right: -8px; }

  /* TOAST */
  .toast { font-size: 0.75rem; padding: 11px 18px; max-width: 90vw; white-space: normal; text-align: center; bottom: 16px; }
}
  .btn-symptom {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #0f766e, #0891b2);
  border-radius: 14px;
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 6px 24px rgba(8,145,178,0.4);
  transition: all 0.25s;
  cursor: pointer;
  border: none;
}
.btn-symptom:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(8,145,178,0.55);
}

@media (max-width: 480px) {
  .hero-title { font-size: clamp(1.9rem, 9vw, 2.4rem); }
  .conditions-grid { flex-direction: column; align-items: stretch; }
  .condition-pill { justify-content: center; }
  .stats-inner { border-radius: 16px; }
}

@media (max-width: 380px) {
  .hero { padding-top: 100px; }
  .hero-title { font-size: 1.85rem; }
  .btn-primary, .btn-ghost { padding: 11px 18px; font-size: 0.8rem; }
  .nav-cta { padding: 7px 10px; font-size: 0.7rem !important; }
}
`}</style>

      <div className="blobs" aria-hidden="true">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === "success" ? <CheckCircle size={14} /> : <Info size={14} />}</span>
          {toast.message}
        </div>
      )}



      {/* ── HERO ── */}
      <section className="hero">


        <h1 className="hero-title">Your health,<br /><em>understood.</em></h1>
        <p className="hero-sub">
          Aapka apna AI health companion. It remembers your conditions, medications, and allergies to give you practical, everyday advice tailored for your household.
        </p>
        <div className="hero-actions">
          <a href="./chat" className="btn-primary">Start Chatting →</a>
          <a href="/symptoms" className="btn-symptom">
            <Search size={16} strokeWidth={1.5} /> Check Symptoms
          </a>

        </div>
        <div className="hero-visual">
          <div className="hero-visual-bar">
            <div className="hv-dot" /><div className="hv-dot" /><div className="hv-dot" />
            <span className="hv-label">CureMe AI — Health Chat</span>
          </div>
          <div className="hero-visual-chat">
            <div className="hv-msg user"><div className="hv-avatar user" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div><div className="hv-bubble user">What’s a simple dinner for a diabetic?</div></div>
            <div className="hv-msg"><div className="hv-avatar ai" aria-hidden="true">
              <Stethoscope size={13} strokeWidth={1.5} color="#fff" />
            </div><div className="hv-bubble ai"><strong>Smart Dinner Hacks:</strong><br />Skip the white rice and try bajra roti with an extra bowl of dal. Add a simple cucumber salad! <em>Always consult your doctor for personalized advice.</em></div></div>
            <div className="hv-msg user"><div className="hv-avatar user" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div><div className="hv-bubble user">Mujhe thodi khasi (cough) hai, kya karu?</div></div>
            <div className="hv-msg"><div className="hv-avatar ai" aria-hidden="true">
              <Stethoscope size={13} strokeWidth={1.5} color="#fff" />
            </div><div className="hv-bubble ai">Warm water with a pinch of haldi (turmeric) and some steam inhalation can give quick relief. If it lasts &gt;3 days, please see a doctor. <em>Always consult your doctor for personalized advice.</em></div></div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <p className="section-label reveal">What we offer</p>
        <h2 className="section-title reveal">Built around <em style={{ fontStyle: 'italic', color: '#a78bfa' }}>you</em>, not just your condition</h2>
        <div className="features-grid">
          <div className="feature-card reveal">
            <div className="feature-icon violet"><Brain size={22} strokeWidth={1.5} color="#a78bfa" /></div>
            <h3 className="feature-title">Knows Your Full Profile</h3>
            <p className="feature-desc">Age, BMI, medications, allergies — every response is built around your unique health picture. Your conditions like Diabetes or PCOS directly shape the advice you receive.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon cyan"><MessageCircle size={22} strokeWidth={1.5} color="#60a5fa" /></div>
            <h3 className="feature-title">AI Chat</h3>
            <p className="feature-desc">Experience a fluid, multi-conversation chat layout with a sleek mobile design. Chat in Hindi, Marathi, Tamil, or English, complete with global Dark/Light mode toggling.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon rose"><Mic size={22} strokeWidth={1.5} color="#e879a0" /></div>
            <h3 className="feature-title">Voice &amp; Image Intelligence</h3>
            <p className="feature-desc">Say your symptoms out loud or upload a photo of your meal. CureMe's AI instantly identifies the dish, estimates macros, and dictates if it suits your allergies.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon green"><Calendar size={22} strokeWidth={1.5} color="#4ade80" /></div>
            <h3 className="feature-title">Weekly Health Plans</h3>
            <p className="feature-desc">Generate a complete 7-day Indian meal and physical activity schedule styled in a beautiful, premium two-column layout. Export easily as a PDF for offline reference.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon violet"><MapPin size={22} strokeWidth={1.5} color="#a78bfa" /></div>
            <h3 className="feature-title">Find Nearby Care (10km)</h3>
            <p className="feature-desc">Instantly locate nearby hospitals, clinics, and pharmacies within a 10km radius using your live location. See distance and get direct one-tap calling buttons.</p>
          </div>
          <div className="feature-card reveal">
            <div className="feature-icon cyan"><Stethoscope size={22} strokeWidth={1.5} color="#60a5fa" /></div>
            <h3 className="feature-title">Symptom Checker</h3>
            <p className="feature-desc">Describe your symptoms in natural language and receive an instant preliminary triage – identifying whether you should see a doctor or monitor at home.</p>
          </div>
        </div>
      </section>

      {/* ── CONDITIONS ── */}

      <section className="conditions" id="conditions">
        <p className="section-label reveal">Supported conditions</p>
        <h2 className="section-title reveal">Tailored for your diagnosis</h2>
        <div className="conditions-grid">
          <div className="condition-pill reveal"><Droplets size={16} strokeWidth={1.5} color="#f87171" /> Diabetes</div>
          <div className="condition-pill reveal"><Flower2 size={16} strokeWidth={1.5} color="#e879a0" /> PCOS</div>
          <div className="condition-pill reveal"><Heart size={16} strokeWidth={1.5} color="#fb923c" /> Hypertension</div>
          <div className="condition-pill reveal"><Scale size={16} strokeWidth={1.5} color="#a78bfa" /> Obesity</div>
          <div className="condition-pill reveal"><Sparkles size={16} strokeWidth={1.5} color="#60a5fa" /> General Health</div>
        </div>
      </section>
      {/* ── HOW ── */}
      <section className="how" id="how">
        <p className="section-label reveal">How it works</p>
        <h2 className="section-title reveal">Personalised guidance in <em style={{ fontStyle: 'italic', color: '#a78bfa' }}>minutes</em></h2>
        <div className="how-steps">
          <div className="how-step reveal">
            <div className="how-step-num">01</div>
            <h3 className="how-step-title">Build your health profile</h3>
            <p className="how-step-desc">Tell us your age, weight, conditions, medications, and allergies once — in under 2 minutes. Your data stays private in Firebase.</p>
          </div>
          <div className="how-step reveal">
            <div className="how-step-num">02</div>
            <h3 className="how-step-title">Ask, speak, or snap</h3>
            <p className="how-step-desc">Type your question, use hands-free voice commands in Indian English, or upload a food photo. CureMe understands all three.</p>
          </div>
          <div className="how-step reveal">
            <div className="how-step-num">03</div>
            <h3 className="how-step-title">Get rich, personalised answers</h3>
            <p className="how-step-desc">Receive structured responses with visual health cards, nutritional breakdowns, household remedies, and a 7-day meal and workout plan — all tailored to you.</p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats">
        <div className="stats-inner">
          <div className="stat reveal">
            <div className="stat-num">12+</div>
            <div className="stat-label">Profile data points analysed per response</div>
          </div>
          <div className="stat reveal">
            <div className="stat-num">500M+</div>
            <div className="stat-label">Indians living with chronic conditions</div>
          </div>
          <div className="stat reveal">
            <div className="stat-num">7</div>
            <div className="stat-label">Days covered by AI meal &amp; workout plan</div>
          </div>
          <div className="stat reveal">
            <div className="stat-num">0₹</div>
            <div className="stat-label">Cost — completely free to use</div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-card reveal">
          <h2>Your health deserves<br /><em>personal</em> answers.</h2>
          <p>{user ? "Pick up right where you left off." : "Set up your health profile in 2 minutes. Free forever."}</p>
          <a href="./chat" className="btn-primary">Open CureMe AI →</a>
        </div>
      </section>

      <footer>
        <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Stethoscope size={16} /> CureMe AI</div>
        <p className="footer-note">For informational purposes only · Not a substitute for professional medical advice</p>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#conditions">Conditions</a>
          <a href="#how">How it works</a>
        </div>
      </footer>
    </>
  );
}