import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uid: text("uid").notNull().unique(),
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

export type ProfileRecord = typeof profiles.$inferSelect;
export type InsertProfileRecord = typeof profiles.$inferInsert;
export type OutboxRecord = typeof syncOutbox.$inferSelect;
export type InsertOutboxRecord = typeof syncOutbox.$inferInsert;
