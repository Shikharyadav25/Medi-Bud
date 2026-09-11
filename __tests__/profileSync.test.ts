import { syncProfileToCloud, ProfileSyncPayload } from "../src/services/profileSync";

const mockMarkSynced = jest.fn();

jest.mock("../src/store/useProfileStore", () => ({
  useProfileStore: {
    getState: () => ({
      markSynced: mockMarkSynced,
    }),
  },
}));

describe("Profile Cloud Sync Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("syncs profile successfully to Firestore and marks local store synced", async () => {
    const mockWriter = jest.fn().mockResolvedValue(undefined);

    const payload: ProfileSyncPayload = {
      uid: "user_456",
      profile: {
        uid: "user_456",
        accountId: "test_account",
        name: "Test User",
        relationship: "self",
        age: 32,
        gender: "Female",
        heightCm: 165,
        weightKg: 58,
        healthIssues: "PCOS",
        medications: "Metformin",
        allergies: "None",
        updatedAt: 1700000000000,
        syncStatus: "pending",
      },
    };

    const success = await syncProfileToCloud(payload, mockWriter);

    expect(success).toBe(true);
    expect(mockWriter).toHaveBeenCalledWith("users/user_456/profile/main", {
      age: 32,
      gender: "Female",
      heightCm: 165,
      weightKg: 58,
      healthIssues: "PCOS",
      medications: "Metformin",
      allergies: "None",
      updatedAt: 1700000000000,
    });

    expect(mockMarkSynced).toHaveBeenCalledWith("user_456");
  });

  test("handles Firestore write failure gracefully", async () => {
    const mockWriter = jest.fn().mockRejectedValue(new Error("Permission denied"));

    const payload: ProfileSyncPayload = {
      uid: "user_fail",
      profile: {
        uid: "user_fail",
        accountId: "test_account",
        name: "Test User",
        relationship: "self",
        age: 40,
        gender: "Male",
        heightCm: 180,
        weightKg: 85,
        healthIssues: "",
        medications: "",
        allergies: "",
        updatedAt: 1700000000000,
        syncStatus: "pending",
      },
    };

    const success = await syncProfileToCloud(payload, mockWriter);
    expect(success).toBe(false);
  });
});
