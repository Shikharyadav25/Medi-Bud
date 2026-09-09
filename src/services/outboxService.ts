import {
  fetchPendingOutboxTasks,
  updateOutboxStatus,
} from "@/db/client";
import { OutboxTask, OutboxTaskType } from "@/lib/types";

export const MAX_OUTBOX_RETRIES = 5;

export type TaskHandler = (payload: any) => Promise<boolean>;

export interface SyncHandlers {
  [taskType: string]: TaskHandler;
}

/**
 * Processes all pending tasks in the SQLite outbox queue.
 * Dispatches to the registered handler for each task type.
 * Updates task status and tracks retry count with backoff.
 */
export async function processOutboxQueue(
  handlers: SyncHandlers
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const pendingTasks = fetchPendingOutboxTasks();
  let succeeded = 0;
  let failed = 0;

  for (const task of pendingTasks) {
    const handler = handlers[task.taskType];
    if (!handler) {
      updateOutboxStatus(
        task.id,
        "failed",
        `No handler registered for task type: ${task.taskType}`
      );
      failed++;
      continue;
    }

    try {
      updateOutboxStatus(task.id, "processing");
      const parsedPayload = JSON.parse(task.payload);
      const success = await handler(parsedPayload);

      if (success) {
        updateOutboxStatus(task.id, "completed");
        succeeded++;
      } else {
        handleTaskFailure(task, "Handler returned unsuccessful status");
        failed++;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      handleTaskFailure(task, errorMsg);
      failed++;
    }
  }

  return {
    processed: pendingTasks.length,
    succeeded,
    failed,
  };
}

function handleTaskFailure(task: OutboxTask, errorMsg: string): void {
  const newRetryCount = task.retryCount + 1;
  const status = newRetryCount >= MAX_OUTBOX_RETRIES ? "failed" : "pending";
  updateOutboxStatus(task.id, status, errorMsg);
}
