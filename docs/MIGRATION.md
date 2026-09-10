# Medi Bud — Web to Mobile Migration Ledger

This ledger records the architectural changes, feature transitions, and rationale for rebuilding Medi Bud from the Next.js web application into an offline-first React Native (Expo) mobile application.

---

## 1. Feature Status Summary

| Feature Area | Legacy Web Implementation | Mobile Rebuild Status | Rationale |
|---|---|---|---|
| **Health Profile & Onboarding** | Direct Firestore writes via client JS SDK; blocked if offline | **KEPT & ENHANCED (Phase 1)** | Replaced with local SQLite writes via Drizzle ORM first; background sync to Firestore via outbox pattern. |
| **Symptom Checker & Triage** | Direct client Gemini API call with XML response parsing; completely broken offline | **KEPT & ENHANCED (Phase 2)** | Added 100% offline, deterministic rule-based triage engine for safety classification; online Gemini elaboration enriches advice when connected. |
| **Profile-Aware AI Chat** | Direct client call to Gemini using exposed `NEXT_PUBLIC_GEMINI_API_KEY` | **KEPT & HARDENED (Phase 3)** | Rewritten with zero client keys. All requests route through a secured Firebase Cloud Function proxy with per-user rate limiting and local SQLite conversation history. |
| **Medication & Check-in Reminders** | None (web notifications are unreliable and require active browser tabs) | **NEW CORE FEATURE (Phase 4)** | Built with `expo-notifications` for 100% offline recurring local device alarms and adherence tracking. |
| **7-Day Meal & Workout Planner** | Single giant prompt in client component; lost on refresh | **DEFERRED / SECONDARY (Phase 4)** | Kept prompt structure, but deferred behind core triage and reminder features; will cache plans in SQLite when implemented. |
| **Food Photo Nutritional Analysis** | Client-side base64 upload to Gemini endpoint | **DEFERRED / SECONDARY (Phase 4)** | Deferred behind reminders; will use outbox queue when offline. |
| **Nearby Care Map** | Web Leaflet + Overpass API integration; requires continuous data connection | **DEFERRED (Phase 4)** | Deferred behind reminders; mobile app will prioritize emergency dialer and cached local emergency contacts. |
| **10-Language UI Chrome** | Superficial web strings with partial translation | **CUT FOR V1** | Delivering high quality, culturally attuned English + Hindi support is far superior to shallow machine translations across 10 languages. |
| **Voice Navigation (`VoiceNavigator.tsx`)** | Web Speech Recognition API (unreliable across browsers) | **CUT FOR V1** | Cuts unnecessary binary bloat and third-party complexity; prioritize crisp touch accessibility. |

---

## 2. Key Architectural Shifts

### A. Client Secrets Elimination
- **Old Web**: `lib/gemini.js` read `process.env.NEXT_PUBLIC_GEMINI_API_KEY` directly from the browser window. Anyone inspecting network traffic could extract the key.
- **New Mobile**: Cloud Function proxy (`/functions`) authenticates Firebase user tokens and holds the secret key in Google Cloud Secret Manager / environment configuration.

### B. Single Source of Truth: SQLite vs Firestore
- **Old Web**: The app read and wrote directly to Cloud Firestore. Offline state caused unhandled promise rejections or blocked UI states.
- **New Mobile**: Local SQLite is the sole source of truth for the UI. Reads and writes are instant, zero-latency, and work completely in airplane mode. Firestore acts strictly as a backup/sync target.

### C. State Management & Code Organization
- **Old Web**: Monolithic 600–1100 line page components (`app/chat/page.tsx`, `app/symptoms/page.tsx`) with nested `useState`, prop-drilling, and inline styles.
- **New Mobile**: Modular components strictly capped under 300 lines, Zustand state stores, and pure domain services separated from UI presentation.
