import { eq } from "drizzle-orm";
import { getDatabase } from "../client";
import * as schema from "../schema";
import { OutboxTask, OutboxTaskType, OutboxStatus } from "@/lib/types";

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
