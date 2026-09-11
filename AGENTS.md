# Medi Bud — Engineering Standards & Project Conventions

This document establishes the architecture, code standards, and conventions for the offline-first Medi Bud React Native (Expo) application.

---

## 1. Core Principles

1. **Offline-First Source of Truth**:
   - Local SQLite (via `expo-sqlite` and `drizzle-orm`) is the primary source of truth for all reads and writes.
   - The device must be fully navigable and operational in airplane mode (profile, triage, symptom logs, chat history, medication reminders).
   - Remote servers (Supabase PostgreSQL, Supabase Edge Function Gemini proxy) are eventual-consistency synchronization targets, never blocking prerequisites for local operations.

2. **Strict File Size Limits (<300 lines)**:
   - No file may exceed 300 lines under any circumstance.
   - When a screen or component approaches 200 lines, proactively factor it into smaller sub-components, custom hooks, and pure domain services.

3. **Separation of Concerns (SoC)**:
   - **UI Layer (`app/`, `src/components/`)**: Handles rendering, user input, and layout. No business logic, direct network fetches, or database queries.
   - **State Layer (`src/store/`)**: Zustand stores handling optimistic updates and dispatching persistence/outbox tasks.
   - **Database Layer (`src/db/`)**: Drizzle ORM schema, repositories, and local queries.
   - **Services Layer (`src/services/`)**: Sync engine, outbox processor, notification handlers, and API clients.
   - **Domain / Lib (`src/lib/`, `src/triage/`)**: Pure, unit-testable domain logic (e.g. offline triage rules, validators, formatters).

4. **Zero `any` Policy**:
   - TypeScript `strict: true` must be maintained at all times.
   - Never use `any` or loose `unknown` without explicit narrowing. All models, payloads, and function signatures must be strictly typed.

5. **Security & Secrets**:
   - Zero API keys or secrets in client code.
   - All AI calls go through the server-side Supabase Edge Function proxy (`/supabase/functions/gemini-proxy`) with per-UID rate limiting.
   - Supabase Row Level Security (RLS) policies strictly scope access to authenticated `auth.uid() = account_id`.

---

## 2. Directory Structure

```
├── app/                      # Expo Router (file-based navigation)
│   ├── (auth)/               # Authentication flows (login, link account)
│   ├── (tabs)/               # Main bottom-tab application routes
│   │   ├── index.tsx         # Dashboard / Daily Health Companion
│   │   ├── triage.tsx        # Symptom Checker (Offline-First)
│   │   ├── chat.tsx          # Profile-Aware AI Doctor Chat
│   │   ├── reminders.tsx     # Medication & Check-in Reminders
│   │   └── profile.tsx       # User Profile & Health Conditions
│   ├── onboarding/           # Onboarding & Health Survey
│   └── _layout.tsx           # Root layout, theme provider, DB gatekeeper
├── src/
│   ├── components/           # Reusable UI primitives & compound components
│   │   ├── common/           # Buttons, Badges, Modals, Cards, Headers
│   │   ├── triage/           # Symptom chips, Urgency banner, Red-flag alert
│   │   ├── chat/             # Chat bubbles, Action cards, Input bar
│   │   └── reminders/        # Medication schedule items, Time picker
│   ├── db/                   # Local SQLite & Drizzle ORM
│   │   ├── schema.ts         # Drizzle table schemas
│   │   ├── client.ts         # Database client & migration runner
│   │   └── repositories/     # Data access methods for Profile, Chats, Outbox
│   ├── store/                # Zustand state stores
│   │   ├── useProfileStore.ts
│   │   ├── useTriageStore.ts
│   │   ├── useChatStore.ts
│   │   └── useSyncStore.ts
│   ├── triage/               # Pure offline triage rule engine & decision tree
│   │   ├── rules.ts          # Clinical decision rules & red flags
│   │   ├── engine.ts         # Deterministic evaluation logic
│   │   └── types.ts          # Triage input & classification types
│   ├── services/             # Outbox sync, notifications, cloud sync
│   │   ├── outboxService.ts  # Outbox queue, retry backoff, background worker
│   │   ├── notificationService.ts # Local notification scheduler
│   │   └── aiProxyService.ts # Secure client to Cloud Function proxy
│   ├── theme/                # Design tokens & themes
│   │   ├── tokens.ts         # Colors, spacing, typography, radii, shadows
│   │   └── useTheme.ts       # Theme hook
│   └── lib/                  # Helpers, date formatting, BMI calculators
├── supabase/                 # Supabase configuration, migrations & Edge Functions
│   ├── migrations/           # PostgreSQL schema with Row Level Security (RLS)
│   └── functions/            # Deno Edge Functions (gemini-proxy)
├── docs/                     # Architecture & migration documentation
├── __tests__/                # Unit & integration tests (Jest)
└── legacy-web/               # Reference material from legacy Next.js web app
```

---

## 3. Naming Conventions

- **Components & Screens**: `PascalCase.tsx` (e.g. `SymptomCard.tsx`, `OnboardingScreen.tsx`)
- **Custom Hooks**: `camelCase.ts` prefixed with `use` (e.g. `useProfile.ts`, `useNetworkStatus.ts`)
- **Zustand Stores**: `use<Entity>Store.ts` (e.g. `useProfileStore.ts`)
- **Services & Utilities**: `camelCase.ts` (e.g. `outboxProcessor.ts`, `bmiCalculator.ts`)
- **Database Tables & Columns**: `snake_case` in SQL / Drizzle definition, mapped to `camelCase` in TypeScript models.
- **Constants**: `UPPER_SNAKE_CASE` (e.g. `MAX_OUTBOX_RETRIES = 5`)

---

## 4. Design & UI Aesthetics

- **Minimalist Clean Light Palette (Apple Health / Things 3 style)**:
  - Primary Background: Off-white `#FBFBFD` / `#FFFFFF`
  - Elevated Surfaces / Cards: `#FFFFFF` with 1px subtle border `#E5E7EB`
  - Primary / Interactive: Solid deep black `#09090B` with white text
  - Secondary / Text: Neutral dark slate `#09090B` (primary text), `#4B5563` (secondary text), `#9CA3AF` (muted)
  - Medical Alert Colors (refined, high-contrast, muted backgrounds):
    - Emergency: `#DC2626` / Background `#FEF2F2` / Border `#FCA5A5`
    - Soon / Warning: `#D97706` / Background `#FFFBEB` / Border `#FCD34D`
    - Monitor: `#CA8A04` / Background `#FEFCE8` / Border `#FDE047`
    - Self-Care / Good: `#16A34A` / Background `#F0FDF4` / Border `#86EFAC`
- **Zero Gradients**: Pure flat, solid surfaces with tactile 1px borders and subtle elevation.
- **Mathematical Radius Harmony**:
  - Inner radius rule: $R_{\text{inner}} = R_{\text{outer}} - P$ (where $P$ is padding).
- **Typography**: Fluid scale based on a 4pt/8pt grid. Left-align text for readability, right-align numerical/metric data.
- **Strict Monochromatic Iconography**: Use solid, crisp black icons (`#09090B`) with consistent stroke widths.

---

## 5. Testing & Verification

- **Offline Triage Rules**: 100% test coverage with Jest for all red-flag and common symptom paths.
- **Outbox Queue**: Unit tests verifying state transitions (`pending` → `processing` → `completed` / `failed`), exponential backoff, and idempotent retries.
- **Repositories**: In-memory or mock tests verifying local CRUD operations without internet access.
- Run tests: `npm test`
- Type verification: `npm run typecheck`
