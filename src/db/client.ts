import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

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

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      cards_json TEXT,
      interactive_json TEXT,
      image_uri TEXT,
      source TEXT NOT NULL DEFAULT 'cloud',
      is_offline INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  try {
    db.execSync(`ALTER TABLE chat_messages ADD COLUMN image_uri TEXT;`);
  } catch {
    // Column already exists
  }
}

// Re-export all repository operations for backwards compatibility
export * from "./repositories";
