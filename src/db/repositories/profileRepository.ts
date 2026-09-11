import { eq } from "drizzle-orm";
import { getDatabase } from "../client";
import * as schema from "../schema";
import { UserProfile, FamilyRelationship } from "@/lib/types";

function mapRecordToProfile(row: schema.ProfileRecord): UserProfile {
  return {
    id: row.id,
    uid: row.uid,
    accountId: row.accountId || "local_account_default",
    name: row.name || "Primary",
    relationship: (row.relationship as FamilyRelationship) || "self",
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
  return mapRecordToProfile(records[0]);
}

export function fetchProfileById(id: number): UserProfile | null {
  const db = getDatabase();
  const records = db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.id, id))
    .all();

  if (!records || records.length === 0) {
    return null;
  }
  return mapRecordToProfile(records[0]);
}

export function fetchProfilesByAccount(accountId: string): UserProfile[] {
  const db = getDatabase();
  const records = db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.accountId, accountId))
    .all();

  return records.map(mapRecordToProfile);
}

export function persistLocalProfile(profile: UserProfile): UserProfile {
  const db = getDatabase();
  let existing = profile.id
    ? fetchProfileById(profile.id)
    : fetchLocalProfile(profile.uid);

  const payload = {
    uid: profile.uid || `prof_${Date.now()}`,
    accountId: profile.accountId || "local_account_default",
    name: profile.name || "Primary",
    relationship: profile.relationship || "self",
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

  if (existing && existing.id) {
    db.update(schema.profiles)
      .set(payload)
      .where(eq(schema.profiles.id, existing.id))
      .run();
    return { ...payload, id: existing.id } as UserProfile;
  } else {
    const result = db.insert(schema.profiles).values(payload).returning().all();
    if (result && result.length > 0) {
      return mapRecordToProfile(result[0]);
    }
    return { ...payload, id: Date.now() } as UserProfile;
  }
}

export function deleteLocalProfile(id: number): void {
  const db = getDatabase();
  db.delete(schema.profiles).where(eq(schema.profiles.id, id)).run();
}
