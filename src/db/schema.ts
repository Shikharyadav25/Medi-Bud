import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uid: text("uid").notNull(),
  accountId: text("account_id").notNull().default("local_account_default"),
  name: text("name").notNull().default("Primary"),
  relationship: text("relationship").notNull().default("self"),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  healthIssues: text("health_issues").notNull().default(""),
  medications: text("medications").notNull().default(""),
  allergies: text("allergies").notNull().default(""),
  updatedAt: integer("updated_at").notNull(),
  syncStatus: text("sync_status").notNull().default("pending"),
});

export const syncOutbox = sqliteTable("sync_outbox", {
  id: text("id").primaryKey(),
  taskType: text("task_type").notNull(),
  payload: text("payload").notNull(),
  status: text("status").notNull().default("pending"),
  retryCount: integer("retry_count").notNull().default(0),
  lastError: text("last_error"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  profileId: integer("profile_id"),
  title: text("title").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  cardsJson: text("cards_json"),
  interactiveJson: text("interactive_json"),
  imageUri: text("image_uri"),
  source: text("source").notNull().default("cloud"),
  isOffline: integer("is_offline").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull().default(""),
  frequency: text("frequency").notNull().default("daily"),
  time: text("time").notNull(),
  active: integer("active").notNull().default(1),
  createdAt: integer("created_at").notNull(),
});

export const appSettingsTable = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const dietPreferencesTable = sqliteTable("diet_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull(),
  dietType: text("diet_type").notNull().default("veg"),
  cuisineType: text("cuisine_type").notNull().default("simple_home"),
  activityLevel: text("activity_level").notNull().default("sedentary"),
  primaryGoal: text("primary_goal").notNull().default("maintain"),
  targetCalories: integer("target_calories").notNull(),
  targetProtein: real("target_protein").notNull(),
  targetCarbs: real("target_carbs").notNull(),
  targetFats: real("target_fats").notNull(),
  targetWaterL: real("target_water_l").notNull().default(2.3),
  updatedAt: integer("updated_at").notNull(),
});

export const dietMealLogsTable = sqliteTable("diet_meal_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull(),
  date: text("date").notNull(),
  mealType: text("meal_type").notNull(),
  mealId: text("meal_id").notNull(),
  completed: integer("completed").notNull().default(0),
  loggedAt: integer("logged_at").notNull(),
});

export type ProfileRecord = typeof profiles.$inferSelect;
export type InsertProfileRecord = typeof profiles.$inferInsert;
export type OutboxRecord = typeof syncOutbox.$inferSelect;
export type InsertOutboxRecord = typeof syncOutbox.$inferInsert;
export type ConversationRecord = typeof conversations.$inferSelect;
export type InsertConversationRecord = typeof conversations.$inferInsert;
export type ChatMessageRecord = typeof chatMessages.$inferSelect;
export type InsertChatMessageRecord = typeof chatMessages.$inferInsert;
export type ReminderRecord = typeof reminders.$inferSelect;
export type InsertReminderRecord = typeof reminders.$inferInsert;
export type DietPreferenceRecord = typeof dietPreferencesTable.$inferSelect;
export type InsertDietPreferenceRecord = typeof dietPreferencesTable.$inferInsert;
export type DietMealLogRecord = typeof dietMealLogsTable.$inferSelect;
export type InsertDietMealLogRecord = typeof dietMealLogsTable.$inferInsert;

