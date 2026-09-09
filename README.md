# Medi Bud — Offline-First Mobile Health Companion

> **Disclaimer:** For informational triage and educational guidance only. Not a substitute for professional clinical medical advice or diagnosis. In emergencies, call **112** immediately.

Medi Bud is a mobile-first, **100% offline-capable** health companion application designed for Indian users. Unlike traditional web applications that fail when internet connectivity drops, Medi Bud uses local **SQLite** (via Drizzle ORM) as the sole source of truth for device reads and writes, paired with a resilient background **sync outbox** and an **Apple Human Interface Guidelines (HIG)** aesthetic.

---

## Key Highlights

- **100% Offline Source of Truth**: User profile, BMI metrics, symptom logs, and medication reminders are stored locally in SQLite (`expo-sqlite` + `drizzle-orm`). The app is fully navigable and usable in airplane mode.
- **Apple Human Interface Guidelines (HIG) Design**:
  - Minimalist Clean Light aesthetic: Apple System Grouped Background (`#F2F2F7`), pure white Inset Grouped cards (`#FFFFFF`), and hairline row dividers (`#E5E5EA`).
  - San Francisco typographic scale (`largeTitle`, `title1`, `headline`, `body`, `footnote`).
  - Strictly adheres to Apple's **44×44pt minimum touch target** rule on all interactive controls.
  - Zero gradients and refined, high-contrast, muted clinical urgency tints.
- **Resilient Outbox Sync**:
  - Local changes enqueue tasks to an internal `sync_outbox` table.
  - Automatically drains and synchronizes records to Cloud Firestore (`users/{uid}/...`) when internet connectivity is detected.
- **Zero Client Secrets & Hardened Cloud Security**:
  - No Gemini or Firebase admin keys bundled in client code.
  - Production-grade Firestore security rules scoped strictly to authenticated `request.auth.uid`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 57 (Managed Workflow) + React Native |
| **Language** | TypeScript (`strict: true`) |
| **Navigation** | `expo-router` (File-based navigation) |
| **Local Database** | `expo-sqlite` + `drizzle-orm` (Primary Source of Truth) |
| **State Management** | `zustand` (Optimistic UI updates) |
| **Design System** | Apple HIG Design Tokens (`src/theme/tokens.ts`) |
| **Icons** | `lucide-react-native` (Monochromatic 1.75–2.0px stroke) |
| **Background & Notifications**| `expo-notifications`, `expo-background-fetch`, `expo-task-manager` |
| **Cloud Sync & Auth** | Firebase Auth & Cloud Firestore |
| **Testing** | Jest + `ts-jest` (Offline unit testing suite) |

---

## Project Structure

```
Medi-Bud/
├── app/                        # Expo Router file-based screens
│   ├── (tabs)/                 # Main bottom tab routes
│   │   ├── _layout.tsx         # Clean light tab bar with Lucide icons
│   │   ├── index.tsx           # Daily Health Dashboard ("Summary")
│   │   ├── triage.tsx          # Offline-first Symptom Checker (Phase 2)
│   │   ├── chat.tsx            # Profile-aware AI Doctor Consultation (Phase 3)
│   │   ├── reminders.tsx       # Medication & check-in alarms (Phase 4)
│   │   └── profile.tsx         # User baseline & editable health metrics
│   ├── onboarding/
│   │   └── index.tsx           # 3-step health questionnaire wizard
│   ├── _layout.tsx             # Root Stack layout and status bar
│   └── index.tsx               # Welcome / entry screen
├── src/
│   ├── components/             # Reusable UI primitives & compound components
│   │   └── onboarding/         # StepIndicator, PersonalStep, BodyStep, HealthStep
│   ├── db/                     # Local SQLite & Drizzle ORM layer
│   │   ├── schema.ts           # Drizzle table schemas (profiles, sync_outbox)
│   │   └── client.ts           # DB bootstrapper & local repositories
│   ├── lib/                    # Pure domain logic & TypeScript models
│   │   ├── bmi.ts              # Pure BMI calculation & categorization
│   │   └── types.ts            # Central data types (UserProfile, OutboxTask)
│   ├── store/                  # Zustand state stores
│   │   └── useProfileStore.ts  # Optimistic updates & SQLite persistence
│   ├── services/               # Background outbox processor & sync
│   │   ├── outboxService.ts    # Outbox queue processor with retry backoff
│   │   └── profileSync.ts      # Cloud Firestore push adapter
│   └── theme/                  # Design tokens & typography
│       └── tokens.ts           # Apple HIG colors, 44pt touch targets, SF scale
├── __tests__/                  # Unit test suite (Theme, BMI, Outbox, Sync)
├── docs/                       # Architecture diagrams & migration history
│   ├── architecture.md         # System data flow and Mermaid diagrams
│   └── apple-design-skill/     # Apple HIG design guidelines & rules
├── firestore.rules             # Production security rules (request.auth.uid scoped)
└── legacy-web/                 # Archived legacy Next.js web application
```

---

## Step-by-Step Guide to Run the App

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **For Testing on Mobile Device**: Download the **Expo Go** app from the iOS App Store or Google Play Store.
- **For Simulators (Optional)**:
  - iOS: macOS with Xcode installed.
  - Android: Android Studio with an active Android Virtual Device (AVD).

---

### 2. Install Dependencies
If you have not already installed dependencies, run:
```bash
npm install
```

---

### 3. Start the Development Server
Launch the Expo Metro bundler:
```bash
npm start
# or
npx expo start
```

Once started, the interactive terminal will display a QR code and shortcut commands.

---

### 4. Choose Your Target Platform

#### Option A: Physical Mobile Phone (Recommended for True Feel)
1. Open the **Expo Go** app on your Android phone (or the **Camera** app on iOS).
2. Scan the QR code displayed in your terminal.
3. The app bundle will download and launch instantly with live reloading.

#### Option B: iOS Simulator (macOS Only)
Press `i` in the terminal after running `npm start`, or run directly:
```bash
npm run ios
```

#### Option C: Android Emulator
Press `a` in the terminal after running `npm start`, or run directly:
```bash
npm run android
```

#### Option D: Web Browser Preview
Press `w` in the terminal after running `npm start`, or run directly:
```bash
npm run web
```

---

## Verification & Testing Commands

### Run Unit Tests
Execute the comprehensive Jest test suite (validates theme tokens, Apple HIG rules, BMI domain logic, sync outbox transitions, and cloud sync):
```bash
npm test
```

### Run Strict TypeScript Check
Verify type safety across all components, stores, and repositories:
```bash
npm run typecheck
```

---

## Rebuild Roadmap

- [x] **Phase 0 — Scaffold & Architecture**: Clean Expo project, Apple HIG theme tokens, project conventions (`AGENTS.md`), architecture diagrams, Jest test runner.
- [x] **Phase 1 — Profile & Local DB**: Local SQLite persistence (`profiles`, `sync_outbox`), 3-step onboarding wizard, Zustand optimistic store, outbox queue worker, Firestore rules.
- [ ] **Phase 2 — Offline Triage Engine**: Deterministic clinical rule tree, red-flag emergency detection, unit test suite, Symptom Checker screen.
- [ ] **Phase 3 — Secure AI Layer & Chat**: Firebase Cloud Function proxy for Gemini 2.5 Flash, rate limiting, local chat history, online triage elaboration.
- [ ] **Phase 4 — Medication Reminders & Offline Tools**: Scheduled local alarms via `expo-notifications`, daily adherence log, 7-day meal/workout caching.
- [ ] **Phase 5 — Polish & Hardening**: Error boundaries, network state banners, accessibility audit, final release verification.