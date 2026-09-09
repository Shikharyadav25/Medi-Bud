import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { UserProfile, OutboxTask, OutboxTaskType, OutboxStatus } from "@/lib/types";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let rawDbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase() {
  if (!dbInstance) {
    rawDbInstance = SQLite.openDatabaseSync("medibud.db");
    dbInstance = drizzle(rawDbInstance, { schema });
    bootstrapTables(rawDbInstance);
  }
  return dbInstance;
}

function bootstrapTables(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL UNIQUE,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      health_issues TEXT NOT NULL DEFAULT '',
      medications TEXT NOT NULL DEFAULT '',
      allergies TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY,
      task_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

// ── Profile Repository ──────────────────────────────────────

export function fetchLocalProfile(uid: string): UserProfile | null {
  const db = getDatabase();
  const records = db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.uid, uid))
    .all();

  if (!records || records.length === 0) {
    return null;
  }

  const row = records[0];
  return {
    id: row.id,
    uid: row.uid,
    age: row.age,
    gender: row.gender,
    heightCm: row.heightCm,
    weightKg: row.weightKg,
    healthIssues: row.healthIssues,
    medications: row.medications,
    allergies: row.allergies,
    updatedAt: row.updatedAt,
    syncStatus: row.syncStatus as UserProfile["syncStatus"],
  };
}

export function persistLocalProfile(profile: UserProfile): void {
  const db = getDatabase();
  const existing = fetchLocalProfile(profile.uid);

  const payload = {
    uid: profile.uid,
    age: profile.age,
    gender: profile.gender,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    healthIssues: profile.healthIssues || "",
    medications: profile.medications || "",
    allergies: profile.allergies || "",
    updatedAt: profile.updatedAt || Date.now(),
    syncStatus: profile.syncStatus || "pending",
  };

  if (existing) {
    db.update(schema.profiles)
      .set(payload)
      .where(eq(schema.profiles.uid, profile.uid))
      .run();
  } else {
    db.insert(schema.profiles).values(payload).run();
  }
}

// ── Outbox Repository ───────────────────────────────────────

export function enqueueOutbox(
  taskType: OutboxTaskType,
  payload: Record<string, unknown>
): OutboxTask {
  const db = getDatabase();
  const now = Date.now();
  const id = `outbox_${now}_${Math.random().toString(36).substring(2, 9)}`;

  const task: OutboxTask = {
    id,
    taskType,
    payload: JSON.stringify(payload),
    status: "pending",
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.insert(schema.syncOutbox).values(task).run();
  return task;
}

export function fetchPendingOutboxTasks(): OutboxTask[] {
  const db = getDatabase();
  const records = db
    .select()
    .from(schema.syncOutbox)
    .where(eq(schema.syncOutbox.status, "pending"))
    .all();

  return records.map((r) => ({
    id: r.id,
    taskType: r.taskType as OutboxTaskType,
    payload: r.payload,
    status: r.status as OutboxStatus,
    retryCount: r.retryCount,
    lastError: r.lastError,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export function updateOutboxStatus(
  id: string,
  status: OutboxStatus,
  lastError?: string | null
): void {
  const db = getDatabase();
  db.update(schema.syncOutbox)
    .set({
      status,
      lastError: lastError ?? null,
      updatedAt: Date.now(),
    })
    .where(eq(schema.syncOutbox.id, id))
    .run();
}
