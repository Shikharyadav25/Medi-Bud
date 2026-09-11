import { eq, and } from "drizzle-orm";
import { getDatabase } from "../client";
import * as schema from "../schema";
import { DietPreferences, DietType, CuisineType, ActivityLevel, HealthGoal } from "@/diet/types";

function mapRecordToPreferences(row: schema.DietPreferenceRecord): DietPreferences {
  return {
    profileId: row.profileId,
    dietType: row.dietType as DietType,
    cuisineType: row.cuisineType as CuisineType,
    activityLevel: row.activityLevel as ActivityLevel,
    primaryGoal: row.primaryGoal as HealthGoal,
    targetCalories: row.targetCalories,
    targetProtein: row.targetProtein,
    targetCarbs: row.targetCarbs,
    targetFats: row.targetFats,
    targetWaterL: row.targetWaterL,
    updatedAt: row.updatedAt,
  };
}

export function fetchDietPreferences(profileId: number): DietPreferences | null {
  const db = getDatabase();
  const records = db
    .select()
    .from(schema.dietPreferencesTable)
    .where(eq(schema.dietPreferencesTable.profileId, profileId))
    .all();

  if (!records || records.length === 0) {
    return null;
  }
  return mapRecordToPreferences(records[0]);
}

export function persistDietPreferences(prefs: DietPreferences): DietPreferences {
  const db = getDatabase();
  const existing = fetchDietPreferences(prefs.profileId);
  const now = Date.now();

  const payload = {
    profileId: prefs.profileId,
    dietType: prefs.dietType,
    cuisineType: prefs.cuisineType,
    activityLevel: prefs.activityLevel,
    primaryGoal: prefs.primaryGoal,
    targetCalories: prefs.targetCalories,
    targetProtein: prefs.targetProtein,
    targetCarbs: prefs.targetCarbs,
    targetFats: prefs.targetFats,
    targetWaterL: prefs.targetWaterL,
    updatedAt: now,
  };

  if (existing) {
    db.update(schema.dietPreferencesTable)
      .set(payload)
      .where(eq(schema.dietPreferencesTable.profileId, prefs.profileId))
      .run();
  } else {
    db.insert(schema.dietPreferencesTable).values(payload).run();
  }

  return { ...payload };
}

export function fetchDailyMealLogs(
  profileId: number,
  dateStr: string
): Record<string, boolean> {
  const db = getDatabase();
  const records = db
    .select()
    .from(schema.dietMealLogsTable)
    .where(
      and(
        eq(schema.dietMealLogsTable.profileId, profileId),
        eq(schema.dietMealLogsTable.date, dateStr)
      )
    )
    .all();

  const map: Record<string, boolean> = {};
  if (records) {
    records.forEach((row) => {
      map[row.mealType] = row.completed === 1;
    });
  }
  return map;
}

export function toggleMealLogAdherence(
  profileId: number,
  dateStr: string,
  mealType: string,
  mealId: string,
  completed: boolean
): void {
  const db = getDatabase();
  const existing = db
    .select()
    .from(schema.dietMealLogsTable)
    .where(
      and(
        eq(schema.dietMealLogsTable.profileId, profileId),
        eq(schema.dietMealLogsTable.date, dateStr),
        eq(schema.dietMealLogsTable.mealType, mealType)
      )
    )
    .all();

  const now = Date.now();
  if (existing && existing.length > 0) {
    db.update(schema.dietMealLogsTable)
      .set({
        completed: completed ? 1 : 0,
        mealId,
        loggedAt: now,
      })
      .where(eq(schema.dietMealLogsTable.id, existing[0].id))
      .run();
  } else {
    db.insert(schema.dietMealLogsTable)
      .values({
        profileId,
        date: dateStr,
        mealType,
        mealId,
        completed: completed ? 1 : 0,
        loggedAt: now,
      })
      .run();
  }
}
