import { UserProfile } from "@/lib/types";
import { useProfileStore } from "@/store/useProfileStore";

export interface ProfileSyncPayload {
  uid: string;
  profile: UserProfile;
}

/**
 * Syncs a locally updated profile to the remote cloud (Firestore).
 * When online, stores the document in `users/{uid}/profile/main`.
 * Marks the local SQLite record as 'synced'.
 */
export async function syncProfileToCloud(
  payload: ProfileSyncPayload,
  firestoreWriter?: (path: string, data: object) => Promise<void>
): Promise<boolean> {
  const { uid, profile } = payload;
  if (!uid || !profile) {
    return false;
  }

  try {
    if (firestoreWriter) {
      await firestoreWriter(`users/${uid}/profile/main`, {
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        healthIssues: profile.healthIssues,
        medications: profile.medications,
        allergies: profile.allergies,
        updatedAt: profile.updatedAt,
      });
    }

    // Mark local store & SQLite record as synced
    useProfileStore.getState().markSynced(uid);
    return true;
  } catch (error) {
    console.warn("Failed to sync profile to cloud:", error);
    return false;
  }
}
