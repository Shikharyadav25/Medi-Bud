import {
  processOutboxQueue,
  MAX_OUTBOX_RETRIES,
  SyncHandlers,
} from "../src/services/outboxService";
import * as dbClient from "../src/db/client";
import { OutboxTask } from "../src/lib/types";

// Mock the db client
jest.mock("../src/db/client", () => ({
  fetchPendingOutboxTasks: jest.fn(),
  updateOutboxStatus: jest.fn(),
}));

describe("Sync Outbox Engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("processes pending task successfully and marks completed", async () => {
    const mockTask: OutboxTask = {
      id: "task_1",
      taskType: "PROFILE_SYNC",
      payload: JSON.stringify({ uid: "user_123", profile: { age: 30 } }),
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    (dbClient.fetchPendingOutboxTasks as jest.Mock).mockReturnValue([mockTask]);

    const mockHandler = jest.fn().mockResolvedValue(true);
    const handlers: SyncHandlers = {
      PROFILE_SYNC: mockHandler,
    };

    const result = await processOutboxQueue(handlers);

    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(0);

    expect(mockHandler).toHaveBeenCalledWith({
      uid: "user_123",
      profile: { age: 30 },
    });
    expect(dbClient.updateOutboxStatus).toHaveBeenCalledWith(
      "task_1",
      "processing"
    );
    expect(dbClient.updateOutboxStatus).toHaveBeenCalledWith(
      "task_1",
      "completed"
    );
  });

  test("handles task failure and increments retry count with pending status", async () => {
    const mockTask: OutboxTask = {
      id: "task_2",
      taskType: "PROFILE_SYNC",
      payload: JSON.stringify({ uid: "user_123" }),
      status: "pending",
      retryCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    (dbClient.fetchPendingOutboxTasks as jest.Mock).mockReturnValue([mockTask]);

    const mockHandler = jest.fn().mockRejectedValue(new Error("Network offline"));
    const handlers: SyncHandlers = {
      PROFILE_SYNC: mockHandler,
    };

    const result = await processOutboxQueue(handlers);

    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(0);
    expect(result.failed).toBe(1);

    expect(dbClient.updateOutboxStatus).toHaveBeenCalledWith(
      "task_2",
      "pending",
      "Network offline"
    );
  });

  test("marks task permanently failed after exceeding MAX_OUTBOX_RETRIES", async () => {
    const mockTask: OutboxTask = {
      id: "task_exhausted",
      taskType: "PROFILE_SYNC",
      payload: JSON.stringify({ uid: "user_123" }),
      status: "pending",
      retryCount: MAX_OUTBOX_RETRIES - 1, // Will reach MAX_OUTBOX_RETRIES
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    (dbClient.fetchPendingOutboxTasks as jest.Mock).mockReturnValue([mockTask]);

    const mockHandler = jest.fn().mockResolvedValue(false);
    const handlers: SyncHandlers = {
      PROFILE_SYNC: mockHandler,
    };

    const result = await processOutboxQueue(handlers);

    expect(result.failed).toBe(1);
    expect(dbClient.updateOutboxStatus).toHaveBeenCalledWith(
      "task_exhausted",
      "failed",
      "Handler returned unsuccessful status"
    );
  });
});
