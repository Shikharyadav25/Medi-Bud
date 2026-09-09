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

    subgraph Cloud ["Secure Cloud Backend"]
        Auth["Firebase Authentication\n(UID & ID Token)"]
        Firestore[("Cloud Firestore\n(users/{uid}/...)")]
        CloudFunction["Firebase Cloud Function Proxy\n(/api/gemini-proxy)"]
        RateLimiter["Per-User Rate Limiter\n(Bucket / Cache)"]
        Gemini["Google Gemini 2.5 Flash API\n(Secret API Key Held Server-Side)"]

        CloudFunction --> RateLimiter
        RateLimiter --> Gemini
    end

    OutboxWorker --> Internet
    Internet -- "Yes: Sync Records" --> Firestore
    Internet -- "Yes: AI Requests (with Bearer Token)" --> CloudFunction
    CloudFunction -- "Verify UID" --> Auth
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
    participant Cloud as Cloud Function / Firestore

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
        Worker->>Cloud: Send batch payload with Firebase Auth Bearer token
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
| `profiles` | User demographics, conditions, medications, allergies | Reads & Writes local-first; queued to outbox |
| `symptom_evaluations` | Offline triage results and online AI elaborations | Offline rule evaluation; cached locally |
| `conversations` | AI chat session metadata | Created and read offline |
| `messages` | Chat messages with structured health cards | Saved offline; pending queries queued to outbox |
| `medication_reminders` | Local medication schedules & adherence logs | Managed 100% offline with local notifications |
| `sync_outbox` | Eventual consistency task queue | Enqueued locally, drained when online |

### Cloud Firestore Structure (`@react-native-firebase/firestore`)
Firestore mirrors the local database for multi-device sync and backup. It is **never** accessed as a blocking read prerequisite for the client UI:

```
users/
  └── {userId}/
        ├── profile/
        │     └── main (demographics, health issues, medications, allergies)
        ├── symptom_history/
        │     └── {evalId} (symptoms, triage urgency, causes, advice)
        ├── conversations/
        │     └── {convId} (title, timestamps)
        │           └── messages/
        │                 └── {messageId} (role, content, cards)
        └── reminders/
              └── {reminderId} (name, dosage, times, active)
```

---

## 4. Security & Privacy Architecture

1. **Zero Client Secrets**:
   - The client application contains neither `GEMINI_API_KEY` nor any privileged administrative credentials.
   - All external AI requests route through the Firebase Cloud Function proxy, which authenticates the user's Firebase ID token via the Firebase Admin SDK.

2. **Per-User Rate Limiting**:
   - The Cloud Function implements token-bucket or window-based rate limiting keyed by `request.auth.uid` (e.g. max 30 queries per hour per user).
   - Protects server resources and costs against automated abuse or compromised devices.

3. **Firestore Security Rules**:
   - Direct access to `users/{userId}` is strictly gated:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId}/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```
   - Cross-user data leakage is impossible at the database level.
