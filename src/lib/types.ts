export type SyncStatus = "synced" | "pending" | "failed";

export interface UserProfile {
  id?: number;
  uid: string;
  age: number;
  gender: "Male" | "Female" | "Other" | string;
  heightCm: number;
  weightKg: number;
  healthIssues: string;
  medications: string;
  allergies: string;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export type OutboxTaskType =
  | "PROFILE_SYNC"
  | "SYMPTOM_EVAL"
  | "CHAT_MESSAGE";

export type OutboxStatus = "pending" | "processing" | "completed" | "failed";

export interface OutboxTask {
  id: string;
  taskType: OutboxTaskType;
  payload: string;
  status: OutboxStatus;
  retryCount: number;
  lastError?: string | null;
  createdAt: number;
  updatedAt: number;
}
