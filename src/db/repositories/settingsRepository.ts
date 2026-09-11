import { eq } from "drizzle-orm";
import { getDatabase } from "../client";
import * as schema from "../schema";
import { AppSettings } from "@/lib/types";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  lowDataMode: false,
  largerText: false,
  emergencyContact: null,
};

export function fetchSettings(): AppSettings {
  try {
    const db = getDatabase();
    const rows = db.select().from(schema.appSettingsTable).all();
    const map = new Map<string, string>();
    for (const r of rows) {
      map.set(r.key, r.value);
    }

    return {
      language: (map.get("language") as "en" | "hi") || DEFAULT_SETTINGS.language,
      lowDataMode: map.get("low_data_mode") === "true",
      largerText: map.get("larger_text") === "true",
      emergencyContact: map.get("emergency_contact")
        ? JSON.parse(map.get("emergency_contact")!)
        : null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function persistSetting(key: string, value: string): void {
  try {
    const db = getDatabase();
    db.insert(schema.appSettingsTable)
      .values({ key, value })
      .onConflictDoUpdate({
        target: schema.appSettingsTable.key,
        set: { value },
      })
      .run();
  } catch (error) {
    console.warn("Failed to persist setting:", key, error);
  }
}
