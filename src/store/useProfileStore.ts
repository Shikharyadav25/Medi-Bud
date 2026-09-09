import { create } from "zustand";
import { UserProfile, SyncStatus } from "@/lib/types";
import {
  fetchLocalProfile,
  persistLocalProfile,
  enqueueOutbox,
} from "@/db/client";

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  syncStatus: SyncStatus;

  // Actions
  loadProfile: (uid: string) => void;
  saveProfile: (
    data: Omit<UserProfile, "updatedAt" | "syncStatus">
  ) => Promise<void>;
  markSynced: (uid: string) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  syncStatus: "synced",

  loadProfile: (uid: string) => {
    set({ isLoading: true });
    try {
      const local = fetchLocalProfile(uid);
      if (local) {
        set({
          profile: local,
          syncStatus: local.syncStatus,
          isLoading: false,
        });
      } else {
        set({ profile: null, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  saveProfile: async (data) => {
    const now = Date.now();
    const updated: UserProfile = {
      ...data,
      updatedAt: now,
      syncStatus: "pending",
    };

    // Optimistic UI update
    set({ profile: updated, syncStatus: "pending" });

    try {
      // 1. Write to local SQLite source of truth
      persistLocalProfile(updated);

      // 2. Enqueue to sync outbox
      enqueueOutbox("PROFILE_SYNC", {
        uid: updated.uid,
        profile: updated,
      });
    } catch (err) {
      set({ syncStatus: "failed" });
      throw err;
    }
  },

  markSynced: (uid: string) => {
    const current = get().profile;
    if (current && current.uid === uid) {
      const synced: UserProfile = { ...current, syncStatus: "synced" };
      persistLocalProfile(synced);
      set({ profile: synced, syncStatus: "synced" });
    }
  },

  clearProfile: () => {
    set({ profile: null, syncStatus: "synced" });
  },
}));
