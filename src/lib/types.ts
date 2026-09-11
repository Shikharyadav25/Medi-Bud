export type SyncStatus = "synced" | "pending" | "failed";
export type FamilyRelationship = "self" | "parent" | "child" | "spouse" | "other";

export interface UserProfile {
  id?: number;
  uid: string;
  accountId: string;
  name: string;
  relationship: FamilyRelationship;
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

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface AppSettings {
  language: "en" | "hi";
  lowDataMode: boolean;
  largerText: boolean;
  emergencyContact: EmergencyContact | null;
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
