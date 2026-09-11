import { create } from "zustand";
import { UserProfile, SyncStatus } from "@/lib/types";
import {
  fetchLocalProfile,
  fetchProfilesByAccount,
  persistLocalProfile,
  deleteLocalProfile,
  enqueueOutbox,
} from "@/db/client";

const DEFAULT_ACCOUNT_ID = "local_account_default";

interface ProfileState {
  profiles: UserProfile[];
  activeProfileId: number | null;
  activeProfile: UserProfile | null;
  profile: UserProfile | null; // Backwards-compatible alias for activeProfile
  isLoading: boolean;
  syncStatus: SyncStatus;

  // Actions
  loadProfiles: (accountId?: string) => void;
  loadProfile: (uid: string) => void;
  setActiveProfile: (id: number) => void;
  saveProfile: (
    data: Partial<UserProfile> & {
      age?: number;
      gender?: string;
      heightCm?: number;
      weightKg?: number;
    }
  ) => Promise<UserProfile>;
  createProfile: (
    data: Omit<UserProfile, "id" | "updatedAt" | "syncStatus">
  ) => Promise<UserProfile>;
  deleteProfile: (id: number) => Promise<void>;
  markSynced: (uid: string) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  activeProfile: null,
  profile: null,
  isLoading: false,
  syncStatus: "synced",

  loadProfiles: (accountId = DEFAULT_ACCOUNT_ID) => {
    set({ isLoading: true });
    try {
      let list = fetchProfilesByAccount(accountId);
      if (list.length === 0) {
        // Check for legacy single-profile migration
        const legacy = fetchLocalProfile("local_user_default");
        if (legacy) {
          const migrated = persistLocalProfile({
            ...legacy,
            accountId,
            name: legacy.name || "Primary",
            relationship: legacy.relationship || "self",
          });
          list = [migrated];
        }
      }

      const active = list.length > 0 ? list[0] : null;
      set({
        profiles: list,
        activeProfileId: active?.id ?? null,
        activeProfile: active,
        profile: active,
        syncStatus: active?.syncStatus ?? "synced",
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadProfile: (uid: string) => {
    // Legacy support: loads by UID or switches to it
    set({ isLoading: true });
    try {
      const local = fetchLocalProfile(uid);
      if (local) {
        set((state) => {
          const exists = state.profiles.some((p) => p.id === local.id);
          const updatedProfiles = exists ? state.profiles : [...state.profiles, local];
          return {
            profiles: updatedProfiles,
            activeProfileId: local.id ?? null,
            activeProfile: local,
            profile: local,
            syncStatus: local.syncStatus,
            isLoading: false,
          };
        });
      } else {
        set({ activeProfile: null, profile: null, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveProfile: (id: number) => {
    const found = get().profiles.find((p) => p.id === id) || null;
    if (found) {
      set({
        activeProfileId: id,
        activeProfile: found,
        profile: found,
        syncStatus: found.syncStatus,
      });
    }
  },

  saveProfile: async (data) => {
    const current = get().activeProfile;
    const now = Date.now();

    const merged: UserProfile = {
      id: current?.id,
      uid: data.uid || current?.uid || `prof_${now}`,
      accountId: current?.accountId || DEFAULT_ACCOUNT_ID,
      name: data.name || current?.name || "Primary",
      relationship: data.relationship || current?.relationship || "self",
      age: data.age ?? (current?.age || 30),
      gender: data.gender ?? (current?.gender || "Other"),
      heightCm: data.heightCm ?? (current?.heightCm || 170),
      weightKg: data.weightKg ?? (current?.weightKg || 70),
      healthIssues: data.healthIssues ?? (current?.healthIssues || ""),
      medications: data.medications ?? (current?.medications || ""),
      allergies: data.allergies ?? (current?.allergies || ""),
      updatedAt: now,
      syncStatus: "pending",
    };

    const saved = persistLocalProfile(merged);
    const updatedList = get().profiles.map((p) =>
      p.id === saved.id ? saved : p
    );
    if (!updatedList.some((p) => p.id === saved.id)) {
      updatedList.push(saved);
    }

    set({
      profiles: updatedList,
      activeProfileId: saved.id ?? null,
      activeProfile: saved,
      profile: saved,
      syncStatus: "pending",
    });

    try {
      enqueueOutbox("PROFILE_SYNC", { uid: saved.uid, profile: saved });
    } catch (err) {
      console.warn("Outbox queue warning:", err);
    }

    return saved;
  },

  createProfile: async (data) => {
    const now = Date.now();
    const newProfile: UserProfile = {
      ...data,
      uid: data.uid || `prof_${now}`,
      accountId: data.accountId || DEFAULT_ACCOUNT_ID,
      updatedAt: now,
      syncStatus: "pending",
    };

    const saved = persistLocalProfile(newProfile);
    const updatedList = [...get().profiles, saved];

    set({
      profiles: updatedList,
      activeProfileId: saved.id ?? null,
      activeProfile: saved,
      profile: saved,
      syncStatus: "pending",
    });

    try {
      enqueueOutbox("PROFILE_SYNC", { uid: saved.uid, profile: saved });
    } catch (err) {
      console.warn("Outbox queue warning:", err);
    }

    return saved;
  },

  deleteProfile: async (id: number) => {
    deleteLocalProfile(id);
    const remaining = get().profiles.filter((p) => p.id !== id);
    const nextActive = remaining.length > 0 ? remaining[0] : null;

    set({
      profiles: remaining,
      activeProfileId: nextActive?.id ?? null,
      activeProfile: nextActive,
      profile: nextActive,
    });
  },

  markSynced: (uid: string) => {
    const updatedList = get().profiles.map((p) =>
      p.uid === uid ? { ...p, syncStatus: "synced" as SyncStatus } : p
    );
    const active = get().activeProfile;
    const nextActive =
      active && active.uid === uid
        ? { ...active, syncStatus: "synced" as SyncStatus }
        : active;

    set({
      profiles: updatedList,
      activeProfile: nextActive,
      profile: nextActive,
      syncStatus: nextActive?.syncStatus || "synced",
    });
  },

  clearProfile: () => {
    set({
      profiles: [],
      activeProfileId: null,
      activeProfile: null,
      profile: null,
      syncStatus: "synced",
    });
  },
}));
