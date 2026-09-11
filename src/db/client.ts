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

function safeAlterTable(db: SQLite.SQLiteDatabase, sql: string) {
  try {
    db.execSync(sql);
  } catch {
    // Column already exists or table already migrated
  }
}

function bootstrapTables(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL,
      account_id TEXT NOT NULL DEFAULT 'local_account_default',
      name TEXT NOT NULL DEFAULT 'Primary',
      relationship TEXT NOT NULL DEFAULT 'self',
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
      profile_id INTEGER,
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

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL DEFAULT '',
      frequency TEXT NOT NULL DEFAULT 'daily',
      time TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  safeAlterTable(db, `ALTER TABLE chat_messages ADD COLUMN image_uri TEXT;`);
  safeAlterTable(db, `ALTER TABLE profiles ADD COLUMN account_id TEXT NOT NULL DEFAULT 'local_account_default';`);
  safeAlterTable(db, `ALTER TABLE profiles ADD COLUMN name TEXT NOT NULL DEFAULT 'Primary';`);
  safeAlterTable(db, `ALTER TABLE profiles ADD COLUMN relationship TEXT NOT NULL DEFAULT 'self';`);
  safeAlterTable(db, `ALTER TABLE conversations ADD COLUMN profile_id INTEGER;`);
}

export * from "./repositories";
