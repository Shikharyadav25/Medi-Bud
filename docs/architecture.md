# Medi Bud — System Architecture & Data Flow

This document details the offline-first mobile architecture, data flow, synchronization patterns, and cloud security design for Medi Bud.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Device (Offline-First Expo App)"]
        UI["React Native UI (Expo Router)"]
        Store["Zustand Stores (Optimistic State)"]
        Drizzle["Drizzle ORM"]
        SQLite[("Local SQLite Database\n(Single Source of Truth)")]
        LocalTriage["Rule-Based Triage Engine\n(100% Offline Clinical Tree)"]
        OutboxWorker["Outbox Sync Engine\n(expo-background-fetch / task-manager)"]

        UI <--> Store
        UI --> LocalTriage
        Store <--> Drizzle
        Drizzle <--> SQLite
        Store --> OutboxWorker
        OutboxWorker <--> SQLite
    end

    subgraph Network ["Network Boundary (Online Only)"]
        Internet{"Internet Available?"}
    end

    subgraph Cloud ["Secure Cloud Backend (Supabase)"]
        Auth["Supabase Authentication\n(JWT & User ID)"]
        Postgres[("Supabase PostgreSQL\n(Row Level Security / RLS)")]
        EdgeFunction["Supabase Edge Function Proxy\n(/functions/v1/gemini-proxy)"]
        RateLimiter["Per-User Rate Limiter\n(Token Window / Sliding Cache)"]
        Gemini["Google Gemini 2.5 Flash API\n(Secret API Key Held Server-Side)"]

        EdgeFunction --> RateLimiter
        RateLimiter --> Gemini
    end

    OutboxWorker --> Internet
    Internet -- "Yes: Sync Relational Records" --> Postgres
    Internet -- "Yes: AI Requests (with Bearer JWT)" --> EdgeFunction
    EdgeFunction -- "Verify UID" --> Auth
```

---

## 2. Synchronization & Outbox Flow (Eventual Consistency)

The app utilizes an **Outbox Pattern** to ensure zero data loss during intermittent or absent connectivity.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Screen Component
    participant Store as Zustand Store
    participant DB as Local SQLite (Drizzle)
    participant Outbox as Sync Outbox Table
    participant Worker as Background Sync Worker
    participant Cloud as Supabase Edge Function / Postgres

    User->>UI: Submit Action (e.g. Update Profile / Send AI Query)
    UI->>Store: Dispatch optimistic update
    Store->>DB: Write directly to local table (status: 'pending')
    Store->>Outbox: Enqueue task into sync_outbox (status: 'pending')
    Store-->>UI: Instantly render updated UI to User

    Note over DB,Worker: App remains 100% operational offline

    alt Device is Offline
        Worker->>Outbox: Check pending tasks
        Worker-->>Worker: Detect no network connection -> sleep
    else Device comes Online
        Worker->>Outbox: Fetch pending tasks ordered by priority & timestamp
        Worker->>Outbox: Mark task as 'processing'
        Worker->>Cloud: Send batch payload with Supabase JWT Bearer token
        alt Cloud Call Successful
            Cloud-->>Worker: 200 OK + Sync confirmation / AI response
            Worker->>DB: Update entity (status: 'synced', AI response written)
            Worker->>Outbox: Mark task as 'completed'
            Worker->>Store: Notify store of synced state
        else Cloud Call Fails (e.g. 5xx or Network Timeout)
            Cloud-->>Worker: Error / Timeout
            Worker->>Outbox: Increment retry_count, record last_error, schedule exponential backoff
            Worker->>DB: Mark entity status: 'failed' (visible in UI badge)
        end
    end
```

---

## 3. Data Storage & Schema Design

### Local SQLite Database (`expo-sqlite` + `drizzle-orm`)
The local SQLite database contains all application data needed for offline operation:

| Table | Purpose | Offline Read/Write |
|---|---|---|
| `profiles` | Multi-profile family records under an account (`accountId`, `name`, `relationship`, `age`, ...) | Reads & Writes local-first; queued to outbox |
| `symptom_evaluations` | Offline triage results and online AI elaborations (scoped to `profileId`) | Offline rule evaluation; cached locally |
| `conversations` | AI chat session metadata (scoped to `profileId`) | Created and read offline |
| `chat_messages` | Chat messages with structured health cards | Saved offline; pending queries queued to outbox |
| `reminders` | Local medication schedules & adherence logs (scoped to `profileId`) | Managed 100% offline with local notifications |
| `sync_outbox` | Eventual consistency task queue | Enqueued locally, drained when online |

### Cloud Supabase PostgreSQL Structure
PostgreSQL naturally mirrors the local relational schema without NoSQL translation impedance:

- `profiles` (`id`, `account_id`, `name`, `relationship`, `age`, `gender`, `height_cm`, `weight_kg`, `health_issues`, `medications`, `allergies`, `updated_at`)
- `conversations` (`id`, `account_id`, `profile_id`, `title`, `created_at`, `updated_at`)
- `chat_messages` (`id`, `conversation_id`, `role`, `content`, `cards_json`, `interactive_json`, `image_uri`, `source`, `is_offline`, `created_at`)
- `reminders` (`id`, `account_id`, `profile_id`, `name`, `dosage`, `frequency`, `time`, `active`, `created_at`)
- `symptom_evaluations` (`id`, `account_id`, `profile_id`, `symptoms_json`, `urgency`, `advice`, `red_flags_detected`, `created_at`)

---

## 4. Security & Privacy Architecture

1. **Zero Client Secrets**:
   - The client application contains neither `GEMINI_API_KEY` nor any database master key.
   - External AI requests route through the Supabase Edge Function proxy, which authenticates the user's Supabase JWT.

2. **Per-User Rate Limiting**:
   - The Edge Function implements sliding-window rate limiting keyed by authenticated `account_id` (e.g. max 30 queries per 15 minutes).

3. **Row Level Security (RLS)**:
   - Tables enforce `auth.uid() = account_id` directly in PostgreSQL, mathematically preventing cross-user data exposure.
