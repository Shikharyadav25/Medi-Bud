"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Stethoscope, Menu, X, MessageCircle, User as UserIcon, LogOut, Globe, Sun, Moon } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");

  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "ta", label: "தமிழ்" },
    { code: "bn", label: "বাংলা" },
    { code: "te", label: "తెలుగు" },
    { code: "mr", label: "मराठी" },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem("cureme_lang");
    if (savedLang) setLanguage(savedLang);
    const savedTheme = localStorage.getItem("cureme_theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") document.documentElement.classList.add("light-theme");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("cureme_theme", newTheme);
    if (newTheme === "light") document.documentElement.classList.add("light-theme");
    else document.documentElement.classList.remove("light-theme");
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("cureme_lang", newLang);
    // Optionally trigger a custom event if other components need immediate re-render, 
    // or they can just check localStorage on mount.
    window.dispatchEvent(new Event("languageChange"));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".gnav-user-menu")) setDropdownOpen(false);
      // We don't close the mobile menu on click-away by default if there's an overlay
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
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
      <style>{`
        /* GLOBAL NAV VARS */
        .gnav-root { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(6,6,14,0.7); font-family: 'Sora', sans-serif; }
        
        .gnav-logo { display: flex; align-items: center; gap: 10px; font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: #fff; text-decoration: none; }
        .gnav-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #7c3aed, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
        
        .gnav-center { display: flex; align-items: center; gap: 28px; list-style: none; margin: 0; padding: 0; }
        .gnav-center a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.82rem; font-weight: 500; letter-spacing: 0.04em; transition: color 0.2s; }
        .gnav-center a:hover { color: #fff; }
        
        .gnav-right { display: flex; align-items: center; gap: 12px; }
        
        /* LANGUAGE PICKER */
        .gnav-lang-picker { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; color: rgba(255,255,255,0.8); font-size: 0.8rem; font-weight: 500; font-family: 'Sora', sans-serif; cursor: pointer; transition: all 0.2s; }
        .gnav-lang-picker:hover { background: rgba(255,255,255,0.1); border-color: rgba(124,58,237,0.4); color: #fff; }
        .gnav-lang-select { background: transparent; color: inherit; border: none; outline: none; font-size: 0.8rem; font-weight: 500; font-family: inherit; cursor: pointer; appearance: none; padding-right: 8px; }
        .gnav-lang-select option { background: #13121f; color: #fff; }
        
        /* THEME TOGGLE */
        .gnav-theme-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); cursor: pointer; transition: all 0.2s; margin-right: 8px; }
        .gnav-theme-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        /* AUTH SKELETON */
        .gnav-placeholder { width: 130px; height: 36px; background: rgba(255,255,255,0.04); border-radius: 100px; animation: gnav-shimmer 1.5s ease infinite; }
        @keyframes gnav-shimmer { 0%,100%{opacity:0.4;} 50%{opacity:0.8;} }

        /* UN-AUTH BUTTONS */
        .gnav-cta { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 9px 22px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 10px; color: #fff !important; font-weight: 600 !important; font-size: 0.8rem !important; box-shadow: 0 4px 14px rgba(124,58,237,0.4); transition: all 0.2s !important; text-decoration: none; }
        .gnav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.55) !important; }
        .gnav-login-ghost { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 9px 18px; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: rgba(255,255,255,0.65) !important; font-size: 0.8rem !important; font-weight: 500 !important; text-decoration: none; transition: all 0.2s; }
        .gnav-login-ghost:hover { border-color: rgba(255,255,255,0.3) !important; color: #fff !important; background: rgba(255,255,255,0.04); }

        /* USER MENU */
        .gnav-user-menu { position: relative; display: flex; }
        .gnav-avatar-btn { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.8); font-size: 0.8rem; font-weight: 500; font-family: 'Sora', sans-serif; }
        .gnav-avatar-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(124,58,237,0.4); }
        .gnav-avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0; }
        .gnav-photo { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .gnav-chevron { width: 14px; height: 14px; opacity: 0.5; transition: transform 0.2s; }
        .gnav-chevron.open { transform: rotate(180deg); }

        /* DROPDOWN */
        .gnav-dropdown { position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px; background: #13121f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 8px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); animation: gnavDropIn 0.18s ease both; z-index: 200; }
        @keyframes gnavDropIn { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        .gnav-dropdown-header { padding: 12px 14px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 6px; }
        .gnav-dropdown-name { font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gnav-dropdown-email { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gnav-dropdown-item { min-height: 44px; display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 14px; background: none; border: none; color: rgba(255,255,255,0.65); font-family: 'Sora', sans-serif; font-size: 0.8rem; border-radius: 10px; cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .gnav-dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .gnav-dropdown-item.danger:hover { background: rgba(232,121,160,0.1); color: #f9a8d4; }
        .gnav-dropdown-item-icon { font-size: 14px; opacity: 0.7; }

        /* MOBILE HAMBURGER */
        .gnav-hamburger { display: none; background: transparent; border: none; color: #fff; cursor: pointer; padding: 8px; transition: color 0.2s; }
        .gnav-hamburger:hover { color: #a78bfa; }

        /* MOBILE SIDE PANEL */
        .gnav-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .gnav-panel-overlay.open { opacity: 1; pointer-events: auto; }
        .gnav-panel { position: fixed; top: 0; bottom: 0; right: 0; width: 280px; max-width: 80vw; background: #0d0d1a; border-left: 1px solid rgba(255,255,255,0.1); z-index: 2001; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; overflow-y: auto; }
        .gnav-panel.open { transform: translateX(0); }
        .gnav-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .gnav-panel-close { min-height: 44px; min-width: 44px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: background 0.2s; }
        .gnav-panel-close:hover { background: rgba(255,255,255,0.1); }
        .gnav-panel-content { padding: 24px; display: flex; flex-direction: column; gap: 24px; flex: 1; }
        .gnav-panel-links { display: flex; flex-direction: column; gap: 8px; list-style: none; margin: 0; padding: 0; }
        .gnav-panel-links a { min-height: 44px; display: flex; align-items: center; color: #fff; text-decoration: none; font-size: 1.1rem; font-weight: 500; font-family: 'DM Serif Display', serif; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .gnav-panel-links a:hover { color: #a78bfa; }
        
        .gnav-panel-auth { margin-top: auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px; }
        .gnav-panel-user { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 12px; }
        .gnav-panel-user-details { display: flex; flex-direction: column; overflow: hidden; }
        .gnav-panel-user-name { font-size: 0.9rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gnav-panel-user-email { font-size: 0.75rem; color: rgba(255,255,255,0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        @media (max-width: 768px) {
          .gnav-root { padding: 14px 20px; }
          .gnav-center { display: none; }
          .gnav-right { display: none; }
          .gnav-hamburger { display: block; }
        }
      `}</style>
      
      <nav className="gnav-root">
        <a className="gnav-logo" href="/" aria-label="Go to CureMe Home">
          <div className="gnav-logo-icon">
            <Stethoscope size={20} color="#fff" strokeWidth={2.5} />
          </div>
          CureMe AI
        </a>

        <ul className="gnav-center">
          <li><a href="/">Home</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/symptoms">Symptoms</a></li>
          <li><a href="/plan">AI Plan</a></li>
          <li><a href="/chat">Chat</a></li>
          <li><a href="/nearby">Nearby Care</a></li>
        </ul>

        <div className="gnav-right">
          <button className="gnav-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <div className="gnav-lang-picker" style={{ marginRight: 8 }}>
            <Globe size={14} />
            <select className="gnav-lang-select" value={language} onChange={handleLanguageChange}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          
          {!authReady ? (
            <div className="gnav-placeholder" />
          ) : user ? (
            <div className="gnav-user-menu">
              <button 
                className="gnav-avatar-btn" 
                aria-haspopup="true" 
                aria-expanded={dropdownOpen} 
                aria-label="User profile menu" 
                onClick={() => setDropdownOpen((o) => !o)}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User profile" className="gnav-photo" />
                ) : (
                  <div className="gnav-avatar-circle">{getInitials(user)}</div>
                )}
                <span>
                  {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
                <svg className={`gnav-chevron ${dropdownOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="gnav-dropdown">
                  <div className="gnav-dropdown-header">
                    <div className="gnav-dropdown-name">{user.displayName || "User"}</div>
                    <div className="gnav-dropdown-email">{user.email}</div>
                  </div>
                  <a href="/dashboard" className="gnav-dropdown-item">
                    <span className="gnav-dropdown-item-icon"><UserIcon size={14} /></span> Dashboard
                  </a>
                  <a href="/chat" className="gnav-dropdown-item">
                    <span className="gnav-dropdown-item-icon"><MessageCircle size={14} /></span> Open Chat
                  </a>
                  <button className="gnav-dropdown-item danger" onClick={handleSignOut}>
                    <span className="gnav-dropdown-item-icon"><LogOut size={14} /></span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" className="gnav-login-ghost">Login</a>
              <a href="/chat" className="gnav-cta">Open App ↗</a>
            </>
          )}
        </div>

        <button className="gnav-hamburger" aria-label="Open mobile menu" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={26} strokeWidth={2} />
        </button>
      </nav>

      {/* MOBILE SIDE PANEL */}
      <div 
        className={`gnav-panel-overlay ${mobileMenuOpen ? "open" : ""}`} 
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
      
      <div className={`gnav-panel ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <div className="gnav-panel-header">
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#fff" }}>Menu</span>
          <button className="gnav-panel-close" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="gnav-panel-content">
          <ul className="gnav-panel-links">
            <li><a href="/" onClick={() => setMobileMenuOpen(false)}>Home</a></li>
            <li><a href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</a></li>
            <li><a href="/symptoms" onClick={() => setMobileMenuOpen(false)}>Symptoms Tracker</a></li>
            <li><a href="/plan" onClick={() => setMobileMenuOpen(false)}>AI Plan</a></li>
            <li><a href="/chat" onClick={() => setMobileMenuOpen(false)}>Chat Companion</a></li>
          </ul>

          <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="gnav-lang-picker" style={{ display: "inline-flex" }}>
              <Globe size={14} />
              <select className="gnav-lang-select" value={language} onChange={handleLanguageChange}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="gnav-panel-auth">
            {!authReady ? (
              <div className="gnav-placeholder" style={{ width: "100%" }} />
            ) : user ? (
              <>
                <div className="gnav-panel-user">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User profile" className="gnav-photo" />
                  ) : (
                    <div className="gnav-avatar-circle" style={{ width: 36, height: 36, fontSize: "0.8rem" }}>{getInitials(user)}</div>
                  )}
                  <div className="gnav-panel-user-details">
                    <span className="gnav-panel-user-name">{user.displayName || "User"}</span>
                    <span className="gnav-panel-user-email">{user.email}</span>
                  </div>
                </div>
                <a href="/dashboard" className="gnav-login-ghost" style={{ width: "100%" }} onClick={() => setMobileMenuOpen(false)}>My Profile</a>
                <button className="gnav-dropdown-item danger" style={{ justifyContent: "center", minHeight: "44px", width: "100%", border: "1px solid rgba(232,121,160,0.3)" }} onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="gnav-login-ghost" style={{ width: "100%" }}>Login</a>
                <a href="/chat" className="gnav-cta" style={{ width: "100%" }}>Get Started ↗</a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
