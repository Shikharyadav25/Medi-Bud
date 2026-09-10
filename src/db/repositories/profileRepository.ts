import { eq } from "drizzle-orm";
import { getDatabase } from "../client";
import * as schema from "../schema";
import { UserProfile } from "@/lib/types";

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
